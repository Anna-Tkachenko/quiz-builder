import { useState } from 'react'
import { Section } from './fields'
import { isImageValue, readImageFile } from '../lib/visual'

// 🧩 Editor for custom screens: an ordered element list. Each element edits
// inline; elements can be saved to the quiz's ELEMENT LIBRARY (named,
// pre-customized, reusable across screens — stored in the quiz JSON).

const ELEMENT_TYPES = [
  { key: 'badge', icon: '🏷', label: 'Badge', make: (id) => ({ id, type: 'badge', text: '✨ New badge' }) },
  { key: 'text', icon: '𝐓', label: 'Text', make: (id) => ({ id, type: 'text', style: 'paragraph', text: '' }) },
  { key: 'image', icon: '🖼', label: 'Image', make: (id) => ({ id, type: 'image', value: '', size: 'md', align: 'center' }) },
  { key: 'single', icon: '☝️', label: 'Choice (one)', make: (id) => ({ id, type: 'options', multi: false, layout: 'list', saveAs: id, options: [{ label: 'Option A', icon: '🅰️' }, { label: 'Option B', icon: '🅱️' }] }) },
  { key: 'multi', icon: '✅', label: 'Choice (many)', make: (id) => ({ id, type: 'options', multi: true, layout: 'list', saveAs: id, options: [{ label: 'Option A', icon: '🅰️' }, { label: 'Option B', icon: '🅱️' }] }) },
  { key: 'input', icon: '✍️', label: 'Text input', make: (id) => ({ id, type: 'input', inputType: 'text', placeholder: 'Type here…', saveAs: id }) },
  { key: 'email', icon: '✉️', label: 'Email input', make: (id) => ({ id, type: 'input', inputType: 'email', placeholder: 'you@example.com', saveAs: 'email', privacy: 'No spam, ever.' }) },
  { key: 'button', icon: '🔘', label: 'Button', make: (id) => ({ id, type: 'button', label: 'Continue' }) },
]

const elementMeta = (b) => {
  if (b.type === 'options') return { icon: b.multi ? '✅' : '☝️', label: b.multi ? 'Choice (many)' : 'Choice (one)' }
  if (b.type === 'input') return { icon: b.inputType === 'email' ? '✉️' : '✍️', label: b.inputType === 'email' ? 'Email input' : 'Text input' }
  return ELEMENT_TYPES.find((t) => t.key === b.type) || { icon: '❔', label: b.type }
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-medium outline-none focus:border-indigo-400'
const pill = (active) =>
  `flex-1 rounded-lg border py-1 text-[11px] font-bold transition-colors ${
    active ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
  }`

export default function CustomScreenEditor({ screen, patch, library, onLibraryChange }) {
  const blocks = screen.blocks || []
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const [showAdd, setShowAdd] = useState(false)
  const [savingId, setSavingId] = useState(null)
  const [saveName, setSaveName] = useState('')

  const newId = () => {
    let n = 1
    while (blocks.some((b) => b.id === `e${n}`)) n++
    return `e${n}`
  }

  const setBlocks = (next) => patch({ blocks: next })
  const patchBlock = (id, p) => setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...p } : b)))
  const move = (from, to) => {
    if (to < 0 || to >= blocks.length || from === to) return
    const next = [...blocks]
    const [x] = next.splice(from, 1)
    next.splice(to, 0, x)
    setBlocks(next)
  }

  const addElement = (block) => {
    setBlocks([...blocks, block])
    setShowAdd(false)
  }

  const saveToLibrary = (block) => {
    if (!saveName.trim()) return
    const def = { ...block }
    delete def.id
    onLibraryChange([...library, { id: `lib-${saveName.trim().toLowerCase().replace(/\s+/g, '-')}-${library.length + 1}`, name: saveName.trim(), element: def }])
    setSavingId(null)
    setSaveName('')
  }

  return (
    <Section title="Elements on this screen">
      {blocks.map((b, i) => {
        const meta = elementMeta(b)
        return (
          <div
            key={b.id}
            draggable
            onDragStart={() => setDragIdx(i)}
            onDragOver={(e) => { e.preventDefault(); setOverIdx(i) }}
            onDragLeave={() => setOverIdx((o) => (o === i ? null : o))}
            onDrop={() => { if (dragIdx !== null) move(dragIdx, i); setDragIdx(null); setOverIdx(null) }}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
            className={`rounded-xl border bg-white transition-shadow ${
              overIdx === i && dragIdx !== i ? 'border-indigo-300 ring-2 ring-indigo-200' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2.5 px-3 py-2">
              <span className="cursor-grab text-slate-300" title="Drag to reorder">⠿</span>
              <span className="w-5 text-center">{meta.icon}</span>
              <span className="flex-1 text-[12.5px] font-bold text-slate-700">{meta.label}</span>
              <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)}
                className="px-1 text-[10px] text-slate-300 hover:text-slate-600 disabled:opacity-30">▲</button>
              <button type="button" disabled={i === blocks.length - 1} onClick={() => move(i, i + 1)}
                className="px-1 text-[10px] text-slate-300 hover:text-slate-600 disabled:opacity-30">▼</button>
              <button type="button" title="Save to elements library"
                onClick={() => { setSavingId(savingId === b.id ? null : b.id); setSaveName('') }}
                className="px-1 text-[12px] text-slate-300 transition-colors hover:text-indigo-600">💾</button>
              <button type="button" title="Delete element"
                onClick={() => setBlocks(blocks.filter((x) => x.id !== b.id))}
                className="px-1 text-slate-300 transition-colors hover:text-rose-500">✕</button>
            </div>

            {savingId === b.id && (
              <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
                <input
                  autoFocus
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && saveToLibrary(b)}
                  placeholder="Name it — e.g. “Brand badge”, “NPS scale”"
                  className={inputCls}
                />
                <button type="button" onClick={() => saveToLibrary(b)} disabled={!saveName.trim()}
                  className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-30">
                  Save
                </button>
              </div>
            )}

            <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Width</span>
                <div className="flex flex-1 gap-1">
                  {[['full', '─ Full'], ['half', '◧ ½'], ['third', '⫿ ⅓']].map(([v, l]) => (
                    <button key={v} type="button"
                      onClick={() => patchBlock(b.id, { width: v === 'full' ? undefined : v })}
                      title={v === 'full' ? 'Own row' : 'Packs into a row with the neighbouring narrow elements'}
                      className={pill((b.width || 'full') === v)}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <ElementFields block={b} patchBlock={(p) => patchBlock(b.id, p)} />
            </div>
          </div>
        )
      })}

      {showAdd ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Element types</p>
          <div className="grid grid-cols-2 gap-1.5">
            {ELEMENT_TYPES.map((t) => (
              <button key={t.key} type="button" onClick={() => addElement(t.make(newId()))}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700">
                <span>{t.icon}</span> {t.label}
              </button>
            ))}
          </div>
          {library.length > 0 && (
            <>
              <p className="mb-2 mt-3 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                🧩 Your elements library
              </p>
              <div className="flex flex-col gap-1.5">
                {library.map((item) => (
                  <div key={item.id} className="flex items-center gap-1.5">
                    <button type="button"
                      onClick={() => {
                        const id = newId()
                        const el = { ...structuredClone(item.element), id }
                        // avoid variable collisions when reusing an element
                        if (el.saveAs && blocks.some((x) => x.saveAs === el.saveAs)) el.saveAs = id
                        addElement(el)
                      }}
                      className="flex flex-1 items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-2 text-[12px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-100">
                      <span>{elementMeta(item.element).icon}</span> {item.name}
                    </button>
                    <button type="button" title="Remove from library"
                      onClick={() => onLibraryChange(library.filter((x) => x.id !== item.id))}
                      className="px-1 text-slate-300 hover:text-rose-500">✕</button>
                  </div>
                ))}
              </div>
            </>
          )}
          <button type="button" onClick={() => setShowAdd(false)}
            className="mt-2 w-full rounded-lg py-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-600">
            Cancel
          </button>
        </div>
      ) : (
        <button type="button" onClick={() => setShowAdd(true)}
          className="rounded-xl border-2 border-dashed border-slate-200 py-2.5 text-[13px] font-bold text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600">
          + Add element
        </button>
      )}
    </Section>
  )
}

function ElementFields({ block: b, patchBlock }) {
  switch (b.type) {
    case 'badge':
      return <input type="text" value={b.text ?? ''} onChange={(e) => patchBlock({ text: e.target.value })} placeholder="Badge text" className={inputCls} />
    case 'text':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            {[['title', 'Title'], ['subtitle', 'Subtitle'], ['paragraph', 'Paragraph']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => patchBlock({ style: v })} className={pill((b.style || 'paragraph') === v)}>{l}</button>
            ))}
            <button type="button" onClick={() => patchBlock({ align: b.align === 'center' ? undefined : 'center' })}
              className={pill(b.align === 'center')} title="Center text">⏺ center</button>
          </div>
          <textarea value={b.text ?? ''} rows={2} onChange={(e) => patchBlock({ text: e.target.value })}
            placeholder="Text… ({{variables}} work)" className={inputCls + ' resize-y'} />
        </div>
      )
    case 'image':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {isImageValue(b.value) && <img src={b.value} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-cover" />}
            <input type="text" value={b.value ?? ''} onChange={(e) => patchBlock({ value: e.target.value })}
              placeholder="Image URL or emoji" className={inputCls} />
            <label className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600">
              🖼 File…
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { readImageFile(e.target.files?.[0], (v) => patchBlock({ value: v })); e.target.value = '' }} />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[['sm', 'S'], ['md', 'M'], ['lg', 'L'], ['full', 'Full']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => patchBlock({ size: v })} className={pill((b.size || 'md') === v)}>{l}</button>
              ))}
            </div>
            <div className="flex flex-1 gap-1">
              {[['left', '⬅'], ['center', '⏺'], ['right', '➡']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => patchBlock({ align: v })} className={pill((b.align || 'center') === v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )
    case 'options':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[['list', '☰ List'], ['grid', '▦ Grid'], ['cards', '🃏 Cards']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => patchBlock({ layout: v })} className={pill((b.layout || 'list') === v)}>{l}</button>
              ))}
            </div>
            <input type="text" value={b.saveAs ?? ''} onChange={(e) => patchBlock({ saveAs: e.target.value })}
              placeholder="variable" title="Save answer as variable" className={inputCls + ' max-w-[120px] font-mono text-[11px]'} />
          </div>
          {(b.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={opt.icon ?? ''} placeholder="🙂" title="Emoji or image URL"
                onChange={(e) => patchBlock({ options: b.options.map((o, j) => (j === i ? { ...o, icon: e.target.value } : o)) })}
                className="w-12 rounded-lg border border-slate-200 bg-white py-1.5 text-center text-[13px] outline-none focus:border-indigo-400" />
              <input type="text" value={opt.label ?? ''} placeholder="Option label"
                onChange={(e) => patchBlock({ options: b.options.map((o, j) => (j === i ? { ...o, label: e.target.value } : o)) })}
                className={inputCls} />
              <button type="button" onClick={() => patchBlock({ options: b.options.filter((_, j) => j !== i) })}
                className="px-1 text-slate-300 hover:text-rose-500">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => patchBlock({ options: [...(b.options || []), { label: '', icon: '' }] })}
            className="rounded-lg border-2 border-dashed border-slate-200 py-1.5 text-[11px] font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600">
            + Add option
          </button>
        </div>
      )
    case 'input':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[['text', '✍️ Text'], ['email', '✉️ Email']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => patchBlock({ inputType: v })} className={pill((b.inputType || 'text') === v)}>{l}</button>
              ))}
            </div>
            <input type="text" value={b.saveAs ?? ''} onChange={(e) => patchBlock({ saveAs: e.target.value })}
              placeholder="variable" title="Save answer as variable" className={inputCls + ' max-w-[120px] font-mono text-[11px]'} />
          </div>
          <input type="text" value={b.placeholder ?? ''} onChange={(e) => patchBlock({ placeholder: e.target.value })}
            placeholder="Placeholder text" className={inputCls} />
          {b.inputType === 'email' && (
            <input type="text" value={b.privacy ?? ''} onChange={(e) => patchBlock({ privacy: e.target.value })}
              placeholder="Privacy line (optional)" className={inputCls} />
          )}
        </div>
      )
    case 'button':
      return <input type="text" value={b.label ?? ''} onChange={(e) => patchBlock({ label: e.target.value })} placeholder="Button label" className={inputCls} />
    default:
      return null
  }
}

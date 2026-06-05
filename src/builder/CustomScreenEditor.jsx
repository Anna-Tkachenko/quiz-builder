import { useState } from 'react'
import { Section } from './fields'
import { ELEMENT_TYPES, elementMeta, elInputCls as inputCls, elPill as pill } from './elementMeta'
import { ElementFields } from './ElementFields'

// 🧩 Editor for custom screens: an ordered element list. Each element edits
// inline; elements can be saved to the quiz's ELEMENT LIBRARY (named,
// pre-customized, reusable across screens — stored in the quiz JSON).

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


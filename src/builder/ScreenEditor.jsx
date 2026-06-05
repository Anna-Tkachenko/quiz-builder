import { useState } from 'react'
import { TYPE_META } from './meta'
import { Section, TextField, AreaField, NumField, Field, VisualField } from './fields'

const LAYOUTS = [
  { value: 'list', label: 'List', pict: '☰' },
  { value: 'grid', label: 'Grid', pict: '▦' },
  { value: 'cards', label: 'Cards', pict: '🃏' },
]

import { interpolate } from '../quiz/engine'
import { isImageValue, readImageFile } from '../lib/visual'
import CustomScreenEditor from './CustomScreenEditor'
import { screenTitleOf } from './meta'

// Middle pane: edit the selected screen. Field set depends on screen.type.
export default function ScreenEditor({ screen, patch, screens = [], variantParam, variantCopy, library = [], onLibraryChange }) {
  const meta = TYPE_META[screen.type] || { icon: '❔', label: screen.type }
  const has = (k) => FIELD_MAP[screen.type]?.includes(k)

  // Variables a condition can reference, grouped for humans:
  // answers (shown with their question title) + link params.
  // Custom screens keep their saveAs inside element blocks.
  const seen = new Set()
  const answerVars = []
  for (const s of screens) {
    if (s.id === screen.id) continue
    const label = (screenTitleOf(s) || s.id).replace(/\{\{[^}]*\}\}/g, '…').replace(/\s+/g, ' ').trim().slice(0, 48)
    if (s.saveAs && !seen.has(s.saveAs) && seen.add(s.saveAs)) answerVars.push({ key: s.saveAs, label })
    for (const b of s.blocks || []) {
      if (b.saveAs && !seen.has(b.saveAs) && seen.add(b.saveAs)) answerVars.push({ key: b.saveAs, label })
    }
  }
  const paramVars = [
    ...new Set([variantParam, 'utm_source', 'utm_content', 'utm_campaign'].filter(Boolean)),
  ].filter((k) => !seen.has(k))
  const vars = { answers: answerVars, params: paramVars, first: answerVars[0]?.key ?? paramVars[0] ?? '' }

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h2 className="text-[15px] font-extrabold text-slate-800">{meta.label}</h2>
          <p className="font-mono text-[11px] text-slate-400">id: {screen.id}</p>
        </div>
      </div>

      {screen.type !== 'custom' && (
        <Section title="Content">
          {has('badge') && <TextField label="Badge" value={screen.badge} onChange={(v) => patch({ badge: v })} />}
          {has('emoji') && <VisualField label="Visual (emoji, image URL, or pick a file)" value={screen.emoji} onChange={(v) => patch({ emoji: v })} />}
          <AreaField label="Title  (supports {{variables}})" rows={2} value={screen.title} onChange={(v) => patch({ title: v })} />
          {has('subtitle') && <AreaField label="Subtitle" rows={2} value={screen.subtitle} onChange={(v) => patch({ subtitle: v })} />}
          {has('text') && <AreaField label="Text" rows={3} value={screen.text} onChange={(v) => patch({ text: v })} />}
          {has('hint') && <TextField label="Hint" value={screen.hint} onChange={(v) => patch({ hint: v })} />}
          {has('placeholder') && <TextField label="Placeholder" value={screen.placeholder} onChange={(v) => patch({ placeholder: v })} />}
          {has('privacy') && <AreaField label="Privacy line" rows={2} value={screen.privacy} onChange={(v) => patch({ privacy: v })} />}
          {has('cta') && <TextField label="Button label" value={screen.cta} onChange={(v) => patch({ cta: v })} />}
        </Section>
      )}

      {screen.type === 'custom' && (
        <CustomScreenEditor
          screen={screen}
          patch={patch}
          library={library}
          onLibraryChange={onLibraryChange}
        />
      )}

      {has('blocks') && <BlocksEditor screen={screen} patch={patch} />}

      {has('layout') && (
        <Section title="Layout">
          <div className="flex gap-2">
            {LAYOUTS.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => patch({ layout: l.value })}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl border-2 py-3 text-[12px] font-bold transition-colors ${
                  (screen.layout || 'list') === l.value
                    ? 'border-indigo-400 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                }`}
              >
                <span className="text-xl">{l.pict}</span>
                {l.label}
              </button>
            ))}
          </div>
        </Section>
      )}

      {has('options') && <OptionsEditor screen={screen} patch={patch} />}

      {has('options') && (
        <FlowEditor screen={screen} screens={screens} patch={patch} variantCopy={variantCopy} />
      )}

      {/* custom screens branch on their first choice element */}
      {screen.type === 'custom' && (() => {
        const optBlock = (screen.blocks || []).find((b) => b.type === 'options')
        if (!optBlock) return null
        return (
          <FlowEditor
            screen={{ ...screen, saveAs: optBlock.saveAs, options: optBlock.options, type: optBlock.multi ? 'multi-select' : 'single-select' }}
            screens={screens}
            patch={patch}
            variantCopy={variantCopy}
          />
        )
      })()}

      {has('steps') && (
        <Section title="Loader">
          <NumField label="Delay (ms)" value={screen.delayMs} onChange={(v) => patch({ delayMs: v })} />
          <AreaField
            label="Steps (one per line)"
            rows={4}
            value={(screen.steps || []).join('\n')}
            onChange={(v) => patch({ steps: v.split('\n').filter((s) => s.trim()) })}
          />
        </Section>
      )}

      {has('items') && <ItemsEditor screen={screen} patch={patch} />}

      {has('saveAs') && (
        <Section title="Data">
          <TextField
            label="Save answer as variable  (reuse via {{name}})"
            value={screen.saveAs}
            onChange={(v) => patch({ saveAs: v })}
            mono
          />
        </Section>
      )}

      <VisibilityEditor screen={screen} patch={patch} vars={vars} screens={screens} />

      {screen.type === 'message' && (
        <ConditionalTextEditor screen={screen} patch={patch} vars={vars} screens={screens} />
      )}

      <details className="mt-2 mb-6 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
        <summary className="cursor-pointer text-[12px] font-bold text-slate-400 select-none">
          ⚙️ Advanced logic (JSON) — for developers
        </summary>
        <div className="pt-3">
          <LogicEditor screen={screen} patch={patch} />
        </div>
      </details>
    </div>
  )
}

// Screen layout: drag (or ▲▼) the content blocks into the order they should
// render. The visual/image blocks get size + position controls, and any
// screen can take extra text/image blocks via "+ Add block".
function SizeAlignControls({ size, align, onSize, onAlign }) {
  const pill = (active) =>
    `flex-1 rounded-lg border py-1 text-[11px] font-bold transition-colors ${
      active ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
    }`
  return (
    <div className="flex items-center gap-3 border-t border-slate-100 px-3 py-2">
      <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Size</span>
      <div className="flex flex-1 gap-1">
        {[['sm', 'S'], ['md', 'M'], ['lg', 'L'], ['full', 'Full']].map(([v, l]) => (
          <button key={v} type="button" onClick={() => onSize(v)} className={pill(size === v)}>{l}</button>
        ))}
      </div>
      <span className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">Position</span>
      <div className="flex flex-1 gap-1">
        {[['left', '⬅'], ['center', '⏺'], ['right', '➡']].map(([v, l]) => (
          <button key={v} type="button" onClick={() => onAlign(v)} className={pill(align === v)} title={v}>{l}</button>
        ))}
      </div>
    </div>
  )
}

function BlocksEditor({ screen, patch }) {
  const supported = BLOCK_MAP[screen.type] || []
  const extras = screen.extraBlocks || []
  const extraKeys = extras.map((b) => `x:${b.id}`)
  const declared = (screen.blockOrder || []).filter(
    (k) => supported.includes(k) || extraKeys.includes(k)
  )
  const order = [
    ...declared,
    ...supported.filter((k) => !declared.includes(k)),
    ...extraKeys.filter((k) => !declared.includes(k)),
  ]
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const fileFor = useState({})[0] // id -> input element

  const move = (from, to) => {
    if (to < 0 || to >= order.length || from === to) return
    const next = [...order]
    const [x] = next.splice(from, 1)
    next.splice(to, 0, x)
    patch({ blockOrder: next })
  }

  const patchExtra = (id, p) =>
    patch({ extraBlocks: extras.map((b) => (b.id === id ? { ...b, ...p } : b)) })

  const addExtra = (type) => {
    let n = 1
    while (extras.some((b) => b.id === `b${n}`)) n++
    const id = `b${n}`
    patch({
      extraBlocks: [...extras, { id, type, value: '' }],
      blockOrder: [...order, `x:${id}`],
    })
  }

  const deleteExtra = (id) =>
    patch({
      extraBlocks: extras.filter((b) => b.id !== id),
      blockOrder: order.filter((k) => k !== `x:${id}`),
    })

  if (supported.length < 2) return null

  const inputCls =
    'w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-medium outline-none focus:border-indigo-400'

  return (
    <Section title="Screen layout (drag blocks to reorder)">
      {order.map((key, i) => {
        const extra = key.startsWith('x:') ? extras.find((b) => `x:${b.id}` === key) : null
        if (key.startsWith('x:') && !extra) return null
        const meta = extra
          ? { icon: extra.type === 'image' ? '🖼' : '¶', label: extra.type === 'image' ? 'Image block' : 'Text block' }
          : BLOCK_META[key]
        const filled = extra ? !!extra.value : !!screen[meta.field]
        return (
          <div
            key={key}
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
              <span className={`flex-1 text-[12.5px] font-bold ${filled ? 'text-slate-700' : 'text-slate-300'}`}>
                {meta.label}
                {!filled && !extra && <span className="ml-1.5 font-medium">(empty — fill it in Content above)</span>}
              </span>
              <button type="button" disabled={i === 0} onClick={() => move(i, i - 1)}
                className="px-1 text-[10px] text-slate-300 hover:text-slate-600 disabled:opacity-30">▲</button>
              <button type="button" disabled={i === order.length - 1} onClick={() => move(i, i + 1)}
                className="px-1 text-[10px] text-slate-300 hover:text-slate-600 disabled:opacity-30">▼</button>
              {extra && (
                <button type="button" title="Delete block" onClick={() => deleteExtra(extra.id)}
                  className="px-1 text-slate-300 transition-colors hover:text-rose-500">✕</button>
              )}
            </div>

            {/* inline value editor for extra blocks */}
            {extra && extra.type === 'text' && (
              <div className="border-t border-slate-100 px-3 py-2">
                <textarea
                  value={extra.value}
                  rows={2}
                  onChange={(e) => patchExtra(extra.id, { value: e.target.value })}
                  placeholder="Extra text… ({{variables}} work here too)"
                  className={inputCls + ' resize-y'}
                />
              </div>
            )}
            {extra && extra.type === 'image' && (
              <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-2">
                {isImageValue(extra.value) && (
                  <img src={extra.value} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-cover" />
                )}
                <input
                  type="text"
                  value={extra.value}
                  onChange={(e) => patchExtra(extra.id, { value: e.target.value })}
                  placeholder="Image URL or emoji"
                  className={inputCls}
                />
                <label className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600">
                  🖼 File…
                  <input
                    ref={(el) => { fileFor[extra.id] = el }}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      readImageFile(e.target.files?.[0], (dataUri) => patchExtra(extra.id, { value: dataUri }))
                      e.target.value = ''
                    }}
                  />
                </label>
              </div>
            )}

            {key === 'visual' && filled && (
              <SizeAlignControls
                size={screen.visualSize || 'md'}
                align={screen.visualAlign || ''}
                onSize={(v) => patch({ visualSize: v })}
                onAlign={(v) => patch({ visualAlign: v })}
              />
            )}
            {extra && extra.type === 'image' && filled && (
              <SizeAlignControls
                size={extra.size || 'md'}
                align={extra.align || ''}
                onSize={(v) => patchExtra(extra.id, { size: v })}
                onAlign={(v) => patchExtra(extra.id, { align: v })}
              />
            )}
          </div>
        )
      })}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => addExtra('text')}
          className="flex-1 rounded-xl border-2 border-dashed border-slate-200 py-2 text-[12px] font-bold text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
        >
          + Add text block
        </button>
        <button
          type="button"
          onClick={() => addExtra('image')}
          className="flex-1 rounded-xl border-2 border-dashed border-slate-200 py-2 text-[12px] font-bold text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
        >
          + Add image block
        </button>
      </div>
    </Section>
  )
}

const OPS = [
  ['eq', 'is'],
  ['neq', 'is not'],
  ['contains', 'includes'],
  ['exists', 'has any value'],
]

// One condition as a sentence: [answer ▾] [is ▾] [value].
// The variable picker is grouped: answers show their question title,
// link params show as ?param=.
function ConditionEditor({ cond, onChange, vars, screens }) {
  const c = cond || { var: vars.first, op: 'eq', value: '' }
  const set = (p) => onChange({ ...c, ...p })
  // suggest the answer options of the screen that saves this variable
  const sourceScreen = screens.find((s) => s.saveAs === c.var && s.options)
  const listId = `cond-values-${c.var}`
  const known =
    vars.answers.some((v) => v.key === c.var) || vars.params.includes(c.var)
  const sel =
    'rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-semibold text-slate-600 outline-none focus:border-indigo-400'

  return (
    <div className="flex items-center gap-2">
      <select value={c.var} onChange={(e) => set({ var: e.target.value })} className={sel + ' max-w-[240px]'}>
        {!known && c.var && <option value={c.var}>{c.var}</option>}
        {vars.answers.length > 0 && (
          <optgroup label="Answer to a question">
            {vars.answers.map((v) => (
              <option key={v.key} value={v.key}>“{v.label}” ({v.key})</option>
            ))}
          </optgroup>
        )}
        {vars.params.length > 0 && (
          <optgroup label="From the link (URL param)">
            {vars.params.map((k) => (
              <option key={k} value={k}>?{k}=</option>
            ))}
          </optgroup>
        )}
      </select>
      <select value={c.op} onChange={(e) => set({ op: e.target.value })} className={sel}>
        {OPS.map(([op, label]) => (
          <option key={op} value={op}>{label}</option>
        ))}
      </select>
      {c.op !== 'exists' && (
        <>
          <input
            type="text"
            value={c.value ?? ''}
            onChange={(e) => set({ value: e.target.value })}
            placeholder="value"
            list={sourceScreen ? listId : undefined}
            className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-semibold outline-none focus:border-indigo-400"
          />
          {sourceScreen && (
            <datalist id={listId}>
              {sourceScreen.options.map((o, i) => (
                <option key={i} value={o.value ?? o.label} />
              ))}
            </datalist>
          )}
        </>
      )}
    </div>
  )
}

// "Always show" vs "Only show when <condition>" — compiles to `show` (C3).
function VisibilityEditor({ screen, patch, vars, screens }) {
  const conditional = !!screen.show
  return (
    <Section title="Visibility">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => patch({ show: undefined })}
          className={`flex-1 rounded-xl border-2 py-2 text-[12px] font-bold transition-colors ${
            !conditional ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'
          }`}
        >
          Always show
        </button>
        <button
          type="button"
          onClick={() => !conditional && patch({ show: { var: vars.first, op: 'eq', value: '' } })}
          className={`flex-1 rounded-xl border-2 py-2 text-[12px] font-bold transition-colors ${
            conditional ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500'
          }`}
        >
          Only show when…
        </button>
      </div>
      {conditional && (
        <>
          <ConditionEditor cond={screen.show} onChange={(c) => patch({ show: c })} vars={vars} screens={screens} />
          <p className="text-[11px] leading-relaxed text-slate-400">
            Users who don’t match skip this screen automatically — combine with the Flow
            dropdowns on a question to send only some answers here.
          </p>
        </>
      )}
    </Section>
  )
}

// Per-condition text variants for message screens (C7). First match wins;
// the default Text above shows otherwise.
function ConditionalTextEditor({ screen, patch, vars, screens }) {
  const list = screen.conditionalText || []
  const update = (i, p) =>
    patch({ conditionalText: list.map((r, j) => (j === i ? { ...r, ...p } : r)) })

  return (
    <Section title="Reactive text (responds to an earlier answer)">
      {list.map((row, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400">When</span>
            <button
              type="button"
              onClick={() => patch({ conditionalText: list.filter((_, j) => j !== i) || undefined })}
              className="text-slate-300 transition-colors hover:text-rose-500"
            >
              ✕
            </button>
          </div>
          <ConditionEditor cond={row.when} onChange={(c) => update(i, { when: c })} vars={vars} screens={screens} />
          <textarea
            value={row.text ?? ''}
            rows={2}
            onChange={(e) => update(i, { text: e.target.value })}
            placeholder="…show this text instead"
            className="mt-2 w-full resize-y rounded-lg border border-slate-200 px-2 py-1.5 text-[12px] font-medium outline-none focus:border-indigo-400"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          patch({
            conditionalText: [...list, { when: { var: vars.first, op: 'eq', value: '' }, text: '' }],
          })
        }
        className="rounded-xl border-2 border-dashed border-slate-200 py-2 text-[12px] font-bold text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
      >
        + Add reactive text
      </button>
      {list.length > 0 && (
        <p className="text-[11px] leading-relaxed text-slate-400">
          The first matching rule wins. If none match, the default Text above is shown.
        </p>
      )}
    </Section>
  )
}

const FIELD_MAP = {
  hero: ['badge', 'emoji', 'subtitle', 'cta', 'blocks'],
  'single-select': ['emoji', 'subtitle', 'layout', 'options', 'saveAs', 'blocks'],
  'multi-select': ['emoji', 'subtitle', 'hint', 'layout', 'options', 'saveAs', 'cta', 'blocks'],
  message: ['emoji', 'text', 'cta', 'blocks'],
  loader: ['steps'],
  text: ['emoji', 'subtitle', 'placeholder', 'saveAs', 'cta', 'blocks'],
  email: ['emoji', 'subtitle', 'placeholder', 'privacy', 'saveAs', 'cta', 'blocks'],
  result: ['emoji', 'subtitle', 'items', 'cta', 'blocks'],
}

// Which content blocks a screen type composes, in default order.
const BLOCK_MAP = {
  hero: ['visual', 'title', 'subtitle'],
  'single-select': ['visual', 'title', 'subtitle'],
  'multi-select': ['visual', 'title', 'subtitle'],
  message: ['visual', 'title', 'text'],
  text: ['visual', 'title', 'subtitle'],
  email: ['visual', 'title', 'subtitle'],
  result: ['visual', 'title', 'subtitle'],
}

const BLOCK_META = {
  visual: { icon: '🖼', label: 'Visual (emoji / image)', field: 'emoji' },
  title: { icon: '𝐓', label: 'Title', field: 'title' },
  subtitle: { icon: '≡', label: 'Subtitle', field: 'subtitle' },
  text: { icon: '¶', label: 'Text', field: 'text' },
}

function OptionsEditor({ screen, patch }) {
  const options = screen.options || []
  const update = (i, p) =>
    patch({ options: options.map((o, j) => (j === i ? { ...o, ...p } : o)) })

  return (
    <Section title="Answer options">
      {options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={opt.icon ?? ''}
            onChange={(e) => update(i, { icon: e.target.value })}
            placeholder="🙂"
            title="Emoji icon — or paste an image URL"
            className="w-12 rounded-xl border border-slate-200 bg-white px-0 py-2 text-center text-[15px] outline-none focus:border-indigo-400"
          />
          <input
            type="text"
            value={opt.label ?? ''}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Option label"
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium outline-none focus:border-indigo-400"
          />
          <button
            type="button"
            title="Remove option"
            onClick={() => patch({ options: options.filter((_, j) => j !== i) })}
            className="px-1 text-slate-300 transition-colors hover:text-rose-500"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => patch({ options: [...options, { label: '', icon: '' }] })}
        className="rounded-xl border-2 border-dashed border-slate-200 py-2 text-[12px] font-bold text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
      >
        + Add option
      </button>
    </Section>
  )
}

function ItemsEditor({ screen, patch }) {
  const items = screen.items || []
  const update = (i, p) => patch({ items: items.map((o, j) => (j === i ? { ...o, ...p } : o)) })
  return (
    <Section title="Summary rows">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text" value={item.label ?? ''} placeholder="Label"
            onChange={(e) => update(i, { label: e.target.value })}
            className="w-1/3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-indigo-400"
          />
          <input
            type="text" value={item.value ?? ''} placeholder="Value ({{vars}} ok)"
            onChange={(e) => update(i, { value: e.target.value })}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-indigo-400"
          />
          <button type="button" onClick={() => patch({ items: items.filter((_, j) => j !== i) })}
            className="px-1 text-slate-300 hover:text-rose-500">✕</button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => patch({ items: [...items, { label: '', value: '' }] })}
        className="rounded-xl border-2 border-dashed border-slate-200 py-2 text-[12px] font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
      >
        + Add row
      </button>
    </Section>
  )
}

// Answer-based flow: per-answer "→ then go to" targets, compiled to the
// engine's conditional `next` rules. Leave everything on "Next in order"
// for a linear quiz; pick targets to branch. Single-select branches on
// equality, multi-select on "selection includes".
function FlowEditor({ screen, screens, patch, variantCopy }) {
  const saveAs = screen.saveAs
  const op = screen.type === 'multi-select' ? 'contains' : 'eq'
  const options = screen.options || []
  const targets = screens.filter((s) => s.id !== screen.id)
  // human-readable target label: icon + question/screen title
  const targetLabel = (s) => {
    const title = interpolate(s.title, {}, variantCopy).replace(/\s+/g, ' ').trim()
    return `${TYPE_META[s.type]?.icon ?? ''} ${title.slice(0, 44) || s.id}`
  }

  // decompile current rules into per-answer map + fallback
  const rules = Array.isArray(screen.next)
    ? screen.next
    : typeof screen.next === 'string'
      ? [{ goto: screen.next }]
      : []
  const perAnswer = {}
  let defaultGoto = ''
  for (const r of rules) {
    if (r.when && r.when.var === saveAs && r.when.op === op) perAnswer[r.when.value] = r.goto
    else if (!r.when && r.goto) defaultGoto = r.goto
  }

  const compile = (po, dg) => {
    const out = []
    for (const o of options) {
      const v = o.value ?? o.label
      if (po[v]) out.push({ when: { var: saveAs, op, value: v }, goto: po[v] })
    }
    if (dg) out.push({ goto: dg })
    patch({ next: out.length ? out : undefined })
  }

  const setAnswerGoto = (value, goto) => {
    const po = { ...perAnswer }
    if (goto) po[value] = goto
    else delete po[value]
    compile(po, defaultGoto)
  }

  if (!saveAs) {
    return (
      <Section title="Flow (answer-based branching)">
        <p className="text-[12px] text-slate-400">
          Set a variable name in the Data section first — branching matches on the saved answer.
        </p>
      </Section>
    )
  }

  const sel =
    'rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-semibold text-slate-600 outline-none focus:border-indigo-400'

  return (
    <Section title="Flow (answer-based branching)">
      {options.map((opt, i) => {
        const v = opt.value ?? opt.label
        return (
          <div key={i} className="flex items-center gap-2">
            <span className="w-1/2 truncate text-[13px] font-semibold text-slate-600">
              {opt.icon && <span className="mr-1.5">{opt.icon}</span>}
              {opt.label || '—'}
            </span>
            <span className="text-slate-300">→</span>
            <select
              value={perAnswer[v] ?? ''}
              onChange={(e) => setAnswerGoto(v, e.target.value)}
              className={sel + ' flex-1'}
            >
              <option value="">Next in order</option>
              {targets.map((s) => (
                <option key={s.id} value={s.id}>{targetLabel(s)}</option>
              ))}
            </select>
          </div>
        )
      })}
      <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
        <span className="w-1/2 text-[13px] font-semibold text-slate-400">Otherwise</span>
        <span className="text-slate-300">→</span>
        <select
          value={defaultGoto}
          onChange={(e) => compile(perAnswer, e.target.value)}
          className={sel + ' flex-1'}
        >
          <option value="">Next in order</option>
          {targets.map((s) => (
            <option key={s.id} value={s.id}>{targetLabel(s)}</option>
          ))}
        </select>
      </div>
      <p className="text-[11px] leading-relaxed text-slate-400">
        💡 Tip: a target screen with a <code>show</code> condition is auto-skipped for users who
        don’t match it — that’s how “extra screens for some answers” work.
      </p>
    </Section>
  )
}

// Advanced logic as editable JSON: `show` (skip) + `next` (branch) +
// `conditionalText` (reactive messages). Full engine power, minimal UI.
function LogicEditor({ screen, patch }) {
  const logic = {}
  if (screen.show !== undefined) logic.show = screen.show
  if (screen.next !== undefined) logic.next = screen.next
  if (screen.conditionalText !== undefined) logic.conditionalText = screen.conditionalText

  const [draft, setDraft] = useState(null)
  const [error, setError] = useState(null)
  const shown = draft ?? (Object.keys(logic).length ? JSON.stringify(logic, null, 2) : '')

  const apply = (value) => {
    setDraft(value)
    if (!value.trim()) {
      setError(null)
      patch({ show: undefined, next: undefined, conditionalText: undefined })
      return
    }
    try {
      const parsed = JSON.parse(value)
      setError(null)
      patch({
        show: parsed.show,
        next: parsed.next,
        conditionalText: parsed.conditionalText,
      })
    } catch {
      setError('Invalid JSON — not applied yet')
    }
  }

  return (
    <Section title="Raw rules (show / next / conditionalText)">
      <Field label='e.g. {"show": {"var":"experience","op":"eq","value":"Never"}}'>
        <textarea
          value={shown}
          rows={Object.keys(logic).length ? 8 : 3}
          onChange={(e) => apply(e.target.value)}
          onBlur={() => setDraft(null)}
          placeholder="No logic on this screen"
          spellCheck={false}
          className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-[11.5px] leading-relaxed text-slate-700 outline-none focus:border-indigo-400"
        />
      </Field>
      {error && <p className="text-[12px] font-bold text-amber-600">⚠️ {error}</p>}
    </Section>
  )
}

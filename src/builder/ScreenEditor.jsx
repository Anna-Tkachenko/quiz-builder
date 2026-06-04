import { useState } from 'react'
import { TYPE_META } from './meta'
import { Section, TextField, AreaField, NumField, Field } from './fields'

const LAYOUTS = [
  { value: 'list', label: 'List', pict: '☰' },
  { value: 'grid', label: 'Grid', pict: '▦' },
  { value: 'cards', label: 'Cards', pict: '🃏' },
]

// Middle pane: edit the selected screen. Field set depends on screen.type.
export default function ScreenEditor({ screen, patch, screens = [] }) {
  const meta = TYPE_META[screen.type] || { icon: '❔', label: screen.type }
  const has = (k) => FIELD_MAP[screen.type]?.includes(k)

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="text-2xl">{meta.icon}</span>
        <div>
          <h2 className="text-[15px] font-extrabold text-slate-800">{meta.label}</h2>
          <p className="font-mono text-[11px] text-slate-400">id: {screen.id}</p>
        </div>
      </div>

      <Section title="Content">
        {has('badge') && <TextField label="Badge" value={screen.badge} onChange={(v) => patch({ badge: v })} />}
        {has('emoji') && <TextField label="Emoji / visual" value={screen.emoji} onChange={(v) => patch({ emoji: v })} placeholder="💡" />}
        <AreaField label="Title  (supports {{variables}})" rows={2} value={screen.title} onChange={(v) => patch({ title: v })} />
        {has('subtitle') && <AreaField label="Subtitle" rows={2} value={screen.subtitle} onChange={(v) => patch({ subtitle: v })} />}
        {has('text') && <AreaField label="Text" rows={3} value={screen.text} onChange={(v) => patch({ text: v })} />}
        {has('hint') && <TextField label="Hint" value={screen.hint} onChange={(v) => patch({ hint: v })} />}
        {has('placeholder') && <TextField label="Placeholder" value={screen.placeholder} onChange={(v) => patch({ placeholder: v })} />}
        {has('privacy') && <AreaField label="Privacy line" rows={2} value={screen.privacy} onChange={(v) => patch({ privacy: v })} />}
        {has('cta') && <TextField label="Button label" value={screen.cta} onChange={(v) => patch({ cta: v })} />}
      </Section>

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

      {has('options') && <FlowEditor screen={screen} screens={screens} patch={patch} />}

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

      <LogicEditor screen={screen} patch={patch} />
    </div>
  )
}

const FIELD_MAP = {
  hero: ['badge', 'emoji', 'subtitle', 'cta'],
  'single-select': ['subtitle', 'layout', 'options', 'saveAs'],
  'multi-select': ['subtitle', 'hint', 'layout', 'options', 'saveAs', 'cta'],
  message: ['emoji', 'text', 'cta'],
  loader: ['steps'],
  text: ['subtitle', 'placeholder', 'saveAs', 'cta'],
  email: ['subtitle', 'placeholder', 'privacy', 'saveAs', 'cta'],
  result: ['emoji', 'subtitle', 'items', 'cta'],
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
            title="Emoji icon"
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
function FlowEditor({ screen, screens, patch }) {
  const saveAs = screen.saveAs
  const op = screen.type === 'multi-select' ? 'contains' : 'eq'
  const options = screen.options || []
  const targets = screens.filter((s) => s.id !== screen.id)

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
                <option key={s.id} value={s.id}>{s.id}</option>
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
            <option key={s.id} value={s.id}>{s.id}</option>
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
    <Section title="Logic (branch / skip / conditional copy)">
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

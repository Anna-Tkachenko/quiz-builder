// Small form primitives shared by the editor panes.

import { useRef } from 'react'
import { isImageValue } from '../lib/visual'

// Emoji OR image: type an emoji, paste an image URL, or pick a local file
// (downscaled client-side and stored inside the quiz JSON as a data URI —
// no upload server needed).
export function VisualField({ label, value, onChange }) {
  const fileRef = useRef(null)

  const pickFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const MAX = 512
        const scale = Math.min(1, MAX / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * scale)
        canvas.height = Math.round(img.height * scale)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        const type = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
        onChange(canvas.toDataURL(type, 0.85))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        {isImageValue(value) && (
          <img src={value} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-slate-200 object-cover" />
        )}
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="💡 emoji — or paste an image URL"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-indigo-400"
        />
        <button
          type="button"
          title="Pick an image file (stored inside the quiz, no server)"
          onClick={() => fileRef.current?.click()}
          className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
        >
          🖼 Image…
        </button>
        {value && (
          <button
            type="button"
            title="Clear"
            onClick={() => onChange('')}
            className="shrink-0 px-1 text-slate-300 transition-colors hover:text-rose-500"
          >
            ✕
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={pickFile} className="hidden" />
      </div>
    </Field>
  )
}

export function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="mb-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-bold text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-medium text-slate-800 outline-none transition-colors placeholder:text-slate-300 focus:border-indigo-400'

export function TextField({ label, value, onChange, placeholder, mono }) {
  return (
    <Field label={label}>
      <input
        type="text"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls + (mono ? ' font-mono text-[12px]' : '')}
      />
    </Field>
  )
}

export function AreaField({ label, value, onChange, rows = 3, placeholder, mono }) {
  return (
    <Field label={label}>
      <textarea
        value={value ?? ''}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls + ' resize-y' + (mono ? ' font-mono text-[12px]' : '')}
      />
    </Field>
  )
}

export function NumField({ label, value, onChange, step = 500, min = 0 }) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value ?? 0}
        step={step}
        min={min}
        onChange={(e) => onChange(Number(e.target.value))}
        className={inputCls}
      />
    </Field>
  )
}

export function ColorField({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || '#6C4CF1'}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
        />
        <input
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className={inputCls + ' font-mono text-[12px]'}
        />
      </div>
    </Field>
  )
}

export function Toggle({ label, value, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5"
    >
      <span className="text-[13px] font-bold text-slate-600">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${value ? 'bg-indigo-500' : 'bg-slate-200'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${value ? 'left-[18px]' : 'left-0.5'}`}
        />
      </span>
    </button>
  )
}

export function SelectField({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </Field>
  )
}

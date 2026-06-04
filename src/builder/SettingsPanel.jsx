import { useState } from 'react'
import { Section, TextField, ColorField, Toggle, SelectField, AreaField } from './fields'

// Theme + flow settings + per-variant copy. Selected via "Theme & settings"
// in the screen list.
export default function SettingsPanel({ quiz, setQuiz }) {
  const theme = quiz.theme || {}
  const patchTheme = (p) => setQuiz((q) => ({ ...q, theme: { ...q.theme, ...p } }))
  const variants = quiz.variants || {}

  const patchVariantCopy = (key, copyKey, value) =>
    setQuiz((q) => ({
      ...q,
      variants: {
        ...q.variants,
        [key]: { ...q.variants[key], copy: { ...q.variants[key].copy, [copyKey]: value } },
      },
    }))

  const patchVariantScreens = (key, value) =>
    setQuiz((q) => ({
      ...q,
      variants: {
        ...q.variants,
        [key]: {
          ...q.variants[key],
          screens: value.trim() ? value.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        },
      },
    }))

  return (
    <div className="p-5">
      <div className="mb-5 flex items-center gap-2.5">
        <span className="text-2xl">🎨</span>
        <h2 className="text-[15px] font-extrabold text-slate-800">Theme & settings</h2>
      </div>

      <Section title="Theme">
        <ColorField label="Primary color" value={theme.primaryColor} onChange={(v) => patchTheme({ primaryColor: v })} />
        <ColorField label="Background" value={theme.background} onChange={(v) => patchTheme({ background: v })} />
        <SelectField
          label="Font"
          value={theme.font}
          onChange={(v) => patchTheme({ font: v })}
          options={[
            { value: 'Manrope', label: 'Manrope' },
            { value: 'Inter', label: 'Inter' },
          ]}
        />
        <Toggle label="Show progress stepper" value={theme.stepper !== false} onChange={(v) => patchTheme({ stepper: v })} />
      </Section>

      <Section title="Flow">
        <TextField
          label="Variant query param key  (C1 — ?angle=…, ?utm_content=…)"
          value={quiz.variantParam}
          onChange={(v) => setQuiz((q) => ({ ...q, variantParam: v }))}
          mono
        />
        <AreaField
          label="Destination URL  ({{sessionId}} + answer {{vars}} ok)"
          rows={2}
          value={quiz.destination}
          onChange={(v) => setQuiz((q) => ({ ...q, destination: v }))}
          mono
        />
      </Section>

      {Object.entries(variants).map(([key, variant]) => (
        <Section key={key} title={`Variant: ${key}`}>
          {Object.entries(variant.copy || {}).map(([copyKey, value]) => (
            <TextField
              key={copyKey}
              label={`{{variant.${copyKey}}}`}
              value={value}
              onChange={(v) => patchVariantCopy(key, copyKey, v)}
            />
          ))}
          <AreaField
            label="Screens & order (comma-separated ids — empty = all screens)"
            rows={2}
            value={(variant.screens || []).join(', ')}
            onChange={(v) => patchVariantScreens(key, v)}
            mono
          />
          {key !== 'default' && (
            <button
              type="button"
              onClick={() =>
                setQuiz((q) => {
                  const next = { ...q.variants }
                  delete next[key]
                  return { ...q, variants: next }
                })
              }
              className="self-start text-[12px] font-bold text-rose-400 transition-colors hover:text-rose-600"
            >
              ✕ Delete variant “{key}”
            </button>
          )}
        </Section>
      ))}

      <AddVariant quiz={quiz} setQuiz={setQuiz} />
    </div>
  )
}

// New angle: clones the default variant's copy + screens as a starting point,
// so `?param=key` works immediately and the marketer just rewrites the hook.
function AddVariant({ quiz, setQuiz }) {
  const [key, setKey] = useState('')
  const taken = !!quiz.variants?.[key.trim()]
  const valid = /^[\w-]+$/.test(key.trim()) && !taken

  const add = () => {
    if (!valid) return
    const def = quiz.variants?.default ?? {}
    setQuiz((q) => ({
      ...q,
      variants: {
        ...q.variants,
        [key.trim()]: {
          copy: { ...def.copy },
          screens: def.screens ? [...def.screens] : undefined,
        },
      },
    }))
    setKey('')
  }

  return (
    <Section title="New variant">
      <div className="flex items-center gap-2">
        <span className="font-mono text-[12px] text-slate-400">?{quiz.variantParam || 'angle'}=</span>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
          placeholder="new-angle"
          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-[12px] outline-none focus:border-indigo-400"
        />
        <button
          type="button"
          onClick={add}
          disabled={!valid}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-[12px] font-bold text-white transition-all hover:brightness-110 disabled:opacity-30"
        >
          + Add
        </button>
      </div>
      {taken && <p className="text-[12px] font-bold text-amber-600">⚠️ That variant key already exists</p>}
    </Section>
  )
}

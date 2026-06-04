import { useState } from 'react'
import { PrimaryButton, ScreenTitle, ScreenSubtitle, Visual } from '../ui'

export default function MultiSelectScreen({ screen, t, onAnswer }) {
  const [selected, setSelected] = useState([])
  const options = screen.options || []

  const toggle = (opt) => {
    const v = opt.value ?? opt.label
    setSelected((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]))
  }

  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
      <ScreenTitle>{t(screen.title)}</ScreenTitle>
      <ScreenSubtitle>{t(screen.subtitle)}</ScreenSubtitle>
      {screen.hint && (
        <p className="mt-2 text-[13px] font-semibold text-[var(--q-primary)]">{t(screen.hint)}</p>
      )}

      <div className="mt-6 flex flex-1 flex-col gap-3">
        {options.map((opt, i) => {
          const v = opt.value ?? opt.label
          const on = selected.includes(v)
          return (
            <button
              key={i}
              type="button"
              onClick={() => toggle(opt)}
              className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 py-4 text-left shadow-sm transition-all duration-150 active:scale-[0.98] ${
                on ? 'border-[var(--q-primary)] bg-[color-mix(in_srgb,var(--q-primary)_6%,white)]' : 'border-transparent hover:shadow-md'
              }`}
            >
              <Visual value={opt.icon} textClassName="text-2xl" imgClassName="h-9 w-9 rounded-lg object-cover" />
              <span className="flex-1 text-[15px] font-semibold text-slate-800">{t(opt.label)}</span>
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 text-xs font-bold text-white transition-all ${
                  on ? 'border-[var(--q-primary)] bg-[var(--q-primary)]' : 'border-slate-200'
                }`}
              >
                {on ? '✓' : ''}
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <PrimaryButton disabled={selected.length === 0} onClick={() => onAnswer(selected)}>
          {t(screen.cta) || 'Next'}
        </PrimaryButton>
      </div>
    </div>
  )
}

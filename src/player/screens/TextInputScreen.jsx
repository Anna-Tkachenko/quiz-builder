import { useState } from 'react'
import { PrimaryButton, ScreenTitle, ScreenSubtitle } from '../ui'

export default function TextInputScreen({ screen, t, onAnswer }) {
  const [value, setValue] = useState('')
  const submit = () => value.trim() && onAnswer(value.trim())

  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
      <ScreenTitle>{t(screen.title)}</ScreenTitle>
      <ScreenSubtitle>{t(screen.subtitle)}</ScreenSubtitle>

      <div className="mt-7 flex-1">
        <input
          autoFocus
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={t(screen.placeholder) || 'Type here…'}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-[16px] font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-300 focus:border-[var(--q-primary)]"
        />
      </div>

      <PrimaryButton disabled={!value.trim()} onClick={submit}>
        {t(screen.cta) || 'Continue'}
      </PrimaryButton>
    </div>
  )
}

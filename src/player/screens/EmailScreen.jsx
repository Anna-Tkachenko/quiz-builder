import { useState } from 'react'
import { PrimaryButton } from '../ui'
import BlockStack from '../BlockStack'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function EmailScreen({ screen, t, onAnswer }) {
  const [value, setValue] = useState('')
  const valid = EMAIL_RE.test(value.trim())
  const submit = () => valid && onAnswer(value.trim())

  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
      <div className="flex flex-col gap-3">
        <BlockStack
          screen={screen}
          t={t}
          titleClass="text-[26px] font-extrabold leading-tight tracking-tight text-slate-900"
          subtitleClass="text-[15px] leading-relaxed text-slate-500"
        />
      </div>

      <div className="mt-7 flex-1">
        <input
          autoFocus
          type="email"
          inputMode="email"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder={t(screen.placeholder) || 'you@example.com'}
          className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-[16px] font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-300 focus:border-[var(--q-primary)]"
        />
        {screen.privacy && (
          <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-slate-400">
            <span>🔒</span> {t(screen.privacy)}
          </p>
        )}
      </div>

      <PrimaryButton disabled={!valid} onClick={submit}>
        {t(screen.cta) || 'Continue'}
      </PrimaryButton>
    </div>
  )
}

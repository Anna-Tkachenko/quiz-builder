import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'
import { PrimaryButton } from '../ui'
import BlockStack from '../BlockStack'

export default function ResultScreen({ screen, t, onComplete }) {
  const fired = useRef(false)
  useEffect(() => {
    if (fired.current) return
    fired.current = true
    confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 }, disableForReducedMotion: true })
  }, [])

  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-10 text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <BlockStack
          screen={screen}
          t={t}
          centered
          titleClass="text-[26px] font-extrabold leading-tight tracking-tight text-slate-900"
          subtitleClass="max-w-[300px] text-[15px] leading-relaxed text-slate-500"
        />

        {screen.items?.length > 0 && (
          <div className="mt-4 w-full max-w-[320px] overflow-hidden rounded-2xl bg-white text-left shadow-sm">
            {screen.items.map((item, i) => (
              <div
                key={i}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${i > 0 ? 'border-t border-slate-100' : ''}`}
              >
                <span className="text-[13px] font-semibold text-slate-400">{t(item.label)}</span>
                <span className="text-right text-[14px] font-bold capitalize text-slate-800">
                  {t(item.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <PrimaryButton onClick={() => onComplete()}>{t(screen.cta) || 'Continue'}</PrimaryButton>
    </div>
  )
}

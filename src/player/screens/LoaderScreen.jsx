import { useEffect, useState, useRef } from 'react'

// Timed "building your plan" screen (C6). Auto-advances after delayMs.
export default function LoaderScreen({ screen, t, onNext }) {
  const delay = screen.delayMs ?? 4000
  const steps = screen.steps?.length ? screen.steps : ['Preparing your results']
  const [progress, setProgress] = useState(0)
  const onNextRef = useRef(onNext)
  useEffect(() => { onNextRef.current = onNext })

  useEffect(() => {
    const t0 = performance.now()
    let raf
    const tick = (now) => {
      const p = Math.min(100, ((now - t0) / delay) * 100)
      setProgress(p)
      if (p < 100) raf = requestAnimationFrame(tick)
      else setTimeout(() => onNextRef.current(), 350)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [delay])

  const activeStep = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length))

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-8 pt-10 text-center">
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="#e9e7f5" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke="var(--q-primary)" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
          />
        </svg>
        <span className="absolute text-xl font-extrabold text-slate-900">
          {Math.round(progress)}%
        </span>
      </div>

      <h1 className="text-[22px] font-extrabold tracking-tight text-slate-900">
        {t(screen.title) || 'Analyzing…'}
      </h1>

      <div className="mt-7 flex w-full max-w-[280px] flex-col gap-3 text-left">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-3 text-[14px] font-medium">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white transition-colors duration-300 ${
                i < activeStep
                  ? 'bg-[var(--q-primary)]'
                  : i === activeStep
                    ? 'animate-pulse-soft bg-[var(--q-primary)]'
                    : 'bg-slate-200'
              }`}
            >
              {i < activeStep ? '✓' : ''}
            </span>
            <span className={i <= activeStep ? 'text-slate-800' : 'text-slate-400'}>
              {t(s)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

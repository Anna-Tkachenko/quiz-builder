import { PrimaryButton } from '../ui'
import { resolveMessageText } from '../../quiz/engine'

// Transition / coach message. Text can be conditional on previous answers (C7).
export default function MessageScreen({ screen, t, ctx, onNext }) {
  const text = resolveMessageText(screen, ctx)
  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-10 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        {screen.emoji && <div className="animate-pop-in mb-5 text-6xl">{screen.emoji}</div>}
        <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-slate-900">
          {t(screen.title)}
        </h1>
        {text && (
          <p className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-slate-500">{t(text)}</p>
        )}
      </div>
      <PrimaryButton onClick={() => onNext()}>{t(screen.cta) || 'Continue'}</PrimaryButton>
    </div>
  )
}

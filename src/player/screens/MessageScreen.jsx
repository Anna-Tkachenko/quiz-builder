import { PrimaryButton } from '../ui'
import BlockStack from '../BlockStack'
import { resolveMessageText } from '../../quiz/engine'

// Transition / coach message. Text can be conditional on previous answers (C7).
export default function MessageScreen({ screen, t, ctx, onNext }) {
  const text = resolveMessageText(screen, ctx)
  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-10 text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <BlockStack
          screen={screen}
          t={t}
          centered
          textOverride={text}
          titleClass="text-[26px] font-extrabold leading-tight tracking-tight text-slate-900"
          subtitleClass="max-w-[300px] text-[15px] leading-relaxed text-slate-500"
        />
      </div>
      <PrimaryButton onClick={() => onNext()}>{t(screen.cta) || 'Continue'}</PrimaryButton>
    </div>
  )
}

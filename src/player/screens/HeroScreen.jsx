import { PrimaryButton } from '../ui'
import BlockStack from '../BlockStack'

export default function HeroScreen({ screen, t, onNext }) {
  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-10 text-center">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        {screen.badge && (
          <span className="animate-pop-in inline-block rounded-full bg-[color-mix(in_srgb,var(--q-primary)_12%,white)] px-4 py-1.5 text-[13px] font-bold text-[var(--q-primary)]">
            {t(screen.badge)}
          </span>
        )}
        <BlockStack
          screen={screen}
          t={t}
          centered
          titleClass="text-[32px] font-extrabold leading-[1.15] tracking-tight text-slate-900"
          subtitleClass="max-w-[300px] text-[15px] leading-relaxed text-slate-500"
        />
      </div>
      <PrimaryButton onClick={() => onNext()}>{t(screen.cta) || 'Start'}</PrimaryButton>
    </div>
  )
}

import { PrimaryButton } from '../ui'

export default function HeroScreen({ screen, t, onNext }) {
  return (
    <div className="flex flex-1 flex-col justify-between px-6 pb-8 pt-10 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        {screen.badge && (
          <span className="animate-pop-in mb-5 inline-block rounded-full bg-[color-mix(in_srgb,var(--q-primary)_12%,white)] px-4 py-1.5 text-[13px] font-bold text-[var(--q-primary)]">
            {t(screen.badge)}
          </span>
        )}
        {screen.emoji && <div className="mb-4 text-6xl">{screen.emoji}</div>}
        <h1 className="text-[32px] font-extrabold leading-[1.15] tracking-tight text-slate-900">
          {t(screen.title)}
        </h1>
        {screen.subtitle && (
          <p className="mt-4 max-w-[300px] text-[15px] leading-relaxed text-slate-500">
            {t(screen.subtitle)}
          </p>
        )}
      </div>
      <PrimaryButton onClick={() => onNext()}>{t(screen.cta) || 'Start'}</PrimaryButton>
    </div>
  )
}

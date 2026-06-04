import { ScreenTitle, ScreenSubtitle } from '../ui'

// layout: 'list' | 'grid' | 'cards' — same logical type, different presentation.
export default function SingleSelectScreen({ screen, t, onAnswer }) {
  const layout = screen.layout || 'list'
  const options = screen.options || []

  const pick = (opt) => onAnswer(opt.value ?? opt.label)

  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-6">
      <ScreenTitle>{t(screen.title)}</ScreenTitle>
      <ScreenSubtitle>{t(screen.subtitle)}</ScreenSubtitle>

      <div
        className={
          layout === 'list'
            ? 'mt-7 flex flex-col gap-3'
            : layout === 'grid'
              ? 'mt-7 grid grid-cols-2 gap-3'
              : 'mt-7 grid grid-cols-2 gap-3' // cards
        }
      >
        {options.map((opt, i) =>
          layout === 'cards' ? (
            <button
              key={i}
              type="button"
              onClick={() => pick(opt)}
              className="flex flex-col items-center gap-2 rounded-2xl border-2 border-transparent bg-white px-4 py-6 shadow-sm transition-all duration-150 hover:border-[var(--q-primary)] hover:shadow-md active:scale-[0.97]"
            >
              <span className="text-4xl">{opt.icon}</span>
              <span className="text-[15px] font-bold text-slate-800">{t(opt.label)}</span>
            </button>
          ) : layout === 'grid' ? (
            <button
              key={i}
              type="button"
              onClick={() => pick(opt)}
              className="flex items-center justify-center gap-2 rounded-2xl border-2 border-transparent bg-white px-4 py-4 shadow-sm transition-all duration-150 hover:border-[var(--q-primary)] hover:shadow-md active:scale-[0.97]"
            >
              {opt.icon && <span className="text-xl">{opt.icon}</span>}
              <span className="text-[15px] font-semibold text-slate-800">{t(opt.label)}</span>
            </button>
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => pick(opt)}
              className="flex items-center gap-3 rounded-2xl border-2 border-transparent bg-white px-5 py-4 text-left shadow-sm transition-all duration-150 hover:border-[var(--q-primary)] hover:shadow-md active:scale-[0.98]"
            >
              {opt.icon && <span className="text-2xl">{opt.icon}</span>}
              <span className="text-[15px] font-semibold text-slate-800">{t(opt.label)}</span>
            </button>
          )
        )}
      </div>
    </div>
  )
}

// Tiny shared primitives for screen components. Theme comes in via CSS vars
// set on the player root: --q-primary.

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-[var(--q-primary)] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[color-mix(in_srgb,var(--q-primary)_35%,transparent)] transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:shadow-none"
    >
      {children}
    </button>
  )
}

export function ScreenTitle({ children }) {
  return (
    <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-slate-900">
      {children}
    </h1>
  )
}

export function ScreenSubtitle({ children }) {
  if (!children) return null
  return <p className="mt-3 text-[15px] leading-relaxed text-slate-500">{children}</p>
}

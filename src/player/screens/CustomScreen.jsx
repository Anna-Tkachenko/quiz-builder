import { useState } from 'react'
import { PrimaryButton, Visual } from '../ui'

// 🧩 Custom screen — a blank canvas composed from an ordered list of
// elements (screen.blocks): badge / text / image / options / input / button.
// Multiple inputs per screen are allowed; a button submits them all.
// A single-choice element with no button on the screen auto-advances.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const IMG_SIZE = { sm: 'max-h-20', md: 'max-h-36', lg: 'max-h-60', full: 'w-full max-h-80' }
const EMOJI_SIZE = { sm: 'text-4xl', md: 'text-6xl', lg: 'text-8xl', full: 'text-8xl' }
const JUSTIFY = { left: 'justify-start', center: 'justify-center', right: 'justify-end' }

const TEXT_STYLE = {
  title: 'text-[26px] font-extrabold leading-tight tracking-tight text-slate-900',
  subtitle: 'text-[15px] leading-relaxed text-slate-500',
  paragraph: 'text-[14px] leading-relaxed text-slate-600',
}

export default function CustomScreen({ screen, t, onAnswerMap, onNext }) {
  const blocks = screen.blocks || []
  const [values, setValues] = useState({})
  const hasButton = blocks.some((b) => b.type === 'button')
  const interactive = blocks.filter((b) => b.type === 'options' || b.type === 'input')

  const setVal = (id, v) => setValues((s) => ({ ...s, [id]: v }))

  const blockValid = (b) => {
    const v = values[b.id]
    if (b.type === 'input') {
      const s = String(v || '').trim()
      return b.inputType === 'email' ? EMAIL_RE.test(s) : s.length > 0
    }
    if (b.type === 'options') return b.multi ? Array.isArray(v) && v.length > 0 : v != null
    return true
  }
  const valid = interactive.every(blockValid)

  const submit = () => {
    const map = {}
    interactive.forEach((b) => {
      if (b.saveAs && values[b.id] !== undefined) map[b.saveAs] = values[b.id]
    })
    onAnswerMap(map)
  }

  const pickSingle = (b, opt) => {
    const v = opt.value ?? opt.label
    if (!hasButton && interactive.length === 1) {
      onAnswerMap(b.saveAs ? { [b.saveAs]: v } : {})
    } else {
      setVal(b.id, v)
    }
  }

  const toggleMulti = (b, opt) => {
    const v = opt.value ?? opt.label
    const cur = Array.isArray(values[b.id]) ? values[b.id] : []
    setVal(b.id, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v])
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-6 pb-8 pt-6">
      {blocks.map((b) => {
        switch (b.type) {
          case 'badge':
            return b.text ? (
              <div key={b.id} className="flex justify-center">
                <span className="animate-pop-in inline-block rounded-full bg-[color-mix(in_srgb,var(--q-primary)_12%,white)] px-4 py-1.5 text-[13px] font-bold text-[var(--q-primary)]">
                  {t(b.text)}
                </span>
              </div>
            ) : null
          case 'text':
            return b.text ? (
              <p key={b.id} className={`${TEXT_STYLE[b.style] || TEXT_STYLE.paragraph} ${b.align === 'center' ? 'text-center' : ''}`}>
                {t(b.text)}
              </p>
            ) : null
          case 'image':
            return b.value ? (
              <div key={b.id} className={`flex w-full ${JUSTIFY[b.align] || JUSTIFY.center}`}>
                <Visual
                  value={b.value}
                  textClassName={`animate-pop-in block ${EMOJI_SIZE[b.size || 'md']}`}
                  imgClassName={`animate-pop-in ${IMG_SIZE[b.size || 'md']} ${(b.size || 'md') === 'full' ? 'w-full object-cover' : 'w-auto object-cover'} rounded-2xl shadow-md`}
                />
              </div>
            ) : null
          case 'options': {
            const layout = b.layout || 'list'
            const selected = values[b.id]
            const isOn = (opt) => {
              const v = opt.value ?? opt.label
              return b.multi ? Array.isArray(selected) && selected.includes(v) : selected === v
            }
            const click = (opt) => (b.multi ? toggleMulti(b, opt) : pickSingle(b, opt))
            return (
              <div key={b.id} className={layout === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-2 gap-3'}>
                {(b.options || []).map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => click(opt)}
                    className={`flex items-center gap-3 rounded-2xl border-2 bg-white px-5 text-left shadow-sm transition-all duration-150 active:scale-[0.98] ${
                      layout === 'cards' ? 'flex-col py-6 text-center' : 'py-4'
                    } ${isOn(opt) ? 'border-[var(--q-primary)] bg-[color-mix(in_srgb,var(--q-primary)_6%,white)]' : 'border-transparent hover:border-[var(--q-primary)] hover:shadow-md'}`}
                  >
                    <Visual value={opt.icon} textClassName={layout === 'cards' ? 'text-4xl' : 'text-2xl'} imgClassName={layout === 'cards' ? 'h-12 w-12 rounded-xl object-cover' : 'h-9 w-9 rounded-lg object-cover'} />
                    <span className="flex-1 text-[15px] font-semibold text-slate-800">{t(opt.label)}</span>
                    {b.multi && (
                      <span className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 text-xs font-bold text-white transition-all ${isOn(opt) ? 'border-[var(--q-primary)] bg-[var(--q-primary)]' : 'border-slate-200'}`}>
                        {isOn(opt) ? '✓' : ''}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )
          }
          case 'input':
            return (
              <div key={b.id}>
                <input
                  type={b.inputType === 'email' ? 'email' : 'text'}
                  value={values[b.id] ?? ''}
                  onChange={(e) => setVal(b.id, e.target.value)}
                  placeholder={t(b.placeholder) || 'Type here…'}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-[16px] font-medium text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-300 focus:border-[var(--q-primary)]"
                />
                {b.privacy && (
                  <p className="mt-3 flex items-start gap-2 text-[12px] leading-relaxed text-slate-400">
                    <span>🔒</span> {t(b.privacy)}
                  </p>
                )}
              </div>
            )
          case 'button':
            return (
              <div key={b.id} className="mt-auto pt-2">
                <PrimaryButton disabled={!valid} onClick={submit}>
                  {t(b.label) || 'Continue'}
                </PrimaryButton>
              </div>
            )
          default:
            return null
        }
      })}
      {!hasButton && interactive.length === 0 && (
        <div className="mt-auto pt-2">
          <PrimaryButton onClick={() => onNext()}>Continue</PrimaryButton>
        </div>
      )}
    </div>
  )
}

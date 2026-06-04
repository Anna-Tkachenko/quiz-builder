import { useLayoutEffect, useRef, useState, useEffect } from 'react'
import { TYPE_META } from './meta'
import { interpolate, variantScreens } from '../quiz/engine'

// 🗺️ Flow map — the quiz as a diagram: screens in order, branch arrows per
// answer, visibility conditions on the cards. Click a card to edit it.
export default function FlowMapTab({ quiz, onOpen }) {
  const variantKeys = Object.keys(quiz.variants || { default: {} })
  const [variantKey, setVariantKey] = useState('default')
  const variant = quiz.variants?.[variantKey] ?? quiz.variants?.default ?? {}
  const screens = variantScreens(quiz, variant)

  const containerRef = useRef(null)
  const cardRefs = useRef({})
  const [edges, setEdges] = useState([])

  // logical edges: explicit rules + implicit "next in order"
  const logical = []
  screens.forEach((s, i) => {
    const rules = Array.isArray(s.next)
      ? s.next
      : typeof s.next === 'string'
        ? [{ goto: s.next }]
        : []
    let hasDefault = false
    rules.forEach((r) => {
      if (!r.goto) return
      if (!r.when) hasDefault = true
      logical.push({
        from: s.id,
        to: r.goto,
        label: r.when ? String(r.when.value ?? '✓') : 'otherwise',
        branch: !!r.when,
      })
    })
    if (!hasDefault && i + 1 < screens.length) {
      logical.push({ from: s.id, to: screens[i + 1].id, label: '', branch: false })
    }
  })

  const measure = () => {
    const root = containerRef.current
    if (!root) return
    const rootBox = root.getBoundingClientRect()
    const out = []
    const branchCount = {}
    logical.forEach((e) => {
      const a = cardRefs.current[e.from]?.getBoundingClientRect()
      const b = cardRefs.current[e.to]?.getBoundingClientRect()
      if (!a || !b) return
      const fromIdx = screens.findIndex((s) => s.id === e.from)
      const toIdx = screens.findIndex((s) => s.id === e.to)
      const adjacent = toIdx === fromIdx + 1 && !e.branch
      if (adjacent) {
        // straight connector between consecutive cards
        out.push({
          ...e,
          path: `M ${a.left - rootBox.left + a.width / 2} ${a.bottom - rootBox.top}
                 L ${b.left - rootBox.left + b.width / 2} ${b.top - rootBox.top - 5}`,
          lx: 0, ly: 0,
        })
      } else {
        // side curve on the right, offset by distance + per-card stagger
        branchCount[e.from] = (branchCount[e.from] || 0) + 1
        const stagger = branchCount[e.from] * 16
        const y1 = a.top - rootBox.top + a.height / 2 + (branchCount[e.from] - 1) * 14 - 7
        const y2 = b.top - rootBox.top + b.height / 2
        const x1 = a.right - rootBox.left
        const x2 = b.right - rootBox.left
        const bulge = Math.min(150, 46 + Math.abs(toIdx - fromIdx) * 14 + stagger)
        const xo = Math.max(x1, x2) + bulge
        out.push({
          ...e,
          path: `M ${x1} ${y1} C ${xo} ${y1}, ${xo} ${y2}, ${x2 + 6} ${y2}`,
          lx: xo - 8,
          ly: (y1 + y2) / 2,
        })
      }
    })
    setEdges(out)
  }

  /* eslint-disable react-hooks/exhaustive-deps */
  useLayoutEffect(measure, [quiz, variantKey])
  /* eslint-enable react-hooks/exhaustive-deps */
  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  })

  const t = (text) => interpolate(text, {}, variant.copy)

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-[13px] font-semibold text-slate-500">
            The full journey for this variant — labeled arrows are answer-based branches.
            Click any screen to edit it.
          </p>
          {variantKeys.length > 1 && (
            <label className="flex shrink-0 items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-2 shadow-sm">
              <span className="font-mono text-[11px] font-bold text-slate-400">?{quiz.variantParam}=</span>
              <select
                value={variantKey}
                onChange={(e) => setVariantKey(e.target.value)}
                className="cursor-pointer rounded-full bg-slate-100 px-3 py-1 text-[12px] font-bold text-slate-700 outline-none"
              >
                {variantKeys.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div ref={containerRef} className="relative pr-44">
          {/* edge layer */}
          <svg className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
            <defs>
              <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#94a3b8" />
              </marker>
              <marker id="arr-b" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M 0 0 L 8 4 L 0 8 z" fill="#6366f1" />
              </marker>
            </defs>
            {edges.map((e, i) => (
              <path
                key={i}
                d={e.path}
                fill="none"
                stroke={e.branch ? '#6366f1' : '#94a3b8'}
                strokeWidth={e.branch ? 2 : 1.5}
                strokeDasharray={e.label === 'otherwise' ? '4 3' : undefined}
                markerEnd={`url(#${e.branch ? 'arr-b' : 'arr'})`}
              />
            ))}
          </svg>
          {/* edge labels */}
          {edges.filter((e) => e.label).map((e, i) => (
            <span
              key={i}
              className={`absolute -translate-y-1/2 translate-x-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold shadow-sm ${
                e.label === 'otherwise' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white'
              }`}
              style={{ left: e.lx, top: e.ly }}
            >
              {e.label}
            </span>
          ))}

          {/* screen cards */}
          <div className="flex flex-col gap-9">
            {screens.map((s) => {
              const meta = TYPE_META[s.type] || { icon: '❔', label: s.type }
              return (
                <button
                  key={s.id}
                  type="button"
                  ref={(el) => { cardRefs.current[s.id] = el }}
                  onClick={() => onOpen(s.id)}
                  className="relative z-10 flex w-full max-w-md items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-indigo-200"
                >
                  <span className="text-2xl">{meta.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-extrabold text-slate-800">
                      {t(s.title)?.trim() || s.id}
                    </span>
                    <span className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                      {meta.label}
                      <code className="text-[10px]">{s.id}</code>
                      {s.saveAs && (
                        <span className="rounded bg-violet-50 px-1.5 py-0.5 font-mono text-[10px] font-bold text-violet-500">
                          → {'{{'}{s.saveAs}{'}}'}
                        </span>
                      )}
                    </span>
                    {s.show && (
                      <span className="mt-1.5 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold text-amber-600">
                        👁 only when {s.show.var} {({ eq: 'is', neq: 'is not', contains: 'includes', exists: 'has any value' })[s.show.op] || s.show.op} {s.show.op !== 'exists' ? `“${s.show.value}”` : ''}
                      </span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

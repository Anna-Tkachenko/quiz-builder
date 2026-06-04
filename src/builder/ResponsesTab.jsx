import { useState } from 'react'
import { loadResponses, clearResponses, listQuizzes } from '../quiz/storage'
import { liveUrl } from '../lib/links'

// Responses tab (§5.4): sessions with answers, arrival params, variant,
// completion + destination. Filterable per quiz.
export default function ResponsesTab() {
  const [allResponses, setAllResponses] = useState(loadResponses)
  const [quizFilter, setQuizFilter] = useState('all')

  // filter options: every quiz in the library + any ids seen in responses
  const { quizzes } = listQuizzes()
  const knownIds = new Set(quizzes.map((q) => q.id))
  allResponses.forEach((r) => r.quizId && knownIds.add(r.quizId))
  const titleOf = (id) => quizzes.find((q) => q.id === id)?.title || id

  const responses =
    quizFilter === 'all' ? allResponses : allResponses.filter((r) => r.quizId === quizFilter)

  const fmt = (iso) => (iso ? new Date(iso).toLocaleString() : '—')

  // Funnel stats — total and per-variant: starts / completions / rate.
  const byVariant = {}
  for (const r of responses) {
    const k = r.variant || 'default'
    byVariant[k] ??= { starts: 0, completions: 0 }
    byVariant[k].starts++
    if (r.completed) byVariant[k].completions++
  }
  const total = {
    starts: responses.length,
    completions: responses.filter((r) => r.completed).length,
  }
  const rate = (s) => (s.starts ? Math.round((s.completions / s.starts) * 100) + '%' : '—')

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[12px] font-extrabold uppercase tracking-wider text-slate-400">Quiz</span>
        <select
          value={quizFilter}
          onChange={(e) => setQuizFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-slate-700 shadow-sm outline-none focus:border-indigo-400"
        >
          <option value="all">All quizzes</option>
          {[...knownIds].map((id) => (
            <option key={id} value={id}>{titleOf(id)}</option>
          ))}
        </select>
        {quizFilter !== 'all' && (
          <span className="font-mono text-[11px] text-slate-400">id: {quizFilter}</span>
        )}
      </div>

      {responses.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-3">
          <StatCard label="All traffic" starts={total.starts} completions={total.completions} rate={rate(total)} primary />
          {Object.entries(byVariant).map(([k, s]) => (
            <StatCard key={k} label={`variant: ${k}`} starts={s.starts} completions={s.completions} rate={rate(s)} />
          ))}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-slate-500">
          {responses.length} session{responses.length === 1 ? '' : 's'} captured
          <span className="ml-2 text-slate-400">· stored locally, newest last</span>
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setAllResponses(loadResponses())}
            className="rounded-xl bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-sm transition-colors hover:text-slate-900"
          >
            ↺ Refresh
          </button>
          <button
            type="button"
            onClick={() => { clearResponses(); setAllResponses([]) }}
            className="rounded-xl bg-white px-4 py-2 text-[12px] font-bold text-rose-500 shadow-sm transition-colors hover:text-rose-700"
          >
            Clear all
          </button>
        </div>
      </div>

      {responses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <p className="text-3xl">📭</p>
          <p className="mt-2 text-[14px] font-bold text-slate-500">No responses yet</p>
          <p className="mt-1 text-[13px] text-slate-400">
            Take the quiz at <a className="font-bold text-indigo-500" href={liveUrl('')} target="_blank" rel="noreferrer">/</a> — every session lands here.
          </p>
        </div>
      ) : (
        <ResponsesTable responses={responses} fmt={fmt} />
      )}
    </div>
  )
}

function StatCard({ label, starts, completions, rate, primary }) {
  return (
    <div className={`flex items-center gap-5 rounded-2xl px-5 py-3.5 shadow-sm ${primary ? 'bg-indigo-600 text-white' : 'bg-white'}`}>
      <span className={`text-[12px] font-extrabold uppercase tracking-wider ${primary ? 'text-indigo-200' : 'text-slate-400'}`}>
        {label}
      </span>
      <Metric label="starts" value={starts} primary={primary} />
      <Metric label="completed" value={completions} primary={primary} />
      <Metric label="rate" value={rate} primary={primary} />
    </div>
  )
}

function Metric({ label, value, primary }) {
  return (
    <span className="flex items-baseline gap-1.5">
      <span className={`text-[18px] font-extrabold tabular-nums ${primary ? 'text-white' : 'text-slate-800'}`}>{value}</span>
      <span className={`text-[11px] font-bold ${primary ? 'text-indigo-200' : 'text-slate-400'}`}>{label}</span>
    </span>
  )
}

function ResponsesTable({ responses, fmt }) {
  return (
    <>
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-[12.5px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Quiz</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">Arrival params</th>
                <th className="px-4 py-3">Answers</th>
                <th className="px-4 py-3">Done</th>
                <th className="px-4 py-3">Destination</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((r) => (
                <tr key={r.sessionId} className="border-b border-slate-50 align-top last:border-0">
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{r.sessionId}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {r.quizId || '—'}
                    {r.quizVersion ? <span className="ml-1 rounded bg-emerald-50 px-1 py-0.5 text-[10px] font-bold text-emerald-600">v{r.quizVersion}</span> : null}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">{fmt(r.startedAt)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-600">
                      {r.variant || 'default'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {Object.entries(r.params || {}).map(([k, v]) => `${k}=${v}`).join('&') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex max-w-[320px] flex-wrap gap-1">
                      {Object.entries(r.answers || {}).map(([k, v]) => (
                        <span key={k} className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {k}: {Array.isArray(v) ? v.join(', ') : String(v)}
                        </span>
                      ))}
                      {Object.keys(r.answers || {}).length === 0 && <span className="text-slate-300">—</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">{r.completed ? '✅' : '⏳'}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 font-mono text-[11px] text-slate-400" title={r.destination}>
                    {r.destination || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
    </>
  )
}

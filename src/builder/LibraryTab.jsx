import { listQuizzes, createQuiz, duplicateQuiz, deleteQuiz, loadResponses, publishQuiz, getPublishState } from '../quiz/storage'
import { TYPE_META } from './meta'
import { liveUrl } from '../lib/links'

// Quiz library: every quiz built here, each with its own play link and stats.
// `onOpen(id)` switches the builder to that quiz.
export default function LibraryTab({ onOpen, onChanged }) {
  const { activeId, quizzes } = listQuizzes()
  const responses = loadResponses()

  const stats = (quizId) => {
    const rs = responses.filter((r) => r.quizId === quizId)
    const done = rs.filter((r) => r.completed).length
    return { starts: rs.length, done }
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <p className="mb-4 text-[13px] font-semibold text-slate-500">
        {quizzes.length} quiz{quizzes.length === 1 ? '' : 'zes'} in the library — each is one JSON
        document with its own link: <code className="rounded bg-slate-200/60 px-1.5 py-0.5 font-mono text-[11px]">/?quiz=&lt;id&gt;</code>
      </p>

      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-4">
        {quizzes.map((q) => {
          const s = stats(q.id)
          const active = q.id === activeId
          const pub = getPublishState(q.id)
          return (
            <div
              key={q.id}
              className={`flex flex-col rounded-2xl bg-white p-5 shadow-sm transition-shadow hover:shadow-md ${active ? 'ring-2 ring-indigo-400' : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-[15px] font-extrabold text-slate-800">{q.title || q.id}</h2>
                  <p className="mt-0.5 font-mono text-[11px] text-slate-400">id: {q.id}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {pub.status === 'live' && (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-emerald-600">
                      ● live v{pub.version}
                    </span>
                  )}
                  {pub.status === 'dirty' && (
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-amber-600" title={`v${pub.version} is live; the draft has unpublished edits`}>
                      ◐ v{pub.version} live · draft edited
                    </span>
                  )}
                  {pub.status === 'unpublished' && (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                      ○ not published
                    </span>
                  )}
                  {active && (
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-indigo-600">
                      editing
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(q.screens || []).slice(0, 10).map((sc, i) => (
                  <span key={i} title={`${sc.type}: ${sc.id}`} className="text-[15px]">
                    {TYPE_META[sc.type]?.icon ?? '❔'}
                  </span>
                ))}
              </div>

              <div className="mt-3 flex gap-4 text-[12px] font-semibold text-slate-500">
                <span>{q.screens?.length ?? 0} screens</span>
                <span>{Object.keys(q.variants || {}).length} variant{Object.keys(q.variants || {}).length === 1 ? '' : 's'}</span>
                <span>{s.starts} session{s.starts === 1 ? '' : 's'}</span>
                <span>{s.done} completed</span>
              </div>

              <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => onOpen(q.id)}
                  className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-[12px] font-bold text-white transition-all hover:brightness-110"
                >
                  ✏️ Edit
                </button>
                {pub.status !== 'live' && (
                  <button
                    type="button"
                    title="Publish the draft to production"
                    onClick={() => { publishQuiz(q.id); onChanged() }}
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white transition-all hover:brightness-110"
                  >
                    🚀
                  </button>
                )}
                <a
                  href={liveUrl(`?quiz=${q.id}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-xl bg-slate-100 px-3 py-2 text-center text-[12px] font-bold text-slate-600 transition-colors hover:bg-slate-200"
                >
                  ▶ Play ↗
                </a>
                <button
                  type="button"
                  title="Duplicate"
                  onClick={() => { duplicateQuiz(q.id); onChanged() }}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-bold text-slate-500 transition-colors hover:bg-slate-200"
                >
                  ⧉
                </button>
                <button
                  type="button"
                  title={quizzes.length <= 1 ? 'Cannot delete the last quiz' : 'Delete'}
                  disabled={quizzes.length <= 1}
                  onClick={() => { deleteQuiz(q.id); onChanged() }}
                  className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
            </div>
          )
        })}

        <button
          type="button"
          onClick={() => { createQuiz(); onChanged() }}
          className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-indigo-300 hover:text-indigo-600"
        >
          <span className="text-3xl">＋</span>
          <span className="text-[13px] font-bold">New quiz</span>
        </button>
      </div>
    </div>
  )
}

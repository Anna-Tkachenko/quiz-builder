import { useEffect, useState } from 'react'
import QuizPlayer from './player/QuizPlayer'
import Builder from './builder/Builder'
import { getPlayableQuiz, upsertResponse } from './quiz/storage'

// Hash routing: `/` = live player (quiz loaded from CMS storage), `#/builder` = CMS.
export default function App() {
  const [route, setRoute] = useState(window.location.hash)
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  if (route.startsWith('#/builder')) return <Builder />
  return <PlayerRoute />
}

function PlayerRoute() {
  const params = Object.fromEntries(new URLSearchParams(window.location.search))
  // The renderer reads the contract from either source:
  //  - `?src=<url>`  — fetch the quiz JSON from anywhere (true headless mode)
  //  - `?quiz=<id>`  — the PUBLISHED snapshot from this browser's CMS store
  //    (default = the active quiz). Draft edits never leak to production.
  const [state, setState] = useState(() => (params.src ? null : getPlayableQuiz(params.quiz)))
  const [loadError, setLoadError] = useState(null)

  useEffect(() => {
    if (!params.src) return
    fetch(params.src)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((q) => {
        if (!Array.isArray(q.screens)) throw new Error('not a quiz document ("screens" missing)')
        setState({ quiz: q, version: null })
      })
      .catch((e) => setLoadError(String(e.message || e)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-200/70 p-6">
        <div className="max-w-sm rounded-2xl bg-white p-8 text-center shadow-xl">
          <p className="text-3xl">🤕</p>
          <p className="mt-3 text-[15px] font-extrabold text-slate-800">Couldn’t load the quiz JSON</p>
          <p className="mt-2 break-all font-mono text-[12px] text-slate-400">{params.src}</p>
          <p className="mt-2 text-[13px] font-semibold text-rose-500">{loadError}</p>
        </div>
      </div>
    )
  }
  if (!state) {
    return <div className="flex min-h-dvh items-center justify-center bg-slate-200/70 text-sm font-semibold text-slate-400">Loading quiz…</div>
  }
  const { quiz, version } = state

  // Data capture (§5.4): session + params + variant + answers + completion.
  const onEvent = (e) => {
    if (e.type === 'start') {
      upsertResponse(e.sessionId, { quizId: quiz.id, quizVersion: version, params: e.params, variant: e.variantKey })
    } else if (e.type === 'answer') {
      upsertResponse(e.sessionId, { answers: { [e.saveAs || e.screenId]: e.value } })
    } else if (e.type === 'complete') {
      upsertResponse(e.sessionId, {
        completed: true,
        completedAt: new Date().toISOString(),
        destination: e.destination,
      })
    }
  }

  return (
    <div className="flex min-h-dvh justify-center bg-slate-200/70">
      <a
        href="#/builder"
        className="fixed right-4 top-4 z-10 hidden items-center gap-1.5 rounded-full bg-white/90 px-4 py-2 text-[13px] font-bold text-slate-600 shadow-md backdrop-blur transition-colors hover:text-slate-900 sm:flex"
      >
        ⚙️ Open builder
      </a>
      <div className="flex min-h-dvh w-full max-w-[430px] flex-col bg-white shadow-2xl">
        <QuizPlayer quiz={quiz} params={params} onEvent={onEvent} />
      </div>
    </div>
  )
}

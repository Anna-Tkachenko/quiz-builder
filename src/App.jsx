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
  // `?quiz=<id>` plays any quiz from the library; default = the active one.
  // Production serves the PUBLISHED snapshot — draft edits don't leak here.
  const [{ quiz, version }] = useState(() => getPlayableQuiz(params.quiz))

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

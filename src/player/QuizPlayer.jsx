import { useEffect, useRef, useState } from 'react'
import { resolveVariant, getFlow, getNext, interpolate, genSessionId } from '../quiz/engine'
import HeroScreen from './screens/HeroScreen'
import SingleSelectScreen from './screens/SingleSelectScreen'
import MultiSelectScreen from './screens/MultiSelectScreen'
import MessageScreen from './screens/MessageScreen'
import LoaderScreen from './screens/LoaderScreen'
import TextInputScreen from './screens/TextInputScreen'
import EmailScreen from './screens/EmailScreen'
import ResultScreen from './screens/ResultScreen'

// One component per screen type — the whole contract of the renderer.
const SCREEN_COMPONENTS = {
  hero: HeroScreen,
  'single-select': SingleSelectScreen,
  'multi-select': MultiSelectScreen,
  message: MessageScreen,
  loader: LoaderScreen,
  text: TextInputScreen,
  email: EmailScreen,
  result: ResultScreen,
}

// THE renderer. Used standalone at `/` and mounted inside the builder's
// phone preview — same code, no duplicated markup.
// `embedded` suppresses the real redirect; `onEvent` reports answers/completion;
// `previewScreenId` makes the preview follow the screen being edited.
export default function QuizPlayer({ quiz, params = {}, embedded = false, onEvent, previewScreenId }) {
  const [sessionId] = useState(genSessionId)
  const [answers, setAnswers] = useState({})
  const [history, setHistory] = useState([])
  const [currentId, setCurrentId] = useState(null)

  const { key: variantKey, variant } = resolveVariant(quiz, params)
  const ctx = { ...params, ...answers, sessionId, variantKey }
  const flow = getFlow(quiz, variant, ctx)
  const screen = (currentId && quiz.screens.find((s) => s.id === currentId)) || flow[0]

  const theme = quiz.theme || {}
  const t = (text) => interpolate(text, ctx, variant.copy)

  // Session start — report arrival params + active variant (§5.4).
  const startedRef = useRef(false)
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    onEvent?.({ type: 'start', sessionId, params, variantKey })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Builder preview: jump to the screen being edited. The user can still
  // play forward from there — only a *change* of selection re-jumps.
  // (React's "adjust state when props change" render-time pattern.)
  const [prevPreviewId, setPrevPreviewId] = useState(previewScreenId)
  if (previewScreenId !== prevPreviewId) {
    setPrevPreviewId(previewScreenId)
    if (previewScreenId && quiz.screens.some((s) => s.id === previewScreenId)) {
      setCurrentId(previewScreenId)
    }
  }

  if (!screen) {
    return (
      <div className="flex flex-1 items-center justify-center p-10 text-sm text-slate-400">
        This quiz has no screens yet.
      </div>
    )
  }

  const complete = (finalCtx) => {
    const url = quiz.destination ? interpolate(quiz.destination, finalCtx, variant.copy) : ''
    onEvent?.({ type: 'complete', sessionId, destination: url })
    if (!embedded && url) window.location.assign(url)
  }

  const advance = (value) => {
    const nextAnswers =
      screen.saveAs && value !== undefined ? { ...answers, [screen.saveAs]: value } : answers
    const nextCtx = { ...params, ...nextAnswers, sessionId, variantKey }
    setAnswers(nextAnswers)
    if (value !== undefined) {
      onEvent?.({ type: 'answer', sessionId, screenId: screen.id, saveAs: screen.saveAs, value })
    }
    const nextId = getNext(screen, quiz, variant, nextCtx)
    if (nextId) {
      setHistory((h) => [...h, screen.id])
      setCurrentId(nextId)
    } else {
      complete(nextCtx)
    }
  }

  const goBack = () => {
    if (history.length === 0) return
    const prev = history[history.length - 1]
    setHistory((h) => h.slice(0, -1))
    setCurrentId(prev)
  }

  const flowIdx = Math.max(0, flow.findIndex((s) => s.id === screen.id))
  const progress = flow.length > 1 ? flowIdx / (flow.length - 1) : 0
  const showStepper = theme.stepper !== false && screen.type !== 'hero'
  const Component = SCREEN_COMPONENTS[screen.type]

  return (
    <div
      className="flex h-full min-h-0 w-full flex-1 flex-col"
      style={{
        '--q-primary': theme.primaryColor || '#6C4CF1',
        background: theme.background || '#F6F5FB',
        fontFamily: `'${theme.font || 'Manrope'}', 'Inter', system-ui, sans-serif`,
      }}
    >
      {/* Stepper header (C5) */}
      <div className="flex h-12 shrink-0 items-center gap-3 px-5">
        {showStepper && (
          <>
            {history.length > 0 && screen.type !== 'result' ? (
              <button
                type="button"
                onClick={goBack}
                aria-label="Back"
                className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-700"
              >
                ←
              </button>
            ) : (
              <span className="w-7" />
            )}
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-black/8">
              <div
                className="h-full rounded-full bg-[var(--q-primary)] transition-all duration-500 ease-out"
                style={{ width: `${Math.round(progress * 100)}%` }}
              />
            </div>
            <span className="w-10 text-right text-[11px] font-bold tabular-nums text-slate-400">
              {flowIdx + 1}/{flow.length}
            </span>
          </>
        )}
      </div>

      {/* Screen body — keyed so each screen animates in */}
      <div key={screen.id} className="animate-screen-in flex min-h-0 flex-1 flex-col overflow-y-auto">
        {Component ? (
          <Component
            screen={screen}
            t={t}
            ctx={ctx}
            theme={theme}
            onAnswer={advance}
            onNext={() => advance(undefined)}
            onComplete={() => complete(ctx)}
          />
        ) : (
          <div className="p-10 text-center text-sm text-slate-400">
            Unknown screen type: {screen.type}
          </div>
        )}
      </div>
    </div>
  )
}

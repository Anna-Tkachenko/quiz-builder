import { useState } from 'react'
import QuizPlayer from '../player/QuizPlayer'
import { liveUrl } from '../lib/links'

// Right pane: the SAME QuizPlayer the live app uses, in a phone frame.
// Angle switcher previews any variant (DoD #9 / 🌶️ bonus).
export default function PreviewPane({ quiz, selectedScreenId }) {
  const [angle, setAngle] = useState('default')
  const [nonce, setNonce] = useState(0)

  const variantKeys = Object.keys(quiz.variants || { default: {} })
  const params =
    angle !== 'default' && quiz.variantParam ? { [quiz.variantParam]: angle } : {}
  const playUrl = liveUrl(
    angle !== 'default' && quiz.variantParam ? `?${quiz.variantParam}=${angle}` : ''
  )

  return (
    <div className="flex h-full flex-col items-center overflow-y-auto px-6 py-4">
      <div className="mb-3 flex w-full max-w-[340px] items-center gap-2">
        <div className="flex flex-1 gap-1 rounded-full bg-slate-200/70 p-1">
          {variantKeys.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setAngle(k)}
              className={`flex-1 rounded-full px-3 py-1.5 text-[12px] font-bold transition-all ${
                angle === k ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {k === 'default' ? 'default' : `?${quiz.variantParam}=${k}`}
            </button>
          ))}
        </div>
        <button
          type="button"
          title="Restart preview"
          onClick={() => setNonce((n) => n + 1)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/70 text-[14px] text-slate-500 transition-colors hover:bg-slate-300 hover:text-slate-700"
        >
          ↺
        </button>
        <a
          href={playUrl}
          target="_blank"
          rel="noreferrer"
          title="Open live quiz in a new tab"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200/70 text-[13px] text-slate-500 transition-colors hover:bg-slate-300 hover:text-slate-700"
        >
          ↗
        </a>
      </div>

      {/* Phone frame */}
      <div className="rounded-[2.8rem] border-[10px] border-slate-900 bg-slate-900 shadow-2xl">
        <div className="relative h-[640px] w-[320px] overflow-hidden rounded-[2.2rem] bg-white">
          <div className="absolute left-1/2 top-0 z-10 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-slate-900" />
          <div className="flex h-full flex-col pt-5">
            <QuizPlayer
              key={`${angle}:${nonce}`}
              quiz={quiz}
              params={params}
              embedded
              previewScreenId={selectedScreenId}
            />
          </div>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] font-medium text-slate-400">
        Live preview — rendered by the same code as the real quiz
      </p>
    </div>
  )
}

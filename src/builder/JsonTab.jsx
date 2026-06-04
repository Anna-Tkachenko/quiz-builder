import { useState } from 'react'

// The contract, visible: full quiz JSON — copy it, or paste/edit and apply.
// This *is* the headless-CMS export/import.
export default function JsonTab({ quiz, setQuiz }) {
  const pretty = JSON.stringify(quiz, null, 2)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState(null)
  const [copied, setCopied] = useState(false)
  const dirty = draft !== null && draft !== pretty

  const copy = async () => {
    await navigator.clipboard.writeText(pretty)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const apply = () => {
    try {
      const parsed = JSON.parse(draft)
      if (!Array.isArray(parsed.screens)) throw new Error('"screens" must be an array')
      setQuiz(parsed)
      setDraft(null)
      setError(null)
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col p-6">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-semibold text-slate-500">
          The quiz as one JSON document — the contract between CMS and renderer.
          Edit freely and apply.
        </p>
        <div className="flex gap-2">
          {dirty && (
            <>
              <button
                type="button"
                onClick={() => { setDraft(null); setError(null) }}
                className="rounded-xl bg-white px-4 py-2 text-[12px] font-bold text-slate-500 shadow-sm hover:text-slate-700"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={apply}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-[12px] font-bold text-white shadow-sm transition-all hover:brightness-110"
              >
                ✓ Apply changes
              </button>
            </>
          )}
          <button
            type="button"
            onClick={copy}
            className="rounded-xl bg-white px-4 py-2 text-[12px] font-bold text-slate-600 shadow-sm transition-colors hover:text-slate-900"
          >
            {copied ? '✓ Copied' : '⧉ Copy JSON'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-2 rounded-xl bg-amber-50 px-4 py-2 text-[12px] font-bold text-amber-700">
          ⚠️ {error}
        </p>
      )}

      <textarea
        value={draft ?? pretty}
        onChange={(e) => { setDraft(e.target.value); setError(null) }}
        spellCheck={false}
        className="min-h-0 flex-1 resize-none rounded-2xl border border-slate-200 bg-white p-5 font-mono text-[12px] leading-relaxed text-slate-700 shadow-sm outline-none focus:border-indigo-300"
      />
    </div>
  )
}

import { useEffect, useState } from 'react'
import { loadQuiz, saveQuiz, resetToDemo, setActiveQuiz, publishQuiz, getPublishState } from '../quiz/storage'
import { newScreen } from './meta'
import { liveUrl } from '../lib/links'
import ScreenList from './ScreenList'
import ScreenEditor from './ScreenEditor'
import SettingsPanel from './SettingsPanel'
import PreviewPane from './PreviewPane'
import ResponsesTab from './ResponsesTab'
import JsonTab from './JsonTab'
import LibraryTab from './LibraryTab'
import FlowMapTab from './FlowMapTab'
import HowToTab from './HowToTab'

// The CMS. 3 panes: screen list / editor / live phone preview.
export default function Builder() {
  const [quiz, setQuiz] = useState(loadQuiz)
  const [tab, setTab] = useState('build')
  const [selectedId, setSelectedId] = useState(() => quiz.screens[0]?.id ?? '__settings__')

  useEffect(() => { saveQuiz(quiz) }, [quiz])

  // Publish state of the active quiz (re-derived after every edit/publish).
  const [pubNonce, setPubNonce] = useState(0)
  const pub = getPublishState(quiz.id, quiz)
  void pubNonce
  const publish = () => {
    saveQuiz(quiz)
    publishQuiz(quiz.id)
    setPubNonce((n) => n + 1)
  }

  const selectedScreen = quiz.screens.find((s) => s.id === selectedId)

  const patchScreen = (id, patch) =>
    setQuiz((q) => ({
      ...q,
      screens: q.screens.map((s) => {
        if (s.id !== id) return s
        const next = { ...s, ...patch }
        // undefined means "remove the key" (logic editor clears fields)
        Object.keys(patch).forEach((k) => patch[k] === undefined && delete next[k])
        return next
      }),
    }))

  const moveScreen = (from, to) =>
    setQuiz((q) => {
      if (to < 0 || to >= q.screens.length) return q
      const screens = [...q.screens]
      const [s] = screens.splice(from, 1)
      screens.splice(to, 0, s)
      return { ...q, screens }
    })

  // Keep per-variant screen lists in sync on add/duplicate/delete.
  const addToVariants = (q, id, afterId) => {
    if (!q.variants) return q.variants
    return Object.fromEntries(
      Object.entries(q.variants).map(([k, v]) => {
        if (!Array.isArray(v.screens)) return [k, v]
        const i = v.screens.indexOf(afterId)
        const screens = [...v.screens]
        screens.splice(i >= 0 ? i + 1 : screens.length, 0, id)
        return [k, { ...v, screens }]
      })
    )
  }

  const uniqueId = (q, base) => {
    let id = base, n = 2
    while (q.screens.some((s) => s.id === id)) id = `${base}-${n++}`
    return id
  }

  const addScreen = (type) =>
    setQuiz((q) => {
      const id = uniqueId(q, type)
      const screen = newScreen(type, id)
      const afterId = selectedScreen?.id ?? q.screens[q.screens.length - 1]?.id
      const i = q.screens.findIndex((s) => s.id === afterId)
      const screens = [...q.screens]
      screens.splice(i >= 0 ? i + 1 : screens.length, 0, screen)
      setSelectedId(id)
      return { ...q, screens, variants: addToVariants(q, id, afterId) }
    })

  const duplicateScreen = (id) =>
    setQuiz((q) => {
      const src = q.screens.find((s) => s.id === id)
      if (!src) return q
      const newId = uniqueId(q, id)
      const copy = structuredClone(src)
      copy.id = newId
      const i = q.screens.findIndex((s) => s.id === id)
      const screens = [...q.screens]
      screens.splice(i + 1, 0, copy)
      setSelectedId(newId)
      return { ...q, screens, variants: addToVariants(q, newId, id) }
    })

  const deleteScreen = (id) =>
    setQuiz((q) => {
      const screens = q.screens.filter((s) => s.id !== id)
      const variants = q.variants
        ? Object.fromEntries(
            Object.entries(q.variants).map(([k, v]) => [
              k,
              Array.isArray(v.screens) ? { ...v, screens: v.screens.filter((x) => x !== id) } : v,
            ])
          )
        : q.variants
      if (selectedId === id) setSelectedId(screens[0]?.id ?? '__settings__')
      return { ...q, screens, variants }
    })

  const reset = () => {
    const fresh = resetToDemo()
    setQuiz(fresh)
    setSelectedId(fresh.screens[0]?.id ?? '__settings__')
  }

  // Library actions: re-sync builder state with whatever is now active.
  const syncFromStorage = (goToBuild = false) => {
    const q = loadQuiz()
    setQuiz(q)
    setSelectedId(q.screens[0]?.id ?? '__settings__')
    if (goToBuild) setTab('build')
  }
  const openQuiz = (id) => {
    setActiveQuiz(id)
    syncFromStorage(true)
  }

  return (
    <div className="flex h-dvh flex-col bg-slate-100 text-slate-800">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-[15px] text-white">⚡</span>
          <span className="text-[15px] font-extrabold tracking-tight">Quiz Builder</span>
        </div>
        <input
          type="text"
          value={quiz.title ?? ''}
          onChange={(e) => setQuiz((q) => ({ ...q, title: e.target.value }))}
          className="w-72 rounded-lg border border-transparent px-2 py-1 text-[13px] font-semibold text-slate-500 outline-none transition-colors hover:border-slate-200 focus:border-indigo-300 focus:text-slate-800"
        />
        <nav className="mx-auto flex gap-1 rounded-full bg-slate-100 p-1">
          {[['build', '🛠️ Build'], ['flow', '🗺️ Flow'], ['library', '📚 Library'], ['json', '{ } JSON'], ['responses', '📊 Responses'], ['howto', '📖 How to']].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-all ${
                tab === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
        {pub.status === 'live' ? (
          <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-[13px] font-bold text-emerald-600">
            ● Live · v{pub.version}
          </span>
        ) : (
          <button
            type="button"
            onClick={publish}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-[13px] font-bold text-white shadow-sm transition-all hover:brightness-110"
          >
            🚀 {pub.status === 'dirty' ? `Publish changes (v${pub.version + 1})` : 'Publish'}
          </button>
        )}
        <a
          href={liveUrl(`?quiz=${quiz.id}`)}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl px-3 py-2 text-[13px] font-bold text-slate-500 transition-colors hover:text-slate-900"
          title={pub.status === 'dirty' ? 'Opens the published production version — your draft edits are not live yet' : 'Open the live quiz'}
        >
          View live ↗
        </a>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-slate-100 px-3 py-2 text-[13px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
        >
          Reset demo
        </button>
      </header>

      {tab === 'responses' ? (
        <ResponsesTab />
      ) : tab === 'flow' ? (
        <FlowMapTab
          quiz={quiz}
          onOpen={(id) => { setSelectedId(id); setTab('build') }}
        />
      ) : tab === 'library' ? (
        <LibraryTab onOpen={openQuiz} onChanged={() => syncFromStorage(false)} />
      ) : tab === 'json' ? (
        <JsonTab quiz={quiz} setQuiz={setQuiz} />
      ) : tab === 'howto' ? (
        <HowToTab />
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-[270px_minmax(360px,1fr)_440px]">
          <aside className="min-h-0 border-r border-slate-200 bg-white">
            <ScreenList
              quiz={quiz}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onMove={moveScreen}
              onAdd={addScreen}
              onDelete={deleteScreen}
              onDuplicate={duplicateScreen}
            />
          </aside>
          <main className="min-h-0 overflow-y-auto">
            {selectedId === '__settings__' || !selectedScreen ? (
              <SettingsPanel quiz={quiz} setQuiz={setQuiz} />
            ) : (
              <ScreenEditor
                key={selectedScreen.id}
                screen={selectedScreen}
                screens={quiz.screens}
                variantParam={quiz.variantParam}
                patch={(p) => patchScreen(selectedScreen.id, p)}
              />
            )}
          </main>
          <aside className="min-h-0 border-l border-slate-200 bg-slate-50">
            <PreviewPane
              quiz={quiz}
              selectedScreenId={selectedId === '__settings__' ? null : selectedId}
            />
          </aside>
        </div>
      )}
    </div>
  )
}

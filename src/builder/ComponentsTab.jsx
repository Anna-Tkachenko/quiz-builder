import { useState } from 'react'
import { TYPE_META, screenTitleOf } from './meta'
import { ELEMENT_TYPES, elementMeta } from './elementMeta'
import { ElementFields } from './ElementFields'

// 🧰 Builder library — reusable building blocks for this quiz:
// Screens (whole-screen templates) and Elements (single pre-customized
// pieces). Both live in the quiz JSON and travel with it.
export default function ComponentsTab({ quiz, setQuiz, onUseScreen }) {
  const [sub, setSub] = useState('screens')
  const screens = quiz.screenLibrary || []
  const elements = quiz.elementLibrary || []
  const setScreens = (v) => setQuiz((q) => ({ ...q, screenLibrary: v }))
  const setElements = (v) => setQuiz((q) => ({ ...q, elementLibrary: v }))

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex gap-1 rounded-full bg-slate-200/70 p-1">
            {[['screens', `📱 Screens (${screens.length})`], ['elements', `🧩 Elements (${elements.length})`]].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSub(key)}
                className={`rounded-full px-4 py-1.5 text-[13px] font-bold transition-all ${
                  sub === key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-[12px] font-semibold text-slate-400">
            {sub === 'screens'
              ? 'Whole-screen templates — save any screen from the Build tab with 💾 Save screen.'
              : 'Single pre-customized elements — save from a custom screen with 💾, or create here.'}
          </p>
        </div>

        {sub === 'screens' ? (
          screens.length === 0 ? (
            <Empty text="No screen templates yet. In the Build tab, open any screen and press 💾 Save screen — it lands here, ready to drop into any quiz flow." />
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {screens.map((item) => (
                <div key={item.id} className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
                  <div className="flex items-start gap-2.5">
                    <span className="text-2xl">{TYPE_META[item.screen.type]?.icon ?? '🧩'}</span>
                    <div className="min-w-0 flex-1">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => setScreens(screens.map((x) => (x.id === item.id ? { ...x, name: e.target.value } : x)))}
                        className="w-full rounded-lg border border-transparent px-1 py-0.5 text-[14px] font-extrabold text-slate-800 outline-none transition-colors hover:border-slate-200 focus:border-indigo-300"
                      />
                      <p className="mt-0.5 truncate px-1 text-[12px] font-medium text-slate-400">
                        {TYPE_META[item.screen.type]?.label ?? item.screen.type}
                        {' · '}
                        {screenTitleOf(item.screen).replace(/\{\{[^}]*\}\}/g, '…') || '—'}
                        {item.screen.blocks ? ` · ${item.screen.blocks.length} elements` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => onUseScreen(item)}
                      className="flex-1 rounded-xl bg-indigo-600 px-3 py-2 text-[12px] font-bold text-white transition-all hover:brightness-110"
                    >
                      ＋ Add to quiz
                    </button>
                    <button
                      type="button"
                      title="Delete template"
                      onClick={() => setScreens(screens.filter((x) => x.id !== item.id))}
                      className="rounded-xl bg-slate-100 px-3 py-2 text-[12px] font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <>
            {elements.length === 0 && (
              <Empty text="No saved elements yet. On a custom screen, press 💾 on any element to keep it here — or create one below." />
            )}
            <div className="flex flex-col gap-3">
              {elements.map((item) => (
                <div key={item.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="mb-2 flex items-center gap-2.5">
                    <span className="w-6 text-center text-lg">{elementMeta(item.element).icon}</span>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => setElements(elements.map((x) => (x.id === item.id ? { ...x, name: e.target.value } : x)))}
                      className="flex-1 rounded-lg border border-transparent px-1 py-0.5 text-[14px] font-extrabold text-slate-800 outline-none transition-colors hover:border-slate-200 focus:border-indigo-300"
                    />
                    <span className="text-[11px] font-bold text-slate-400">{elementMeta(item.element).label}</span>
                    <button
                      type="button"
                      title="Delete element"
                      onClick={() => setElements(elements.filter((x) => x.id !== item.id))}
                      className="px-1 text-slate-300 transition-colors hover:text-rose-500"
                    >
                      ✕
                    </button>
                  </div>
                  {/* edits here update the template for all future inserts */}
                  <ElementFields
                    block={item.element}
                    patchBlock={(p) =>
                      setElements(elements.map((x) => (x.id === item.id ? { ...x, element: { ...x.element, ...p } } : x)))
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 p-4">
              <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">＋ New library element</p>
              <div className="grid grid-cols-4 gap-1.5">
                {ELEMENT_TYPES.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      const el = t.make('tmp')
                      delete el.id
                      setElements([...elements, { id: `lib-new-${elements.length + 1}`, name: t.label, element: el }])
                    }}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-slate-100 px-2 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
                  >
                    <span>{t.icon}</span> {t.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function Empty({ text }) {
  return (
    <div className="mb-4 rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center">
      <p className="text-3xl">🧰</p>
      <p className="mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-slate-500">{text}</p>
    </div>
  )
}

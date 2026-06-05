import { useState } from 'react'
import { TYPE_META, screenTitleOf } from './meta'
import { interpolate } from '../quiz/engine'

// Left pane: ordered screen list. Drag to reorder + ▲▼ fallback,
// add / duplicate / delete. "Theme & settings" is a special entry.
export default function ScreenList({
  quiz, selectedId, onSelect, onMove, onAdd, onDelete, onDuplicate, onAddFromLibrary,
}) {
  const screenLibrary = quiz.screenLibrary || []
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="flex h-full flex-col">
      <button
        type="button"
        onClick={() => onSelect('__settings__')}
        className={`mx-3 mt-3 flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-bold transition-colors ${
          selectedId === '__settings__'
            ? 'bg-indigo-50 text-indigo-700'
            : 'text-slate-600 hover:bg-slate-100'
        }`}
      >
        🎨 Theme & settings
      </button>

      <div className="mx-4 my-2 border-t border-slate-100" />

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {quiz.screens.map((s, i) => {
          const meta = TYPE_META[s.type] || { icon: '❔', label: s.type }
          const selected = s.id === selectedId
          return (
            <div
              key={s.id}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => { e.preventDefault(); setOverIdx(i) }}
              onDragLeave={() => setOverIdx((o) => (o === i ? null : o))}
              onDrop={() => {
                if (dragIdx !== null && dragIdx !== i) onMove(dragIdx, i)
                setDragIdx(null); setOverIdx(null)
              }}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
              onClick={() => onSelect(s.id)}
              className={`group mb-1 flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 transition-colors ${
                selected ? 'bg-indigo-50' : 'hover:bg-slate-100'
              } ${overIdx === i && dragIdx !== i ? 'ring-2 ring-indigo-300' : ''}`}
            >
              <span className="cursor-grab text-slate-300 group-hover:text-slate-400" title="Drag to reorder">⠿</span>
              <span className="text-lg">{meta.icon}</span>
              <div className="min-w-0 flex-1">
                <div className={`truncate text-[13px] font-bold ${selected ? 'text-indigo-700' : 'text-slate-700'}`}>
                  {screenTitleOf(s)
                    ? interpolate(screenTitleOf(s), {}, quiz.variants?.default?.copy).replace(/\s{2,}/g, ' ').trim() || s.id
                    : s.id}
                </div>
                <div className="text-[11px] font-medium text-slate-400">{meta.label}</div>
              </div>
              <div className="flex flex-col">
                <button type="button" title="Move up" disabled={i === 0}
                  onClick={(e) => { e.stopPropagation(); onMove(i, i - 1) }}
                  className="px-1 text-[9px] leading-3 text-slate-300 hover:text-slate-600 disabled:opacity-30">▲</button>
                <button type="button" title="Move down" disabled={i === quiz.screens.length - 1}
                  onClick={(e) => { e.stopPropagation(); onMove(i, i + 1) }}
                  className="px-1 text-[9px] leading-3 text-slate-300 hover:text-slate-600 disabled:opacity-30">▼</button>
              </div>
              <div className="hidden flex-col gap-0.5 group-hover:flex">
                <button type="button" title="Duplicate"
                  onClick={(e) => { e.stopPropagation(); onDuplicate(s.id) }}
                  className="text-[11px] text-slate-300 hover:text-slate-600">⧉</button>
                <button type="button" title="Delete"
                  onClick={(e) => { e.stopPropagation(); onDelete(s.id) }}
                  className="text-[11px] text-slate-300 hover:text-rose-500">✕</button>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-slate-100 p-3">
        {showAdd ? (
          <div className="grid grid-cols-2 gap-1.5">
            {Object.entries(TYPE_META).map(([type, m]) => (
              <button
                key={type}
                type="button"
                onClick={() => { onAdd(type); setShowAdd(false) }}
                className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2 py-2 text-[12px] font-semibold text-slate-600 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
              >
                <span>{m.icon}</span> {m.label}
              </button>
            ))}
            {screenLibrary.length > 0 && (
              <>
                <p className="col-span-2 mt-1 text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                  🧰 Your screen library
                </p>
                {screenLibrary.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => { onAddFromLibrary(item); setShowAdd(false) }}
                    className="col-span-2 flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2 py-2 text-left text-[12px] font-semibold text-indigo-700 transition-colors hover:bg-indigo-100"
                  >
                    <span>{TYPE_META[item.screen.type]?.icon ?? '🧩'}</span>
                    <span className="truncate">{item.name}</span>
                  </button>
                ))}
              </>
            )}
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="col-span-2 rounded-lg py-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-600"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="w-full rounded-xl border-2 border-dashed border-slate-200 py-2.5 text-[13px] font-bold text-slate-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
          >
            + Add screen
          </button>
        )}
      </div>
    </div>
  )
}

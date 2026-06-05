// Per-element edit fields (badge / text / image / options / input / button).
import { isImageValue, readImageFile } from '../lib/visual'
import { elInputCls, elPill } from './elementMeta'

export function ElementFields({ block: b, patchBlock }) {
  switch (b.type) {
    case 'badge':
      return <input type="text" value={b.text ?? ''} onChange={(e) => patchBlock({ text: e.target.value })} placeholder="Badge text" className={elInputCls} />
    case 'text':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex gap-1">
            {[['title', 'Title'], ['subtitle', 'Subtitle'], ['paragraph', 'Paragraph']].map(([v, l]) => (
              <button key={v} type="button" onClick={() => patchBlock({ style: v })} className={elPill((b.style || 'paragraph') === v)}>{l}</button>
            ))}
            <button type="button" onClick={() => patchBlock({ align: b.align === 'center' ? undefined : 'center' })}
              className={elPill(b.align === 'center')} title="Center text">⏺ center</button>
          </div>
          <textarea value={b.text ?? ''} rows={2} onChange={(e) => patchBlock({ text: e.target.value })}
            placeholder="Text… ({{variables}} work)" className={elInputCls + ' resize-y'} />
        </div>
      )
    case 'image':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {isImageValue(b.value) && <img src={b.value} alt="" className="h-9 w-9 shrink-0 rounded-lg border border-slate-200 object-cover" />}
            <input type="text" value={b.value ?? ''} onChange={(e) => patchBlock({ value: e.target.value })}
              placeholder="Image URL or emoji" className={elInputCls} />
            <label className="shrink-0 cursor-pointer rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600">
              🖼 File…
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => { readImageFile(e.target.files?.[0], (v) => patchBlock({ value: v })); e.target.value = '' }} />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[['sm', 'S'], ['md', 'M'], ['lg', 'L'], ['full', 'Full']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => patchBlock({ size: v })} className={elPill((b.size || 'md') === v)}>{l}</button>
              ))}
            </div>
            <div className="flex flex-1 gap-1">
              {[['left', '⬅'], ['center', '⏺'], ['right', '➡']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => patchBlock({ align: v })} className={elPill((b.align || 'center') === v)}>{l}</button>
              ))}
            </div>
          </div>
        </div>
      )
    case 'options':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[['list', '☰ List'], ['grid', '▦ Grid'], ['cards', '🃏 Cards']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => patchBlock({ layout: v })} className={elPill((b.layout || 'list') === v)}>{l}</button>
              ))}
            </div>
            <input type="text" value={b.saveAs ?? ''} onChange={(e) => patchBlock({ saveAs: e.target.value })}
              placeholder="variable" title="Save answer as variable" className={elInputCls + ' max-w-[120px] font-mono text-[11px]'} />
          </div>
          {(b.options || []).map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="text" value={opt.icon ?? ''} placeholder="🙂" title="Emoji or image URL"
                onChange={(e) => patchBlock({ options: b.options.map((o, j) => (j === i ? { ...o, icon: e.target.value } : o)) })}
                className="w-12 rounded-lg border border-slate-200 bg-white py-1.5 text-center text-[13px] outline-none focus:border-indigo-400" />
              <input type="text" value={opt.label ?? ''} placeholder="Option label"
                onChange={(e) => patchBlock({ options: b.options.map((o, j) => (j === i ? { ...o, label: e.target.value } : o)) })}
                className={elInputCls} />
              <button type="button" onClick={() => patchBlock({ options: b.options.filter((_, j) => j !== i) })}
                className="px-1 text-slate-300 hover:text-rose-500">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => patchBlock({ options: [...(b.options || []), { label: '', icon: '' }] })}
            className="rounded-lg border-2 border-dashed border-slate-200 py-1.5 text-[11px] font-bold text-slate-500 hover:border-indigo-300 hover:text-indigo-600">
            + Add option
          </button>
        </div>
      )
    case 'input':
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="flex flex-1 gap-1">
              {[['text', '✍️ Text'], ['email', '✉️ Email']].map(([v, l]) => (
                <button key={v} type="button" onClick={() => patchBlock({ inputType: v })} className={elPill((b.inputType || 'text') === v)}>{l}</button>
              ))}
            </div>
            <input type="text" value={b.saveAs ?? ''} onChange={(e) => patchBlock({ saveAs: e.target.value })}
              placeholder="variable" title="Save answer as variable" className={elInputCls + ' max-w-[120px] font-mono text-[11px]'} />
          </div>
          <input type="text" value={b.placeholder ?? ''} onChange={(e) => patchBlock({ placeholder: e.target.value })}
            placeholder="Placeholder text" className={elInputCls} />
          {b.inputType === 'email' && (
            <input type="text" value={b.privacy ?? ''} onChange={(e) => patchBlock({ privacy: e.target.value })}
              placeholder="Privacy line (optional)" className={elInputCls} />
          )}
        </div>
      )
    case 'button':
      return <input type="text" value={b.label ?? ''} onChange={(e) => patchBlock({ label: e.target.value })} placeholder="Button label" className={elInputCls} />
    default:
      return null
  }
}

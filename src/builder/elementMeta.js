// Shared element-type definitions + styles. Used by the custom screen
// editor and the Builder library's Elements tab.

export const ELEMENT_TYPES = [
  { key: 'badge', icon: '🏷', label: 'Badge', make: (id) => ({ id, type: 'badge', text: '✨ New badge' }) },
  { key: 'text', icon: '𝐓', label: 'Text', make: (id) => ({ id, type: 'text', style: 'paragraph', text: '' }) },
  { key: 'image', icon: '🖼', label: 'Image', make: (id) => ({ id, type: 'image', value: '', size: 'md', align: 'center' }) },
  { key: 'single', icon: '☝️', label: 'Choice (one)', make: (id) => ({ id, type: 'options', multi: false, layout: 'list', saveAs: id, options: [{ label: 'Option A', icon: '🅰️' }, { label: 'Option B', icon: '🅱️' }] }) },
  { key: 'multi', icon: '✅', label: 'Choice (many)', make: (id) => ({ id, type: 'options', multi: true, layout: 'list', saveAs: id, options: [{ label: 'Option A', icon: '🅰️' }, { label: 'Option B', icon: '🅱️' }] }) },
  { key: 'input', icon: '✍️', label: 'Text input', make: (id) => ({ id, type: 'input', inputType: 'text', placeholder: 'Type here…', saveAs: id }) },
  { key: 'email', icon: '✉️', label: 'Email input', make: (id) => ({ id, type: 'input', inputType: 'email', placeholder: 'you@example.com', saveAs: 'email', privacy: 'No spam, ever.' }) },
  { key: 'button', icon: '🔘', label: 'Button', make: (id) => ({ id, type: 'button', label: 'Continue' }) },
]

export const elementMeta = (b) => {
  if (b.type === 'options') return { icon: b.multi ? '✅' : '☝️', label: b.multi ? 'Choice (many)' : 'Choice (one)' }
  if (b.type === 'input') return { icon: b.inputType === 'email' ? '✉️' : '✍️', label: b.inputType === 'email' ? 'Email input' : 'Text input' }
  return ELEMENT_TYPES.find((t) => t.key === b.type) || { icon: '❔', label: b.type }
}

export const elInputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[12px] font-medium outline-none focus:border-indigo-400'
export const elPill = (active) =>
  `flex-1 rounded-lg border py-1 text-[11px] font-bold transition-colors ${
    active ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
  }`


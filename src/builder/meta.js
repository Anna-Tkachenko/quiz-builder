// Screen-type metadata for the builder UI + factories for new screens.

export const TYPE_META = {
  hero: { icon: '🏠', label: 'Hero' },
  'single-select': { icon: '☝️', label: 'Single select' },
  'multi-select': { icon: '✅', label: 'Multi select' },
  message: { icon: '💬', label: 'Message' },
  loader: { icon: '⏳', label: 'Loader' },
  text: { icon: '✍️', label: 'Text input' },
  email: { icon: '✉️', label: 'Email' },
  result: { icon: '🏆', label: 'Result' },
  custom: { icon: '🧩', label: 'Custom (blank)' },
}

// Convert a typed screen into a custom screen's element list — elements are
// seeded from the type's content; logic (show/next) is preserved by the caller.
export function screenToElements(screen) {
  const els = []
  let n = 1
  const add = (b) => els.push({ id: `e${n++}`, ...b })
  const center = ['hero', 'message', 'result'].includes(screen.type)
  const centered = center ? { align: 'center' } : {}
  if (screen.badge) add({ type: 'badge', text: screen.badge })
  if (screen.emoji) add({ type: 'image', value: screen.emoji, size: screen.visualSize || 'md', align: screen.visualAlign || 'center' })
  if (screen.title) add({ type: 'text', style: 'title', text: screen.title, ...centered })
  if (screen.subtitle) add({ type: 'text', style: 'subtitle', text: screen.subtitle, ...centered })
  if (screen.text) add({ type: 'text', style: 'paragraph', text: screen.text, ...centered })
  if (screen.hint) add({ type: 'text', style: 'paragraph', text: screen.hint })
  for (const x of screen.extraBlocks || []) {
    if (x.type === 'image') add({ type: 'image', value: x.value, size: x.size || 'md', align: x.align || 'center' })
    else add({ type: 'text', style: 'paragraph', text: x.value })
  }
  if (screen.type === 'single-select')
    add({ type: 'options', multi: false, layout: screen.layout || 'list', saveAs: screen.saveAs, options: screen.options || [] })
  if (screen.type === 'multi-select')
    add({ type: 'options', multi: true, layout: screen.layout || 'list', saveAs: screen.saveAs, options: screen.options || [] })
  if (screen.type === 'text')
    add({ type: 'input', inputType: 'text', placeholder: screen.placeholder, saveAs: screen.saveAs })
  if (screen.type === 'email')
    add({ type: 'input', inputType: 'email', placeholder: screen.placeholder, saveAs: screen.saveAs, privacy: screen.privacy })
  if (screen.type !== 'single-select') add({ type: 'button', label: screen.cta || 'Continue' })
  return els
}

// Best-effort display title for any screen (custom screens keep their
// title in a text block).
export function screenTitleOf(screen) {
  if (screen.title) return String(screen.title)
  const titleBlock = screen.blocks?.find((b) => b.type === 'text' && b.style === 'title' && b.text)
  return titleBlock ? String(titleBlock.text) : ''
}

export function newScreen(type, id) {
  const base = { id, type }
  switch (type) {
    case 'hero':
      return { ...base, badge: '✨ New quiz', emoji: '👋', title: 'Your headline here', subtitle: 'A short promise that hooks the visitor.', cta: 'Start' }
    case 'single-select':
      return { ...base, layout: 'list', saveAs: id, title: 'Your question?', options: [{ label: 'Option A', icon: '🅰️' }, { label: 'Option B', icon: '🅱️' }] }
    case 'multi-select':
      return { ...base, layout: 'list', saveAs: id, title: 'Pick all that apply', hint: 'Choose as many as you like', cta: 'Next', options: [{ label: 'Option A', icon: '🅰️' }, { label: 'Option B', icon: '🅱️' }] }
    case 'message':
      return { ...base, emoji: '💡', title: 'Nice choice!', text: 'A short transition message.', cta: 'Continue' }
    case 'loader':
      return { ...base, delayMs: 3000, title: 'Working on it…', steps: ['Step one', 'Step two', 'Step three'] }
    case 'text':
      return { ...base, saveAs: id, title: 'What’s your name?', placeholder: 'Type here…', cta: 'Continue' }
    case 'email':
      return { ...base, saveAs: 'email', title: 'Where should we send it?', placeholder: 'you@example.com', privacy: 'No spam, ever.', cta: 'Submit' }
    case 'result':
      return { ...base, emoji: '🎉', title: 'Your result', subtitle: 'Built from the answers.', items: [], cta: 'Continue →', redirect: true }
    case 'custom':
      return {
        ...base,
        blocks: [
          { id: 'e1', type: 'text', style: 'title', text: 'Your custom screen' },
          { id: 'e2', type: 'text', style: 'subtitle', text: 'Add, customize and reorder elements below.' },
          { id: 'e3', type: 'button', label: 'Continue' },
        ],
      }
    default:
      return base
  }
}

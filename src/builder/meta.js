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

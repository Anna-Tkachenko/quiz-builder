import { Visual } from './ui'

// Ordered content blocks for a screen: visual / title / subtitle / text.
// Order comes from screen.blockOrder (builder-editable); missing keys are
// appended in default order, empty blocks are skipped. The visual block
// honors visualSize (sm/md/lg/full) and visualAlign (left/center/right).

const SUPPORTED = ['visual', 'title', 'subtitle', 'text']

const IMG_SIZE = {
  sm: 'max-h-20',
  md: 'max-h-36',
  lg: 'max-h-60',
  full: 'w-full max-h-80',
}
const EMOJI_SIZE = { sm: 'text-4xl', md: 'text-6xl', lg: 'text-8xl', full: 'text-8xl' }
const JUSTIFY = { left: 'justify-start', center: 'justify-center', right: 'justify-end' }

export default function BlockStack({
  screen,
  t,
  centered = false,
  textOverride,
  titleClass,
  subtitleClass,
}) {
  const declared = (screen.blockOrder || []).filter((k) => SUPPORTED.includes(k))
  const order = [...declared, ...SUPPORTED.filter((k) => !declared.includes(k))]
  const size = screen.visualSize || 'md'
  const align = screen.visualAlign || (centered ? 'center' : 'left')

  return order.map((key) => {
    if (key === 'visual' && screen.emoji) {
      return (
        <div key={key} className={`flex w-full ${JUSTIFY[align] || JUSTIFY.left}`}>
          <Visual
            value={screen.emoji}
            textClassName={`animate-pop-in block ${EMOJI_SIZE[size]}`}
            imgClassName={`animate-pop-in ${IMG_SIZE[size]} ${size === 'full' ? 'w-full object-cover' : 'w-auto object-cover'} rounded-2xl shadow-md`}
          />
        </div>
      )
    }
    if (key === 'title' && screen.title) {
      return (
        <h1 key={key} className={titleClass}>
          {t(screen.title)}
        </h1>
      )
    }
    if (key === 'subtitle' && screen.subtitle) {
      return (
        <p key={key} className={subtitleClass}>
          {t(screen.subtitle)}
        </p>
      )
    }
    if (key === 'text') {
      const txt = textOverride !== undefined ? textOverride : screen.text
      if (txt) {
        return (
          <p key={key} className={subtitleClass}>
            {t(txt)}
          </p>
        )
      }
    }
    return null
  })
}

// "Demo" tab — a self-serve pitch & walkthrough for non-technical reviewers
// (acquisition / design / marketing). Pure content, no logic.
import { liveUrl } from '../lib/links'

const STEPS = [
  {
    emoji: '▶️',
    title: 'Play the quiz like a real user',
    who: 'Everyone — start here',
    how: [
      <>Open <A href={liveUrl('')}>the live quiz</A> (or “View live ↗” in the top bar).</>,
      'Go through: hero → questions → loader → email → result. Note the progress bar, the screen transitions, and that your name comes back in later copy.',
      'At the end you’re redirected to the destination URL — it carries your session id, ready for a checkout / CRM handoff.',
    ],
  },
  {
    emoji: '🎯',
    title: 'One link per ad angle — same quiz',
    who: 'Acquisition manager',
    how: [
      <>Open <A href={liveUrl('?angle=switch')}>the same quiz with <code>?angle=switch</code></A> — different hook, different badge, and an extra “Why switch?” question appears.</>,
      'This is one quiz with two variants. The query param key itself (angle, utm_content, …) is set in the quiz — no developer involved.',
      'New angle = “Theme & settings → New variant”, type a key, rewrite the hook. The link works instantly.',
    ],
  },
  {
    emoji: '🔀',
    title: 'Branching, skipping, personalization',
    who: 'Marketing manager',
    how: [
      'Open the 🗺️ Flow tab — the whole journey as a diagram: arrows show where each answer leads, badges show conditional screens. Click any card to edit it.',
      'In the quiz, answer “Never” to the coding question → you get an extra reassurance screen. Any other answer skips it.',
      'Pick “Designing interfaces” or “Analyzing data” → the next message reacts to your specific choice.',
      'Every answer can be saved as a variable and reused in any later copy via {{name}} — type a name early and watch it.',
    ],
  },
  {
    emoji: '🛠️',
    title: 'Edit everything — no code',
    who: 'Designer / marketing manager',
    how: [
      'In the Build tab: click any screen on the left — the phone preview jumps to it. Edit a title and watch it change live, letter by letter.',
      'Drag screens to reorder (or use ▲▼). Add a screen, duplicate one, delete one.',
      'On a question: add an answer option with an emoji icon; switch its layout List → Grid → Cards — same question, different look.',
      'Theme & settings: brand color, font, background, progress bar on/off. The preview is the real renderer — what you see is what ships.',
    ],
  },
  {
    emoji: '📊',
    title: 'Where the data lands',
    who: 'Acquisition manager',
    how: [
      'Every visit mints a session: arrival UTM/query params, the active variant, every answer, completion, and the final destination URL.',
      <>Take the quiz once (try <A href={liveUrl('?angle=switch&utm_source=fb&utm_campaign=demo')}>this link with UTMs</A>), then open the Responses tab — your session is there as a table row.</>,
    ],
  },
  {
    emoji: '{ }',
    title: 'The quiz is one JSON document — and how it ships',
    who: 'For the “how does it scale” question',
    how: [
      'The JSON tab shows the whole quiz as a single document — the contract between this CMS and the renderer.',
      'Hand-off №1 — Publish: the live player serves only published snapshots. Edit anything → 🚀 Publish → refresh the live tab: new version. Drafts never leak to production.',
      <>Hand-off №2 — fully headless: the renderer can fetch the document from <em>any URL</em>. <A href={liveUrl('?src=demo-quiz.json')}>This link</A> plays a <code>quiz.json</code> hosted as a plain static file — the CMS isn’t involved at all. Same idea works with S3, a CDN, or an API.</>,
      <>Hand-off №3 — on <em>your</em> domain: <A href={liveUrl('embed-example.html')}>this mock product page</A> embeds the renderer with one <code>&lt;iframe&gt;</code> — exactly how it would sit on mate.academy or kodree.com. To share a quiz you built with a colleague, download its JSON, host it anywhere, and send them <code>?src=&lt;json-url&gt;</code>.</>,
      'Copy / download / paste-and-apply the JSON. New brand or product = new JSON, same renderer. That’s the ownership play vs. Typeform/Fillout.',
    ],
  },
]

function A({ href, children }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="font-bold text-indigo-600 underline decoration-indigo-200 underline-offset-2 hover:decoration-indigo-500">
      {children}
    </a>
  )
}

export default function DemoTab() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-[13px] font-extrabold uppercase tracking-wider text-indigo-500">Demo guide</p>
        <h1 className="mt-2 text-[28px] font-extrabold tracking-tight text-slate-900">
          Quiz funnels we own — built &amp; edited without developers
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-slate-500">
          Today every product runs quizzes in a 3rd-party tool (Typeform, Fillout…). This is a
          2-hour spike proving we can own that layer: a marketer assembles a quiz in this builder,
          it’s stored as one JSON document, and the renderer plays it — per-ad-angle content,
          branching, personalization, and data capture included. Below is the 5-minute tour to
          give anyone.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          {STEPS.map((s, i) => (
            <div key={i} className="rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-lg font-bold">{s.emoji}</span>
                <div>
                  <h2 className="text-[16px] font-extrabold text-slate-800">{i + 1}. {s.title}</h2>
                  <p className="text-[12px] font-bold text-slate-400">{s.who}</p>
                </div>
              </div>
              <ul className="mt-4 flex flex-col gap-2">
                {s.how.map((h, j) => (
                  <li key={j} className="flex gap-2 text-[14px] leading-relaxed text-slate-600">
                    <span className="text-indigo-400">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-5 text-[13px] leading-relaxed text-slate-500">
          <strong className="text-slate-700">Scope notes (it’s a spike):</strong> everything is stored
          locally in this browser — no backend, no auth. “Reset demo” (top right) restores the
          original demo quiz at any point, so feel free to break things.
          <br />
          <strong className="text-slate-700">Also try the Library tab:</strong> every quiz built
          here is its own JSON document with its own link (<code>/?quiz=id</code>) and per-quiz
          session stats — duplicate the demo, re-theme it, and you have a second product’s funnel
          in a minute.
        </div>
      </div>
    </div>
  )
}

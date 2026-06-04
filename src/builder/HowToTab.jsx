import { liveUrl } from '../lib/links'

// 📖 How to use — the plain-language user manual. Three parts:
// what it is / how to build / how to ship. Zero jargon.

const BUILD_STEPS = [
  { emoji: '📚', text: <>Go to <b>Library</b> → <b>＋ New quiz</b> (or <b>⧉ duplicate</b> an existing one — fastest start).</> },
  { emoji: '🧱', text: <>In <b>Build</b>, use <b>+ Add screen</b> to add steps: a hero, questions, a message, a loader, email, result. Drag to reorder.</> },
  { emoji: '✏️', text: <>Click a screen → edit its text on the left, watch the phone on the right update <b>as you type</b>. Add answer options with an emoji or a picture (🖼 Image…).</> },
  { emoji: '🔀', text: <>Want different paths? On a question, open <b>Flow</b>: pick where each answer leads (“Yes → screen A”). Use <b>Visibility → Only show when…</b> to show a screen to some people only.</> },
  { emoji: '🪄', text: <>Personalize: name a question’s variable in <b>Data</b> (e.g. <code>name</code>), then write <code>{'{{name}}'}</code> in any later text — it’s replaced with the user’s answer.</> },
  { emoji: '🎯', text: <>Different ad angles? <b>Theme &amp; settings → New variant</b>: each variant has its own headline and its own set of screens, selected by the link (<code>?angle=…</code>). Test them with the switcher above the phone.</> },
  { emoji: '🎨', text: <>Brand it in <b>Theme &amp; settings</b>: color, font, background, progress bar. Set the <b>Destination URL</b> — where people go after the quiz.</> },
]

const SHIP_STEPS = [
  { emoji: '🚀', text: <>Press <b>Publish</b> (top right). Until you publish, your edits are a private draft — the live quiz keeps running the last published version.</> },
  { emoji: '🔗', text: <>Share the link: <b>View live ↗</b> or <code>/?quiz=&lt;id&gt;</code> from the Library card. Add your angle: <code>?quiz=&lt;id&gt;&amp;angle=switch</code> — one link per ad.</> },
  { emoji: '🌐', text: <>Put it on your site: one <code>&lt;iframe&gt;</code> on any page, any domain — <a className="font-bold text-indigo-600 underline" href={liveUrl('embed-example.html')} target="_blank" rel="noreferrer">see a working example</a>. Or export the JSON and serve it from anywhere with <code>?src=&lt;url&gt;</code>.</> },
  { emoji: '📊', text: <>Watch results in <b>Responses</b>: every visitor’s answers, the ad params they came with, which angle and version they saw, and completion rates per angle.</> },
  { emoji: '🔁', text: <>Iterate safely: edit → <b>Publish changes</b> → a new version goes live. The Responses table shows which version each person played, so you can compare.</> },
]

function Steps({ items }) {
  return (
    <ol className="mt-4 flex flex-col gap-3">
      {items.map((s, i) => (
        <li key={i} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-lg">{s.emoji}</span>
          <span className="pt-1 text-[14px] leading-relaxed text-slate-600">
            <b className="mr-1.5 text-indigo-500">{i + 1}.</b>
            {s.text}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default function HowToTab() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-[13px] font-extrabold uppercase tracking-wider text-indigo-500">How to use</p>
        <h1 className="mt-2 text-[28px] font-extrabold tracking-tight text-slate-900">
          From idea to a live quiz — no developer needed
        </h1>

        <section className="mt-8">
          <h2 className="text-[18px] font-extrabold text-slate-800">🤔 What is this?</h2>
          <p className="mt-3 rounded-2xl bg-white p-5 text-[14px] leading-relaxed text-slate-600 shadow-sm">
            A tool for building <b>marketing quiz funnels</b> — the “answer a few questions, get your
            plan, leave your email” flows you’ve seen on Typeform or Fillout. The difference:
            <b> you own it</b>. You assemble the quiz here, press Publish, and share one link.
            It adapts to the ad each visitor came from, branches on their answers, captures their
            contact, and sends them to your destination page.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[18px] font-extrabold text-slate-800">🛠️ How to build a quiz</h2>
          <Steps items={BUILD_STEPS} />
          <p className="mt-3 text-[13px] font-semibold text-slate-400">
            Lost in a flow? Open the 🗺️ <b>Flow</b> tab — your whole quiz as a picture, with arrows
            showing where every answer leads. Broke something? <b>Reset demo</b> restores the original.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-[18px] font-extrabold text-slate-800">🚀 How to ship it to production</h2>
          <Steps items={SHIP_STEPS} />
        </section>

        <p className="mt-8 rounded-2xl border-2 border-dashed border-slate-200 p-5 text-[13px] leading-relaxed text-slate-500">
          <b className="text-slate-700">The 60-second version:</b> Library → duplicate a quiz →
          change the words → 🚀 Publish → share the link. That’s a real, working funnel.
        </p>
      </div>
    </div>
  )
}

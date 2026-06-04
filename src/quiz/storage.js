// localStorage persistence: a LIBRARY of quiz docs + the active one + responses.
// Keys carry SCHEMA_VERSION — on mismatch we reset to the demo library.

import { SCHEMA_VERSION } from './engine'
import { demoQuiz } from './demoQuiz'

const LIB_KEY = `quizbuilder.library.v${SCHEMA_VERSION}`
const RESPONSES_KEY = `quizbuilder.responses.v${SCHEMA_VERSION}`

function clearStaleKeys() {
  const stale = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith('quizbuilder.') && k !== LIB_KEY && k !== RESPONSES_KEY) {
      stale.push(k)
    }
  }
  stale.forEach((k) => localStorage.removeItem(k))
}

function defaultLibrary() {
  const demo = structuredClone(demoQuiz)
  return {
    activeId: demo.id,
    quizzes: { [demo.id]: demo },
    // production snapshots, keyed by quiz id — the demo ships pre-published
    published: {
      [demo.id]: { version: 1, publishedAt: new Date().toISOString(), quiz: structuredClone(demo) },
    },
  }
}

export function loadLibrary() {
  clearStaleKeys()
  try {
    const raw = localStorage.getItem(LIB_KEY)
    if (raw) {
      const lib = JSON.parse(raw)
      if (lib?.quizzes && lib.activeId && lib.quizzes[lib.activeId]) {
        // migration: libraries saved before publishing existed → snapshot all as v1
        if (!lib.published) {
          lib.published = {}
          for (const [id, q] of Object.entries(lib.quizzes)) {
            lib.published[id] = { version: 1, publishedAt: new Date().toISOString(), quiz: structuredClone(q) }
          }
          saveLibrary(lib)
        }
        return lib
      }
    }
  } catch {
    /* corrupted — fall through */
  }
  const lib = defaultLibrary()
  saveLibrary(lib)
  return lib
}

function saveLibrary(lib) {
  localStorage.setItem(LIB_KEY, JSON.stringify(lib))
}

// --- Active quiz (what the builder edits / `/` plays by default) --------

export function loadQuiz() {
  const lib = loadLibrary()
  return lib.quizzes[lib.activeId]
}

export function saveQuiz(quiz) {
  const lib = loadLibrary()
  lib.quizzes[quiz.id] = quiz
  saveLibrary(lib)
}

export function getQuizById(id) {
  return loadLibrary().quizzes[id] ?? null
}

export function setActiveQuiz(id) {
  const lib = loadLibrary()
  if (lib.quizzes[id]) {
    lib.activeId = id
    saveLibrary(lib)
  }
}

// --- Library management --------------------------------------------------

export function listQuizzes() {
  const lib = loadLibrary()
  return { activeId: lib.activeId, quizzes: Object.values(lib.quizzes) }
}

export function createQuiz() {
  const lib = loadLibrary()
  let id, n = Object.keys(lib.quizzes).length + 1
  do { id = `quiz-${n++}` } while (lib.quizzes[id])
  const quiz = starterQuiz(id)
  lib.quizzes[id] = quiz
  lib.activeId = id
  saveLibrary(lib)
  return quiz
}

export function duplicateQuiz(id) {
  const lib = loadLibrary()
  const src = lib.quizzes[id]
  if (!src) return null
  const copy = structuredClone(src)
  let newId = `${id}-copy`, n = 2
  while (lib.quizzes[newId]) newId = `${id}-copy-${n++}`
  copy.id = newId
  copy.title = `${copy.title || id} (copy)`
  lib.quizzes[newId] = copy
  lib.activeId = newId
  saveLibrary(lib)
  return copy
}

export function deleteQuiz(id) {
  const lib = loadLibrary()
  if (!lib.quizzes[id] || Object.keys(lib.quizzes).length <= 1) return
  delete lib.quizzes[id]
  delete lib.published?.[id]
  if (lib.activeId === id) lib.activeId = Object.keys(lib.quizzes)[0]
  saveLibrary(lib)
}

// Restores the original demo quiz (draft + published) and makes it active.
export function resetToDemo() {
  const lib = loadLibrary()
  const demo = structuredClone(demoQuiz)
  lib.quizzes[demo.id] = demo
  lib.activeId = demo.id
  const prev = lib.published?.[demo.id]
  lib.published[demo.id] = {
    version: (prev?.version ?? 0) + 1,
    publishedAt: new Date().toISOString(),
    quiz: structuredClone(demo),
  }
  saveLibrary(lib)
  return demo
}

// --- Publishing -----------------------------------------------------------
// The draft (lib.quizzes) is what the builder edits. Publishing snapshots it
// into lib.published — that's what the live player serves. Editing after a
// publish never touches production until the next publish.

export function publishQuiz(id) {
  const lib = loadLibrary()
  const draft = lib.quizzes[id]
  if (!draft) return null
  const prev = lib.published[id]
  lib.published[id] = {
    version: (prev?.version ?? 0) + 1,
    publishedAt: new Date().toISOString(),
    quiz: structuredClone(draft),
  }
  saveLibrary(lib)
  return lib.published[id]
}

// 'live' (draft == production) | 'dirty' (unpublished edits) | 'unpublished'
// `draftOverride` lets callers pass not-yet-persisted in-memory state.
export function getPublishState(id, draftOverride) {
  const lib = loadLibrary()
  const pub = lib.published?.[id]
  if (!pub) return { status: 'unpublished', version: null, publishedAt: null }
  const draft = draftOverride ?? lib.quizzes[id]
  const dirty = JSON.stringify(draft) !== JSON.stringify(pub.quiz)
  return { status: dirty ? 'dirty' : 'live', version: pub.version, publishedAt: pub.publishedAt }
}

// What the live player serves: the published snapshot; falls back to the
// draft for never-published quizzes (so a play link always works).
export function getPlayableQuiz(id) {
  const lib = loadLibrary()
  const qid = id && lib.quizzes[id] ? id : lib.activeId
  const pub = lib.published?.[qid]
  if (pub) return { quiz: pub.quiz, version: pub.version }
  return { quiz: lib.quizzes[qid], version: null }
}

// A playable starting point for "New quiz" — hero → question → email → result.
function starterQuiz(id) {
  return {
    id,
    title: 'Untitled quiz',
    theme: { primaryColor: '#0EA5E9', font: 'Inter', background: '#F8FAFC', stepper: true },
    variantParam: 'angle',
    destination: 'https://example.com/start?session={{sessionId}}',
    variants: {
      default: {
        copy: {
          heroBadge: '✨ 1-minute quiz',
          heroTitle: 'Your headline here',
          heroSubtitle: 'Tell the visitor what they’ll get for answering.',
          heroCta: 'Start',
        },
      },
    },
    screens: [
      { id: 'hero', type: 'hero', badge: '{{variant.heroBadge}}', title: '{{variant.heroTitle}}', subtitle: '{{variant.heroSubtitle}}', cta: '{{variant.heroCta}}', emoji: '✨' },
      { id: 'q1', type: 'single-select', layout: 'list', saveAs: 'goal', title: 'What brings you here?', options: [{ label: 'Just curious', icon: '👀' }, { label: 'I have a goal', icon: '🎯' }] },
      { id: 'email', type: 'email', saveAs: 'email', title: 'Where should we send your result?', placeholder: 'you@example.com', privacy: 'No spam, ever.', cta: 'Submit' },
      { id: 'result', type: 'result', emoji: '🎉', title: 'You’re all set!', subtitle: 'Personalize this with {{goal}}.', items: [], cta: 'Continue →', redirect: true },
    ],
  }
}

// --- Responses ------------------------------------------------------------

export function loadResponses() {
  try {
    const raw = localStorage.getItem(RESPONSES_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* corrupted */
  }
  return []
}

function saveResponses(list) {
  localStorage.setItem(RESPONSES_KEY, JSON.stringify(list))
}

export function upsertResponse(sessionId, patch) {
  const list = loadResponses()
  const i = list.findIndex((r) => r.sessionId === sessionId)
  if (i >= 0) {
    list[i] = { ...list[i], ...patch, answers: { ...list[i].answers, ...patch.answers } }
  } else {
    list.push({
      sessionId,
      startedAt: new Date().toISOString(),
      answers: {},
      completed: false,
      ...patch,
    })
  }
  saveResponses(list)
}

export function clearResponses() {
  localStorage.removeItem(RESPONSES_KEY)
}

// Flow engine — pure functions over the quiz JSON (the contract).
// ctx = { ...arrivalParams, ...answers, sessionId } — answers win over params.

export const SCHEMA_VERSION = 3

export function resolveVariant(quiz, params = {}) {
  const raw = quiz.variantParam ? params[quiz.variantParam] : undefined
  if (raw && quiz.variants?.[raw]) return { key: raw, variant: quiz.variants[raw] }
  return { key: 'default', variant: quiz.variants?.default ?? {} }
}

export function evalCond(cond, ctx) {
  if (!cond || !cond.var) return true
  const val = ctx[cond.var]
  switch (cond.op) {
    case 'eq':       return String(val) === String(cond.value)
    case 'neq':      return String(val) !== String(cond.value)
    case 'in':       return Array.isArray(cond.value) && cond.value.map(String).includes(String(val))
    case 'contains': return Array.isArray(val)
      ? val.includes(cond.value)
      : String(val ?? '').includes(String(cond.value))
    case 'exists':   return val !== undefined && val !== null && val !== ''
    default:         return true
  }
}

// Ordered screens for the active variant (before show-conditions).
export function variantScreens(quiz, variant) {
  if (Array.isArray(variant?.screens) && variant.screens.length > 0) {
    return variant.screens
      .map((id) => quiz.screens.find((s) => s.id === id))
      .filter(Boolean)
  }
  return quiz.screens
}

// Screens the user can actually see right now (show-conditions applied).
export function getFlow(quiz, variant, ctx) {
  return variantScreens(quiz, variant).filter((s) => evalCond(s.show, ctx))
}

// Next screen id after `screen`, honoring conditional `next` rules,
// falling back to flow order. Returns null at the end of the quiz.
export function getNext(screen, quiz, variant, ctx) {
  const flow = getFlow(quiz, variant, ctx)
  let target = null
  if (Array.isArray(screen.next)) {
    for (const rule of screen.next) {
      if (!rule.when || evalCond(rule.when, ctx)) { target = rule.goto; break }
    }
  } else if (typeof screen.next === 'string') {
    target = screen.next
  }
  if (target) {
    if (flow.some((s) => s.id === target)) return target
    // goto target is hidden (skip) — walk forward from it in variant order
    const base = variantScreens(quiz, variant)
    const bi = base.findIndex((s) => s.id === target)
    if (bi >= 0) {
      for (let i = bi + 1; i < base.length; i++) {
        if (flow.some((f) => f.id === base[i].id)) return base[i].id
      }
      return null
    }
    // unknown target (e.g. deleted in the builder) — fall back to flow order
  }
  const i = flow.findIndex((s) => s.id === screen.id)
  return i >= 0 && i + 1 < flow.length ? flow[i + 1].id : null
}

// {{name}} / {{name|fallback}} / {{variant.heroTitle}} interpolation.
export function interpolate(text, ctx, variantCopy = {}) {
  if (text === null || text === undefined) return ''
  return String(text).replace(
    /\{\{\s*([\w.]+)\s*(?:\|([^}]*))?\}\}/g,
    (_, path, fallback) => {
      let val
      if (path.startsWith('variant.')) val = variantCopy[path.slice(8)]
      else val = ctx[path]
      if (Array.isArray(val)) val = val.join(', ')
      return val !== undefined && val !== null && val !== ''
        ? String(val)
        : (fallback ?? '')
    }
  )
}

// For message screens (C7): first matching conditional text, else default.
export function resolveMessageText(screen, ctx) {
  if (Array.isArray(screen.conditionalText)) {
    for (const c of screen.conditionalText) {
      if (evalCond(c.when, ctx)) return c.text
    }
  }
  return screen.text ?? ''
}

export function genSessionId() {
  return 'qs_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

# Decisions log

- **Quiz library tab: rejected.** Multi-quiz management is on the brief's DO-NOT-BUILD list, serves no DoD checkpoint, and would refactor the storage/player/responses core late in the build. Instead: a per-variant funnel stats strip in Responses (starts / completions / rate) — in-scope (§5.4), computed from already-captured data — plus a roadmap note in the Demo tab.

- **Every variant (incl. default) carries an explicit ordered `screens` list** — variant = which screens + order (C1). A variant without a list shows all screens (fallback). The builder keeps these lists in sync on add/duplicate/delete.
- **Branching is per-screen conditional `next`** (`[{when, goto}, {goto}]`) instead of a global `branching` array — local to the screen, editable in the builder's Logic JSON box.
- **Logic editing in the builder = validated JSON textarea** (show / next / conditionalText). Full engine power without building a rule-builder UI in the time budget.
- **No StrictMode** — dev double-mount would mint two sessions per page view.
- **Schema bumped to v2** after the default-variant fix; version mismatch in localStorage auto-resets to the demo quiz.

- **Schema**: extended from brief §5.1. Screens are an ordered array; flow = array order, modified by `show` (skip conditions), `branching` rules (goto on answer/param), and per-variant `screens` allow-list + `order` override. This makes C1 (variant changes which screens + order) first-class.
- **Conditions**: small JSON condition objects `{ var, op, value }` with ops `eq/neq/in/contains/exists`. `var` resolves from saved answers first, then arrival query params. No string expression parser — JSON-editable in the builder later.
- **Variants**: `variantParam` names the query param key; `variants[value]` provides `copy` overrides (referenced as `{{variant.x}}`), optional `screens` (subset/order of screen ids), and `theme` overrides.
- **Templating**: `{{name}}` from saved answers/params, `{{variant.x}}` from active variant copy. Unknown vars render fallback (`{{name|friend}}` supported).
- **One renderer**: `<QuizPlayer quiz={...} searchParams={...}/>` — used by the live app at `/` and later mounted in the builder's phone preview. Screen registry maps `type → component`; `layout` is a prop.
- **Routing**: no router lib — hash-based view switch (`#/builder`) later; player reads `window.location.search` (builder preview passes params explicitly).
- **Multi-select counts for branching** via `contains` op.
- **Loader**: timed progress steps, auto-advances after `delayMs`.
- **Reset/versioning**: `SCHEMA_VERSION` const stored alongside quiz in localStorage (Phase 3+).

# Quiz Builder — headless CMS + renderer

A marketing quiz funnel platform: a marketer assembles a quiz in the **builder
(CMS)**, it's stored as **one JSON document (the contract)**, and the **renderer**
plays it — branching, query-param variants, variables, theming — with no
developer in the loop per quiz.

## Run

```bash
nvm use && npm install && npm run dev
```

| View | URL |
|---|---|
| Live quiz (default angle) | `http://localhost:5173/` |
| Live quiz (switch angle) | `http://localhost:5173/?angle=switch` |
| Builder (CMS) | `http://localhost:5173/#/builder` |
| Responses | Builder → 📊 Responses tab |

## Architecture

```
Builder (CMS)  ──saves──▶  quiz JSON (localStorage)  ──read──▶  QuizPlayer  ──▶  user
                            the contract                       one renderer
                                                                    │
                                                  answers + params + variant ──▶ Responses
```

- **One renderer** (`src/player/QuizPlayer.jsx`) — used by the live app *and*
  mounted inside the builder's phone preview. What you preview is what ships.
- **One component per screen type** (`src/player/screens/`): hero, single-select
  (list/grid/cards layouts), multi-select, message, loader, text, email, result.
  `layout` is a presentation prop on the same logical type.
- **Pure flow engine** (`src/quiz/engine.js`): variant resolution (C1), branching
  (C2), skip (C3), `{{variables}}` (C4), conditional messages (C7).
- **Demo quiz** (`src/quiz/demoQuiz.js`): Mate-flavored "Find your perfect IT
  career path" with two angles, a branch, captured name, loader, email, result.

## Customization model (the hero)

- `variantParam` — the quiz defines *which* query param key selects a variant
  (`angle`, `utm_content`, …).
- Each variant carries copy overrides (`{{variant.x}}`) **and its own ordered
  screen list** — a param changes which screens appear and in what order.
- Screens take `show` (skip) and conditional `next` (branch) rules — small JSON
  condition objects, editable in the builder's Logic box.
- Answers `saveAs` variables, reused via `{{name}}` in any later copy and in the
  destination URL (which also carries `{{sessionId}}`).

See `DECISIONS.md` for the build-time decision log.

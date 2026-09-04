# CONTEXT.md — DoughLoops2

Working notes for future sessions. Not user-facing docs; see `README.md` for
that, and `STYLE_GUIDE.md` for the conventions these notes assume (portable to
sibling projects).

## What this is

An in-browser step sequencer / drum machine. Deployed as a static SPA to GitHub
Pages (`https://evanczako.github.io/DoughLoops2/`) with a small Express + SQLite
API on Render (`https://doughloops2.onrender.com`) for user accounts and saved
loops. Part of a portfolio family that links back to `evanczako.com` and
`DoughLab2`.

## Layout

```
/                      root workspace: prettier + `npm run dev`; lint delegates to client
  client/              Vite + React 19 + TypeScript SPA (the whole app)
    src/main.tsx       entry: StrictMode > ErrorBoundary > App
    src/App.tsx        composition root; owns stepRef, viewport listener, spacebar transport
    src/store.ts       single zustand store — ALL app state, plus the persistence subscription
    src/instruments.ts instrument identity/order — the one place that array lives
    src/utils.ts       encode/decodeDrumGrid — the beatRep serialization format
    src/api.ts         fetch wrapper: bearer token, 60s timeout, ApiError
    src/persistence.ts working-loop localStorage round-trip
    src/theme.ts       TEMPORARY theme-preview scaffolding (see below)
    src/gridMetrics.ts cell sizing + the aspect-ratio bound
    src/components/    14 components, flat
    src/styles/        one *.module.css per component + variables.module.css
    public/samples/    24 mp3s: {kick,clap,snare,hat,rim,tom,cymbal,triangle}{1,2,3}
  server/              Express 5 + sqlite3
    index.js           routes
    auth.js            sessions, requireAuth middleware, rate limiter
    db.js / schema.js  single shared connection; users / doughloops / sessions
```

## Key facts to know before editing

**`beatRep` is the serialization format.** One string, defined only by
`utils.ts`. Shape:

```
"<bpm>,<numBeats>,<subdivisions>::<sample>:<vol>|...(8x)::<row0 bits>::<row1 bits>::...(8 rows)"
```

It is the on-disk format in SQLite, the shape of the hardcoded demo loops in
`DemoLoopList.tsx`, the default loop in `store.ts`, _and_ what
`persistence.ts` writes to localStorage. There is no version tag and no
migration path, so changing the format breaks every saved loop. `decodeDrumGrid`
is the trust boundary for all four sources: it validates ranges strictly and
normalises rows, sample names and volumes rather than assuming.

**Instrument order lives in exactly one place.** `src/instruments.ts`. Position
in `INSTRUMENTS` is the grid row index, the volume index, the sample index and
the row order in a `beatRep`. Nothing else hardcodes that array any more — keep
it that way.

**Orientation is pure CSS.** `@media (orientation: portrait)` throughout. The
store does not track orientation and nothing writes `data-orientation`.
`DrumGrid` renders **one** tree: every cell carries `--row` / `--col` custom
properties and the portrait block swaps which axis each feeds, transposing the
grid. Don't reintroduce a second JSX branch.

**Design tokens are seed-driven.** `styles/variables.module.css` has three
layers: ~20 _seed_ colors, then a _derived_ layer that computes every semantic
and component token from those seeds with `color-mix()`, then theme-independent
_structure_ (sizes, radii, motion, elevation). A theme is one
`[data-theme='...']` block of seeds and nothing else -- no theme ever restates a
semantic token. No component CSS contains a hardcoded color; if you add one, it
will not follow the theme.

`--stripe-base` is what a theme sets for beat-band contrast; `--stripe-strength`
is what the grid reads, so a `[data-shape]` variant can scale it. Shape blocks
sit at the very bottom of the file because `[data-shape]` and `[data-theme]`
have equal specificity on `<html>` -- source order is the only thing separating
them.

**TEMPORARY: theme switcher.** A compact swatch button in the header (rendered
by `TitleBox`) opens a portalled panel with fourteen themes (ten dark, four
light) and a Soft/Sharp/Round cell-shape control. Choices persist to
localStorage and are applied pre-paint in `main.tsx`. Each swatch carries its
own `data-theme`, so it renders in the colours it represents.

It sits in the header rather than floating: in portrait the bottom of the screen
belongs to the transport and beat/split panels, and a floating pill covered
them. The panel is portalled and `position: fixed` because `.App` and
`.mainContent` both clip overflow, so an absolutely positioned popover would be
cut off. Removal steps are listed in the header of `src/theme.ts`. It exists to compare looks in the running app. To remove it: pick a
theme, fold its seeds into the `:root` seed block, then delete `src/theme.ts`,
`components/ThemeSwitcher.tsx`, `styles/ThemeSwitcher.module.css`, the two
`applyTheme`/`applyShape` calls in `main.tsx`, the `<ThemeSwitcher />` line in
`App.tsx`, and the `[data-theme]` / `[data-shape]` blocks. The defaults
(`midnight`, `soft`) deliberately write no attribute, so the DOM is already
clean once the scaffolding goes.

**Sizing.** Two separate mechanisms, deliberately:

- _Type scale._ `store.updateViewportMetrics()` runs on resize (rAF-throttled in
  `App.tsx`) and writes only `--base-font-size` to `documentElement`. No
  component holds a font size in state.
- _Grid geometry._ `gridMetrics.ts` + a `ResizeObserver` in `DrumGrid` measure
  the sequencer's own content box and write `--cell-w`, `--cell-h` and
  `--kit-main` onto that element. The viewport is not consulted: the grid's
  panel is not the window.

`computeGridMetrics()` clamps the cell's **aspect ratio** — at most `MAX_TALL`
(2) times taller than wide, at most `MAX_WIDE` (1.5) times wider than tall. Past
the bound the grid scrolls rather than compressing further; a 64-step pattern
used to produce cells four times taller than wide, which read as a bar chart
rather than a step. Grid tracks are therefore fixed sizes, not `1fr` — once the
ratio is bounded the grid _must_ be free to outgrow its scroll area.

Ordering inside `computeGridMetrics` matters: each orientation resolves one axis
from the panel and derives the other, so the kit track's size (which follows the
cell height) never feeds back into the space left for the grid. For the same
reason the `ResizeObserver` watches the sequencer's `contentRect`, not the
scroll area — a scrollbar appearing must not change the measurement that decided
whether it appears. A scrollbar allowance is reserved unconditionally.

**Audio.** `DrumLoopPlayer` renders `null`; it is side-effect-only. It builds 24
`Tone.Player`s keyed by sample name, and drives `Tone.getTransport()
.scheduleRepeat` at an interval expressed in **ticks** (`PPQ / numSubdivisions`),
so a tempo change is a `bpm.rampTo()` rather than a transport teardown. The
playhead repaints via `Tone.getDraw().schedule(..., time)` so the highlight
lands with the sound instead of at schedule time. `stepRef` (a `useRef` created
in `App.tsx`, threaded down) is the real playhead; `store.currentStep` only
drives the highlight. `Tone.start()` is called from the click handler in
`ControlsContainer`, not from an effect — it needs the user gesture.

**The account feature is deliberately disconnected.** Nothing mounts
`AuthPage` / `UserLoopsWrapper`, so login, register and saved loops are
unreachable and Vite tree-shakes them out of the bundle. The code is kept on
purpose — do not delete it as dead code. `App.tsx` carries the reconnection
steps in a header comment. Everything it needs still exists and compiles --
`AuthPage`, `LoginForm`, `RegisterForm`, `LogoutButton`, `UserLoopsWrapper`,
`NewDoughLoopForm`, `DoughLoopList`, `api.ts`, the `user` / `token` /
`doughLoops` slice of the store, and the whole server -- so Vite tree-shakes it
out of the bundle rather than dropping it from the repo. The demo dropdown
renders `DemoLoopList` directly and is unrelated to any of this.

**Auth (when reconnected).** Session tokens, not client-supplied ids. `/login`
returns a token stored in localStorage under `doughloops.token`; `api.ts`
attaches it as a bearer header; `requireAuth` resolves it to `req.userId`
server-side. No route reads a userId from the caller. A 401 anywhere logs the
client out. The server is live and hardened regardless of whether the UI is
wired up.

## Commands

```bash
npm run dev                 # root: client (vite :5173) + server (:3000)
npm run lint                # delegates to client's flat ESLint config
npm run format              # prettier, 4-space, single quotes, 100 cols
npm run typecheck           # tsc --noEmit, clean as of this writing
npm run check               # typecheck + lint + build, the pre-commit gate
cd client && npm run deploy # gh-pages -d dist
```

`client/.env` points at localhost:3000; `client/.env.production` at Render.
Render spins down on the free tier — `api.ts` allows 60s and the login form says
so. CORS accepts any `localhost:<port>` when `NODE_ENV !== 'production'`.

## Gotchas

- `:root` inside a CSS module is global. Every token belongs in
  `styles/variables.module.css`; per-module `:root` blocks are how this codebase
  ended up with two competing palettes once before.
- The grid's leading track is the beat ruler, not a cell row. In landscape
  `grid-template-rows` starts with `var(--ruler-track)` and cells offset with
  `calc(var(--row) + 1)`; portrait does the same on the column axis. Forget the
  offset and every cell lands one track out.
- **The portrait `@media` block must stay last in `DrumGrid.module.css`.** A
  media query adds no specificity, so those rules beat their landscape
  counterparts on source order alone. Base rules appended after it silently win
  — that is how the portrait beat ruler ended up laid out along the wrong axis,
  which also spawned four stray implicit grid columns.
- In portrait, `.controlsTrack` and `.grid` share a track template
  (`var(--ruler-track)` plus one column per instrument) and are both
  left-aligned, not centred. Centring them independently misaligns the kit,
  because the grid centres inside the scroll area and that box is narrower than
  the sequencer by the width of the vertical scrollbar. Control items are placed
  explicitly via `--lane`, mirroring how cells use `--row` / `--col`.
- `RULER` in `gridMetrics.ts` is the ruler's track size on whichever axis it
  occupies: a row in landscape, a column in portrait. Portrait subtracts it from
  the available width; forgetting to made the grid wider than its container, and
  `overflow-x: hidden` then clipped the right edge, which reads as the grid
  being shifted left rather than as an overflow.
- `GRID_GAP` in `gridMetrics.ts` must stay equal to the `gap` on `.grid` /
  `.controlsTrack`, and `--kit-track-extra` must equal `KIT_GAP + VOL_THICKNESS`.
  These are the two places where the JS model of the layout and the CSS have to
  agree; if the grid starts overflowing by a few pixels, check them first.
- ResizeObserver callbacks and rAF are suspended in a throttled/occluded tab, so
  automated checks that resize a container and immediately read back will see
  stale values unless something forces a paint (a screenshot will).
- The grid can render up to 16 × 8 = 128 columns. Cells use a roving tabindex —
  only one checkbox is in the tab order — and arrow keys read their origin from
  the focused element, not from state (key repeat outruns React).
- Known-deferred, deliberately: tests and CI; `beatRep` versioning; Tone.js
  code-splitting; replacing the remaining JS type-scale pipeline with container
  queries; a velocity/accent layer on the grid.

## Conventions

Prettier: 4 spaces, single quotes, 100 print width, trailing commas. Comments
were deliberately stripped in commits `f124f9e` / `998c5e0`; comments added
since explain _why_ a non-obvious choice was made, never what the code does.
Components are default-exported function declarations. Store access is always
per-field selectors (`useStore((s) => s.x)`), never whole-store destructuring.

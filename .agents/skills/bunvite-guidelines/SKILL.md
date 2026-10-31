---
name: bunvite-guidelines
description: >-
  Architecture guide and rules for the BunVite dev engine in this workspace.
  Explains the self-contained Bun dev server and bundler (vite.ts), prevents installing npm vite or
  other bundlers, and covers HMR state preservation, what the dev server serves, and the build.
---

# BunVite Architecture & Guidelines

How the BunVite engine works and the rules for working with it.

---

## 1. Engine Core Principles

- **Never install `vite`, `webpack`, `rollup`, `esbuild`, or bundler plugins.**
- The root `vite.ts` script is the entire dev server, HMR engine, and production bundler.
- It uses Bun runtime APIs:
  - `Bun.serve` for HTTP and the `/ws-hmr` WebSocket.
  - `Bun.build` for TypeScript, JavaScript, JSX/TSX, plain CSS minification, and production bundling.
  - `@tailwindcss/cli` run through `Bun.spawn` for Tailwind CSS v4 (global `tailwindcss` binary → local `node_modules` → `bunx @tailwindcss/cli`).
  - `Bun.hash` for dev ETags and `Bun.gzipSync` for build sizes and preview compression.
- TSX renders real DOM nodes through `jsx-dom` (`jsxImportSource` in `tsconfig.json`). There is no virtual DOM.
- The only dev dependencies are `@types/bun` and `jsx-dom`. Other tooling (`tailwindcss`, `biome`, `tsc`) runs on demand via `bunx`.

---

## 2. Scripts and Commands

| Command | Purpose | Details |
| :--- | :--- | :--- |
| `bun run dev` | Dev server | `bun --watch run vite.ts dev` on port 5173 (tries the next 9 ports if busy). Compiles on demand, pushes updates over `/ws-hmr`. |
| `bun run build` | Production build | Cleans `dist/`, copies `public/`, writes a minified hashed JS bundle to `dist/assets/`, inlines minified CSS into `<style>`, prints a size summary. Exits with code 1 on failure. |
| `bun run preview` | Preview server | Serves `dist/` on port 4173 with gzip and `Cache-Control: immutable` for `/assets/`. Missing files return 404 (no SPA fallback). |
| `bun run test` | Tests | `bun test`: engine tests plus `Bun.WebView` browser tests of the starter app. |
| `bun run lint` | Lint | `bunx biome check .` |
| `bun run format` | Format and safe fixes | `bunx biome check --write .` |
| `bun run typecheck` | Typecheck | `bunx tsc --noEmit` |
| `bun run check` | Everything | typecheck, lint, then tests. |

---

## 3. Entry Files

- `index.html` is the only page. The app script is the first `<script src="…">` with a `.ts/.tsx/.js/.jsx/.mjs` file, falling back to `src/app.ts`.
- The stylesheet is the first `<link rel="stylesheet">`, else the first `import './x.css'` in the app script, falling back to `src/style.css`.
- CSS imported from TypeScript is added as a `<link>` in dev and stripped from the JS bundle in production (the style entry is inlined instead).

---

## 4. Dev Server

- Only `index.html`, `src/`, and `public/` are served. Everything else in the project returns 404, and requests that try to escape those folders (`..`, `%2e%2e`) are blocked.
- Scripts and CSS are compiled only from `src/`. Other files are served from `public/` first, then `src/`.
- Unknown paths requested as HTML get `index.html`, so client-side routes work in dev.

---

## 5. Hot Module Replacement

- **Scripts:** any change to a script under `src/` rebuilds the app entry and the browser re-imports it. Build errors show in the overlay instead.
- **CSS:** CSS changes recompile in memory and the browser swaps the `<link>` without reloading. When Tailwind is used, script and HTML changes also recompile CSS.
- **HTML:** changes to `index.html` trigger a full reload.
- **Error overlay:** build errors, Tailwind errors, runtime errors, and unhandled rejections open an overlay with Reload and Reset & Reload buttons. Esc closes it.

### State Preservation

A top-level `const state = { … }` object literal in the **app entry file** survives re-imports. In dev it is rewritten to `(window.__hmr_state__ ??= { … })`:

```typescript
const state = {
  todos: [] as Todo[],
  filter: 'all' as Filter,
};
```

- Only the entry file's `state` is kept. `state` objects in imported files reset on every update.
- It must be an object literal. `const state = createStore()` resets on every update.
- "Reset & Reload" in the error overlay clears the kept state.

---

## 6. Tailwind CSS v4

- Tailwind runs when the style entry contains `@import 'tailwindcss'`. Otherwise the CSS is used as-is in dev and minified with `Bun.build` for production.
- Tailwind failures throw with a cleaned-up message: they show in the dev overlay and fail the build.
- VS Code CSS validation is turned off in `.vscode/settings.json` so Tailwind at-rules don't show warnings.

---

## 7. Static Assets

- Do not use JavaScript asset imports (`import img from './logo.png'`).
- Put static assets in `public/` and reference them with root-relative paths:
  ```html
  <img src="/logo.svg" alt="Logo" />
  ```
- `public/` is served as-is in dev and copied to `dist/` by the build.

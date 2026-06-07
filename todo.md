# Dim Framework — Future Work

Backlog for making Dim a publishable, general-purpose UI framework. Items are grouped by priority. Each entry includes rationale, key files, and acceptance criteria.

> **Audit notes (2025-06):** Verified doc/code alignment for `useStore` 4-tuples, JSON-only template attributes, `useViewTransition` naming (Storybook still titles section `useTransition()`), and `useFS` encryption guard (now throws when `encrypt: true` without `encryptionPassword`, matching `MIGRATION.md`).

---

## P0 — Open-source readiness

### Add npm package exports and build artifact

- **Rationale:** README references `@dim/core` but the package has no `main`, `module`, or `exports`. Consumption today is Module Federation or direct source imports only.
- **Key files:** [`package.json`](package.json), [`webpack.config.js`](webpack.config.js), [`vite.config.ts`](vite.config.ts)
- **Acceptance criteria:**
  - Published (or publishable) build outputs ESM + optional CJS
  - `exports` map documents public entry (`./core` or `@dim/core`)
  - README import examples match real install path
  - Tree-shaking works for optional subpaths (hooks, managers)

### Ship TypeScript declarations

- **Rationale:** Core is partially TypeScript but there is no `tsconfig.json`, no `.d.ts` bundle, and Storybook disables type checking.
- **Key files:** [`src/core/dim.ts`](src/core/dim.ts), [`src/hooks/useDimStore.ts`](src/hooks/useDimStore.ts)
- **Acceptance criteria:**
  - Root `tsconfig.json` with strict-enough settings for library code
  - Generated or hand-written `.d.ts` for all public exports
  - CI runs `tsc --noEmit` on core package

### Align README with actual distribution model

- **Rationale:** README claims "Zero Dependencies", incorrect folder structure, and `@dim/core` imports that do not exist.
- **Key files:** [`README.md`](README.md)
- **Acceptance criteria:**
  - Honest dependency story (vendored Lit subset + dev deps)
  - Accurate project structure diagram
  - Getting started covers Federation, npm (when ready), and Storybook paths

### Remove unused runtime dependencies

- **Rationale:** `@mui/material`, `@emotion/styled` appear unused in `src/`; they inflate install size and contradict "lightweight" messaging.
- **Key files:** [`package.json`](package.json)
- **Acceptance criteria:** Dependencies audit; remove or document why each runtime dep is required

---

## P1 — Correctness & developer experience

### Fix standalone app entry points

- **Rationale:** `bootstrap.tsx` is fully commented out; `index.html` references non-existent `./index.jsx`.
- **Key files:** [`src/bootstrap.tsx`](src/bootstrap.tsx), [`src/index.html`](src/index.html), [`src/index.ts`](src/index.ts)
- **Acceptance criteria:** `npm run start:webpack` serves a minimal working Dim demo app, or entry files are removed with README updated

### Rename Storybook `useTransition()` to `useViewTransition`

- **Rationale:** Exported API is `useViewTransition`; Storybook title causes confusion.
- **Key files:** [`src/stories/04-ViewTransitions.stories.js`](src/stories/04-ViewTransitions.stories.js), [`src/stories/01-GettingStarted.stories.js`](src/stories/01-GettingStarted.stories.js)
- **Acceptance criteria:** Storybook sidebar and docs use `useViewTransition` consistently

### Expand Storybook API Reference

- **Rationale:** `02-APIReference.stories.js` omits `useViewTransition`, auto `transitionId`, `data-vt-shared`, and `useDimStore`.
- **Key files:** [`src/stories/02-APIReference.stories.js`](src/stories/02-APIReference.stories.js)
- **Acceptance criteria:** Interactive demos + docs for all public hooks

### Expand unit test coverage

- **Rationale:** No tests for `useFS`, `useStyle`, `useScope`, `useLazyScope`, `html` JSON attribute preprocessing; placeholder [`src/stories/Dim.test.js`](src/stories/Dim.test.js).
- **Key files:** [`src/core/dim.test.js`](src/core/dim.test.js), [`jest.config.js`](jest.config.js)
- **Acceptance criteria:** Tests for each exported hook; remove placeholder test; CI coverage threshold for `src/core/`

### Fix or remove outdated `Button.ts`

- **Rationale:** Uses pre-migration API (`count()` as function, wrong `useState` arity).
- **Key files:** [`src/stories/components/Button.ts`](src/stories/components/Button.ts)
- **Acceptance criteria:** File updated to current API or deleted from repo

### Dev-mode hook violations

- **Rationale:** Hook misuse only logs `console.error`; React dev mode throws on rules-of-hooks violations.
- **Key files:** [`src/core/dim.ts`](src/core/dim.ts)
- **Acceptance criteria:** Optional strict mode (env flag) throws when hooks called outside component render

### Persist File System Access API handles across reloads

- **Rationale:** `useFS` acknowledges FSA handles are lost on reload; users must re-select directories.
- **Key files:** [`src/hooks/useFS.js`](src/hooks/useFS.js)
- **Acceptance criteria:** Document limitation clearly, or implement IndexedDB handle persistence where supported

---

## P2 — General-purpose capabilities

### Router / navigation primitives

- **Rationale:** Shopping and messaging demos implement manual `navStack` + `transitionId` + tab state. No reusable router exists.
- **Key files:** [`src/stories/components/shopping/ShoppingAppDemo.js`](src/stories/components/shopping/ShoppingAppDemo.js), [`src/stories/components/messaging/MessagingAppDemo.js`](src/stories/components/messaging/MessagingAppDemo.js)
- **Acceptance criteria:**
  - `useRouter` or similar hook: push/pop/replace, derived `transitionId`, tab sync
  - Documented pattern replaces duplicated demo logic

### Forms and validation layer

- **Rationale:** No form library; manual `<input>` binding only. Shared CSS helpers exist but no field state/validation.
- **Key files:** [`src/core/shared-styles.js`](src/core/shared-styles.js), todo list / AddItemForm stories
- **Acceptance criteria:** `useForm` or field helpers with validation, touched/dirty state, accessible error display

### Dim DevTools inspector

- **Rationale:** No framework-specific debugging; stories mention browser IndexedDB DevTools only.
- **Acceptance criteria:** Browser extension or in-app panel showing component tree, hook state, store keys, transition state

### SSR / partial hydration evaluation

- **Rationale:** Client-only web components; vendored Lit includes SSR comments but Dim does not use `@lit-labs/ssr`.
- **Key files:** [`src/vendor/lit/`](src/vendor/lit/)
- **Acceptance criteria:** Written feasibility doc + spike proving or rejecting SSR for Dim components

### Internationalization (i18n)

- **Rationale:** Not implemented.
- **Acceptance criteria:** `useI18n` or integration guide with standard i18n libraries

### Error boundaries

- **Rationale:** Uncaught render errors can break custom elements with no recovery UI.
- **Acceptance criteria:** `define()` wrapper catches render errors and shows fallback slot/template

---

## P3 — Documentation & ecosystem

### Storybook ↔ website parity checklist

- **Rationale:** Website tutorials lagged behind Storybook (view transitions, encrypted store, etc.). Maintain a checklist when adding features.
- **Acceptance criteria:** CONTRIBUTING or docs section listing required doc updates per new hook/feature

### CLI / project scaffold

- **Rationale:** No way to bootstrap a new Dim app beyond copying Storybook demos.
- **Acceptance criteria:** `npm create dim-app` or documented template repo with Federation + hooks setup

### Module federation hardening for `useLazyScope`

- **Rationale:** `useLazyScope` uses `new Function` on remote module strings — security-sensitive and experimental.
- **Key files:** [`src/core/dim.ts`](src/core/dim.ts) (`useLazyScope`)
- **Acceptance criteria:** Safer dynamic import path, CSP guidance, or deprecation in favor of standard `import()`

### Migration guide on website

- **Rationale:** [`MIGRATION.md`](MIGRATION.md) exists in repo but was not on the blog/docs site.
- **Acceptance criteria:** Website page mirrors MIGRATION.md; linked from README and tutorial index

### List rendering with `keyed` tutorial

- **Rationale:** `keyed` directive exported but lightly documented.
- **Acceptance criteria:** Tutorial covering stable keys for animated lists and transitions

---

## Completed in documentation pass

- [x] Website tutorials 6–12 (view transitions, shared elements, encryption, props, multi-screen app, useRef, useDimStore)
- [x] Revised tutorials 1, 4, 5 for API drift
- [x] Tutorial image assets (`./images/dim.png`)
- [x] `useFS` encryption guard throws at runtime (aligned with MIGRATION.md)

<p align="center">
  <img src="public/dim.png" alt="Dim Framework Logo" width="200" />
</p>

<h1 align="center">Dim Framework</h1>

<p align="center">
  <strong>A React-inspired functional web components framework</strong>
</p>

<p align="center">
  Build modern web applications with familiar React-like syntax, powered by native Web Components
</p>

<div align="center">
  
[**Docs**](https://positive-intentions.com/docs/projects/dim/getting-started) | [**Live Demo / Storybook**](https://dim.positive-intentions.com) | [**API Overview**](https://positive-intentions.com/docs/projects/dim/api-overview) | [**CDN**](https://positive-intentions.github.io/dim/lib/)

</div>

<div align="center">
  
![GitHub stars](https://img.shields.io/github/stars/positive-intentions/dim?style=social) 
![GitHub forks](https://img.shields.io/github/forks/positive-intentions/dim?style=social) 
![GitHub issues](https://img.shields.io/github/issues/positive-intentions/dim) 
![npm](https://img.shields.io/npm/v/@positive-intentions/dim)
![License](https://img.shields.io/badge/License-GPLv3-blue.svg)
![CI](https://github.com/positive-intentions/dim/actions/workflows/ci.yml/badge.svg)
![Staging](https://github.com/positive-intentions/dim/actions/workflows/main_workflow.yaml/badge.svg) 
[![gh-pages-build-deployment](https://github.com/positive-intentions/dim/actions/workflows/pages/pages-build-deployment/badge.svg)](https://github.com/positive-intentions/dim/actions/workflows/pages/pages-build-deployment)

</div>

---

## Overview

Dim is a lightweight framework that brings React's component model and hooks to native Web Components. Write familiar functional components with hooks while leveraging the power of web standards.

> **Experimental**: This framework is in early development and is not production-ready. It's provided for educational and experimental purposes.

> **Upgrading?** See [MIGRATION.md](MIGRATION.md) for API changes (including **0.1.2 security** hardening). See [CHANGELOG.md](CHANGELOG.md) for release notes. Vulnerability reports: [SECURITY.md](SECURITY.md).

## Use from `index.html` (CDN)

Apps load Dim as a classic script. No npm install, no bundler:

```html
<!DOCTYPE html>
<html>
  <body>
    <my-counter></my-counter>
    <script src="https://positive-intentions.github.io/dim/lib/dim.global.js"></script>
    <script src="./app.js"></script>
  </body>
</html>
```

WASM: `…/dim/lib/dim.wasm.global.js`. Serve over HTTP (`python3 -m http.server`). See [Getting Started](https://positive-intentions.com/docs/projects/dim/getting-started).

## Features

- **React-like DX** - Familiar hooks API (`useState`, `useEffect`, `useMemo`, etc.)
- **Web Standards** - Built on native Web Components and Shadow DOM
- **Scoped Styling** - CSS-in-JS with automatic style isolation
- **Zero runtime deps** - Own template renderer; pure JS for the core (no React on the CDN IIFE)
- **Lightweight** - Parts-based updates preserve focus, selection, and child state
- **State Persistence** - Built-in global state management with `useStore`
- **CDN-first** - `window.Dim` from GitHub Pages; works from plain `index.html`

## Getting Started

### Quick Example

```javascript
// app.js — after dim.global.js
const { define } = Dim;

const Counter = (props, { useState, html, css, useStyle }) => {
  const [count, setCount] = useState(0);

  useStyle(css`
    .counter {
      padding: 2rem;
      text-align: center;
    }

    button {
      background: #029cfd;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
  `);

  return html`
    <div class="counter">
      <h2>Count: ${count}</h2>
      <button @click="${() => setCount(count + 1)}">Increment</button>
    </div>
  `;
};

define({ tag: "my-counter", component: Counter });
```

Hooks and `html`/`css` come from the component’s **second argument** (injected by `define`).

### React interop (npm exception)

CDN apps use `window.Dim` only. Mixed React + Dim trees are the exception — use the package subpath:

```javascript
import { useDimStore } from "@positive-intentions/dim/react";
```

`react` is an optional peer. See [useDimStore docs](https://positive-intentions.com/docs/projects/dim/use-dim-store-react).

## Core Concepts

### Hooks

Dim provides React-like hooks for managing component logic:

#### `useState` - Local State Management

```javascript
const [value, setValue] = useState(initialValue);
```

#### `useEffect` - Side Effects

```javascript
useEffect(() => {
  // Effect logic
  return () => {
    // Cleanup
  };
}, [dependencies]);
```

#### `useStyle` - Scoped CSS

```javascript
useStyle(css`
  .my-class {
    color: blue;
  }
`);
```

#### `useScope` - Component Composition

```javascript
// Hyphenated tag keys
useScope({
  "child-component": ChildComponent,
});

// Or tagged functions after define() stamped `.tag`
define({ tag: "child-component", component: ChildComponent });
useScope({ ChildComponent });
```

#### `useMemo` - Memoized Values

```javascript
const expensive = useMemo(() => {
  return computeExpensive(value);
}, [value]);
```

#### `useRef` - DOM References

```javascript
const inputRef = useRef();
// Access via inputRef.current
```

#### `useStore` - Global State

```javascript
const {
  user: [user, setUser, isLoading, , isSaving],
} = useStore(
  { user: useState({ name: "John" }) },
  { encryptionKey: "optional-secret" },
);
// isSaving is true while a debounced IndexedDB persist is in flight
```

## Examples

### Todo List

```javascript
const TodoList = (props, { useState, html, css, useStyle }) => {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState("");

  const addTodo = () => {
    if (input.trim()) {
      setTodos([
        ...todos,
        {
          id: Date.now(),
          text: input,
          done: false,
        },
      ]);
      setInput("");
    }
  };

  return html`
    <div>
      <input
        .value="${input}"
        @input="${(e) => setInput(e.target.value)}"
        @keydown="${(e) => e.key === "Enter" && addTodo()}"
      />
      <button @click="${addTodo}">Add</button>

      <ul>
        ${todos.map(
          (todo) => html`
            <li class="${todo.done ? "done" : ""}">
              <input
                type="checkbox"
                .checked="${todo.done}"
                @change="${() => toggleTodo(todo.id)}"
              />
              ${todo.text}
            </li>
          `
        )}
      </ul>
    </div>
  `;
};
```

### Larger examples

- **[dimui](https://github.com/positive-intentions/dimui)** — a Material-inspired
  component library and custom Storybook-like explorer built on Dim (atoms,
  molecules, demos, no bundler). Live:
  https://positive-intentions.github.io/dimui/
- **[dim-boilerplate](https://github.com/positive-intentions/dim-boilerplate)** —
  a larger-scale encrypted notes app (vault, folders, list/editor) that loads
  Dim from the Pages CDN and pulls dimui atoms remotely — classic scripts, no
  app-side transpile or bundler, with optional PWA offline support. Live:
  https://positive-intentions.github.io/dim-boilerplate/

## Rust/WASM Runtime

Dim ships a second, drop-in runtime whose renderer core (template
preparation, commit/diff, focus preservation), hook bookkeeping, update
scheduling, style flushing and prop parsing are written in Rust
(`rust/dim-core`, plain `wasm-bindgen` + `web-sys`) and compiled to
WebAssembly. The public API on `window.Dim` is identical; only the script URL
changes. Stores, crypto, storage, view transitions and `useFS` are shared with
the JS runtime.

| CDN file | Runtime |
| -------- | ------- |
| `https://positive-intentions.github.io/dim/lib/dim.global.js` | Pure JS (default) |
| `https://positive-intentions.github.io/dim/lib/dim.wasm.global.js` | Rust core, WASM inlined |

### Switching runtimes

Load the matching CDN script (or use `?impl=js|wasm` in dimui / dim-boilerplate):

```html
<!-- JS -->
<script src="https://positive-intentions.github.io/dim/lib/dim.global.js"></script>

<!-- WASM -->
<script src="https://positive-intentions.github.io/dim/lib/dim.wasm.global.js"></script>
<script>
  const { define, html } = Dim;
</script>
```

Serve over HTTP. See [dimui](https://github.com/positive-intentions/dimui) and
[dim-boilerplate](https://github.com/positive-intentions/dim-boilerplate) for
end-to-end CDN + `BP.module` apps. Local harness iteration:
`?dimLib=http://127.0.0.1:8765/lib/` while serving `Frontend/`.

### Building and testing

Requires Rust (toolchain pinned in `rust/rust-toolchain.toml`, with the
`wasm32-unknown-unknown` target) and [`wasm-pack`](https://rustwasm.github.io/wasm-pack/) 0.13.

```bash
npm run build:wasm   # wasm-pack + tsup → dist/wasm/** (also run by build:lib)
npm run test:wasm    # the runtime parity Jest suites against the WASM runtime
npm run test:rust    # cargo unit tests for template preparation
npm run test:all     # JS + Rust + WASM
```

### Testing uncompiled apps

Framework unit tests stay on Jest (`npm test`). Apps that load Dim as a classic
IIFE (no app transpile, no bundler) can use a separate browser harness:

```html
<script src="https://positive-intentions.github.io/dim/lib/dim.global.js"></script>
<!-- or dim.wasm.global.js with ?impl=wasm -->
<script src="https://positive-intentions.github.io/dim/lib/dim.test.global.js"></script>
<script>
  DimTest.test("counter mounts", async () => {
    const el = await DimTest.mount("my-counter");
    DimTest.expect(DimTest.shadowText(el)).toContain("0");
  });
  DimTest.run(); // paints a report; sets window.__DIM_TEST__
</script>
```

`window.DimTest` provides `test`, `e2e`, `expect`, `mount`, `shadowText`,
`open` (iframe AUT), `run`, `rerun`, and `splash`. It also paints the runner
chrome (splash + JS/WASM / Rerun toolbar + E2E preview). It does not change
`window.Dim`. Source:
[`examples/app-test/dim-test.global.js`](examples/app-test/dim-test.global.js).
Optional line instrumenter:
[`examples/app-test/cover-instrument.js`](examples/app-test/cover-instrument.js)
(+ embedded [`parse.js`](examples/app-test/parse.js) / `DimParse`) → CDN
`dim.cover.global.js`. `npm run build:pages-lib` publishes the harness,
parser, and cover bundle into `Frontend/lib/` for GitHub Pages.

Try the demo (serve the repo over HTTP, then open
`/examples/app-test/?impl=js` or `?impl=wasm`). A full notes-app suite lives in
[dim-boilerplate](https://github.com/positive-intentions/dim-boilerplate)
(`runTests.html`).

### Caveats

- **Size.** `dim_core_bg.wasm` is ~150 KB (~65 KB gzipped). The inline and
  global builds embed it as base64 (+33%), so they are ~310 KB vs ~105 KB for
  the JS build; the split build is ~110 KB of JS plus the `.wasm` file.
- **Startup.** The inline builds compile synchronously with `initSync` (fine
  well below Chrome's 8 MB sync-compile limit). The split build uses
  top-level `await`, so it needs an HTTP(S) server and a bundler/browser that
  supports TLA.
- **CSP.** Instantiating WebAssembly needs `script-src 'wasm-unsafe-eval'`
  under a strict Content Security Policy.
- **Performance.** Every DOM operation still crosses the JS↔WASM boundary,
  so the WASM runtime is not faster than the JS one. dimui's keyed-list
  benchmark (`?id=benchmarks-keyed-list-default`, median of 5, Chrome):

  | Operation             | JS (ms) | WASM (ms) |
  | --------------------- | ------- | --------- |
  | create 1,000 rows     | 15.9    | 25.4      |
  | update every 10th row | 1.7     | 2.9       |
  | select row            | 0.5     | 2.7       |
  | swap rows             | 0.6     | 2.6       |
  | remove first row      | 12.9    | 25.4      |
  | append 1,000 rows     | 13.2    | 28.9      |
  | clear                 | 3.1     | 2.1       |
  | **total**             | 47.9    | 90.0      |

- **Behavioural differences.** The WASM committer skips parts whose value is
  the identical primitive (or the same listener) as last commit, as lit does;
  `.prop` bindings are always re-assigned. External DOM edits to a bound text
  node or attribute are therefore not reverted until the value changes.

### Testing uncompiled apps

Framework unit tests use Jest against `src/` (see `npm test` / `npm run test:wasm`).
**Application** code that stays uncompiled (classic scripts + `window.Dim`)
should be tested the same way it runs: in a real browser page, with no Babel
or bundler.

Dim ships a tiny classic-script harness:

| File | Role |
| ---- | ---- |
| [`examples/app-test/dim-test.global.js`](examples/app-test/dim-test.global.js) | Source — exposes `window.DimTest` |
| [`examples/app-test/parse.js`](examples/app-test/parse.js) | First-party JS subset parser (`window.DimParse`) |
| [`examples/app-test/cover-instrument.js`](examples/app-test/cover-instrument.js) | Optional line instrumenter (`DimTest.instrument`) |
| `https://positive-intentions.github.io/dim/lib/dim.test.global.js` | CDN harness (via `build:pages-lib`) |
| `https://positive-intentions.github.io/dim/lib/dim.parse.global.js` | CDN parser (via `build:pages-lib`) |
| `https://positive-intentions.github.io/dim/lib/dim.cover.global.js` | CDN instrumenter + embedded DimParse |
| [`examples/app-test/index.html`](examples/app-test/index.html) | One-component demo (`?impl=js\|wasm`) |

```html
<script src="https://positive-intentions.github.io/dim/lib/dim.global.js"></script>
<!-- WASM: .../dim.wasm.global.js  (?impl=wasm) -->
<script src="https://positive-intentions.github.io/dim/lib/dim.test.global.js"></script>
<!-- Optional live coverage: DimParse is embedded in dim.cover.global.js -->
<script src="https://positive-intentions.github.io/dim/lib/dim.cover.global.js"></script>
<script>
  DimTest.test("counter mounts", async () => {
    const el = await DimTest.mount("my-counter");
    DimTest.expect(DimTest.shadowText(el)).toContain("0");
  });
  DimTest.run(); // paints a report; sets window.__DIM_TEST__
</script>
```

`DimTest` API: `test`, `e2e`, `expect` (`toBe`, `toEqual`, `toBeTruthy`,
`toContain`, `toBeGreaterThan`), `mount(tag, props?)`, `shadowText(el)`,
`open(url)`, `run()`, `rerun()`, `splash(message)`, plus optional
`cover.register` / `cover.hit` / `cover.summary` and `instrument` (from
`dim.cover.global.js`) for in-page line coverage. Coverage uses first-party
**DimParse** (no Acorn / jsDelivr). The harness owns the **toolbar** (JS/WASM
reload toggle, Rerun, impl label), an animated **splash** during boot, and the
**E2E** preview section — load `dim.test.global.js` before Dim so the splash
appears immediately. Apps list which files to fetch and instrument; production
sources on disk stay untouched.

**Iframe AUT (browser automation, still no transpile):** `DimTest.e2e(name, fn)`
(or any `*.e2e.test.js` / `…/e2e/…` path) runs **after** unit tests. The report
layout is **Results → Coverage (unit) → E2E** (pass progress, e2e test tree,
**E2E line coverage**, live preview). `DimTest.open(url)` loads a real
same-origin HTML page into an iframe (default: fetch + `srcdoc` with
`<base href>`, IndexedDB name suffix, session-prefixed `localStorage`, and a
no-op `serviceWorker.register`). During e2e, `open` defaults to a visible
preview and `{ cover: true }`: same-origin `notes/**` `<script src>` tags are
rewritten to in-memory instrumented sources; hits go to cover bucket `"e2e"`
(unit bucket stays separate). Opt out with `{ cover: false }`. `{ mode: "src" }`
navigates the iframe directly and skips cover rewrite. Returns a page object
with shadow-piercing `query` / `queryAll` / `click` / `fill` / `text` / `wait` /
`close`. Demo: [`examples/app-test/counter.html`](examples/app-test/counter.html)
driven from [`examples/app-test/index.html`](examples/app-test/index.html).

```js
DimTest.e2e("iframe counter", async () => {
  const page = await DimTest.open("./counter.html", { ready: "dim-test-counter" });
  await page.click("dim-test-counter");
  await page.wait(() => page.text("dim-test-counter").includes("Count: 1"));
});
```

Full notes-app example (BP modules, colocated specs, `runTests.html`, live
coverage UI, iframe e2e against `index.html`, CI with Playwright):
[dim-boilerplate](https://github.com/positive-intentions/dim-boilerplate).
Framework Jest suites stay separate; do not load `BP.module` apps through Jest.

Long-form guides: [Unit tests](https://positive-intentions.com/docs/projects/dim/unit-tests),
[E2E tests](https://positive-intentions.com/docs/projects/dim/e2e-tests),
[Coverage](https://positive-intentions.com/docs/projects/dim/coverage).

## Documentation

Written docs (Getting Started, API, classic scripts, testing, ecosystem):

- [Getting Started](https://positive-intentions.com/docs/projects/dim/getting-started)
- [API overview](https://positive-intentions.com/docs/projects/dim/api-overview)
- [Unit tests](https://positive-intentions.com/docs/projects/dim/unit-tests) · [E2E tests](https://positive-intentions.com/docs/projects/dim/e2e-tests) · [Coverage](https://positive-intentions.com/docs/projects/dim/coverage)
- [dimui](https://positive-intentions.com/docs/projects/dim/dimui) · [dim-boilerplate](https://positive-intentions.com/docs/projects/dim/dim-boilerplate)

Interactive demos and Storybook: [dim.positive-intentions.com](https://dim.positive-intentions.com).

## Development

For **contributors** working on the Dim repo (not required for CDN apps):

### Setup

```bash
# Clone the repository
git clone https://github.com/positive-intentions/dim.git

# Install dependencies (framework development only)
npm install

# Start Storybook dev server
npm run storybook

# Build the publishable library
npm run build:lib

# Build Storybook / federation docs site
npm run build
```

## Security and verification

From 0.1.2, Dim ships a hardened template policy and a Lean 4 spec of the pure (DOM-free) core (still experimental).

| Component | Proven (Lean) | Conformance-tested | Untested / host |
| --------- | ------------- | ------------------ | --------------- |
| Binding policy / `sanitizeUrl` / `escapeText` | Laws + proofs | JS + Rust vs Lean oracle | — |
| `prepare` (pure) | Structural contracts | Unit + differential | DOM instantiation |
| Aeneas refinement of Rust | Hand model (`Dim/Refinement`); full Aeneas optional | Differential | `VERIFY_AENEAS=1` |
| Commit / events / CryptoManager | — | Unit tests | Browser / WebCrypto |

Local gate (Lean proofs, oracle, Rust + JS differential tests):

```bash
# Needs elan/lake (https://lean-lang.org/lean4/doc/setup.html)
npm run verify
```

CI: [`.github/workflows/verify.yml`](.github/workflows/verify.yml) on every push/PR. Details: [security/analysis.md](security/analysis.md), [verification/lean/](verification/lean/).

### Project Structure

```
dim/
├── src/
│   ├── core/
│   │   ├── index.ts        # Public API (published as @positive-intentions/dim)
│   │   ├── dim.ts          # Compatibility shim (re-exports index)
│   │   ├── renderer/       # html/css tagged templates, parts, render()
│   │   │   └── pure/       # DOM-free prepare + security policy
│   │   ├── element/        # DimElement, define(), props helpers
│   │   ├── hooks/          # useState, useEffect, useMemo, useRef, useStyle, useScope
│   │   ├── store/          # useStore, crypto/storage/async managers
│   │   ├── transitions/    # view transitions + AutoTransitionHost
│   │   └── fs/             # useFS + File System Access handle persistence
│   ├── wasm/               # Rust/WASM runtime facade (same API as core/index.ts)
│   └── stories/            # Storybook docs and demo apps
├── rust/
│   ├── dim-spec-core/      # DOM-free pure core (policy + prepare)
│   └── dim-core/           # WASM runtime (depends on dim-spec-core)
├── verification/lean/      # Lean 4 laws, proofs, dim-oracle
├── security/               # Threat model and findings
├── scripts/                # verify.sh, build-wasm.mjs, …
├── examples/
│   ├── todo-wasm/          # file:// demo using dist/wasm/dim.global.js
│   └── app-test/           # DimTest harness + DimParse + cover + demo
├── public/
└── README.md
```

## Releasing

Releases are manual and Changeset-driven.

1. In a PR that changes the public API or user-facing behavior, run `npx changeset`, choose **patch** / **minor** / **major**, and write a short summary.
2. Merge the PR (with its changeset file) into `staging`.
3. On GitHub: **Actions → Publish → Run workflow** (optionally enable **dry_run** first).
4. The workflow versions the package, updates `CHANGELOG.md`, publishes `@positive-intentions/dim` to npm with provenance, pushes a `vX.Y.Z` tag, and creates a GitHub Release.

**Prerequisites (one-time):** create the `@positive-intentions` org on npm, enable [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) for this repo’s `publish.yml` workflow, and create a GitHub Environment named `npm` (optional protection rules / required reviewers).

## License

This project is licensed under the GNU General Public License v3.0 (GPL-3.0) — see the [LICENSE](LICENSE) file for details. You are free to use, modify, and distribute this software; **distributed derivative works must also be licensed under GPL-3.0**.

## Acknowledgments

- Inspired by React's component model and hooks
- Built on native Web Components with Dim's own template renderer
- Community feedback

---

<p align="center">
  Dim is brought to you by <a href="https://positive-intentions.com">positive-intentions</a>. Built with positivity.
</p>

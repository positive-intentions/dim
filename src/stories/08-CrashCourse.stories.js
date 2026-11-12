import React from "react";
import "./crash-course/index.js";
import { CrashCourseReactInterop } from "./crash-course/11-react-interop.js";

export default {
  title: "Crash Course",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Dim crash course

Dim is a **functional web-components** framework: React-like hooks, an owned
template renderer (\`html\` / \`css\`), Shadow DOM, and **no virtual DOM**.
You write a function, \`define()\` turns it into a custom element, and the
renderer patches only the parts of the template that changed.

## What you will build

**Dim Notes** grows lesson by lesson:

1. A static note card
3. An editable title and body
4. A list of composed components
5. Search, a ticker, and cleanup
7. Themed, scoped styles
8. Persisted (and optionally encrypted) store
9. Animated list ↔ detail
10. Export / import as files
11. The same data inside a React page

Each lesson is self-contained. Read the concept, copy the snippet, then
use the live example under the docs.

## How a render works

\`define()\` registers a custom element. On connect, Dim opens a shadow
root and calls your function. You return \`html\`…\`; the renderer
prepares parts (text, attributes, properties, events, booleans) and
commits only what changed. Hooks live in numbered slots on the host —
same order every render, like React.

## Prerequisites

Modern JavaScript and tagged template literals. No build step is required
to *use* Dim; this Storybook uses webpack so TypeScript sources resolve.

Import from the public API:

\`\`\`javascript
import { define, html, css, useState } from "../core/index.ts";
// src/core/dim.ts re-exports the same surface.
\`\`\`
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export const FirstComponent = {
  render: () => React.createElement("cc-lesson-01"),
  name: "1. Your first component",
  parameters: {
    docs: {
      description: {
        story: `
\`define({ tag, component })\` registers a custom element and **returns
the function** with \`.tag\` stamped on it. That stamp is what
\`useScope({ NoteCard })\` uses later.

The component signature is \`(props, deps) => html\`…\`. Injected
\`deps.html\`, \`deps.useState\`, and so on are the **same functions** as
the named exports.

\`\`\`javascript
import { define, html } from "../../core/index.ts";

export const NoteCard = define({
  tag: "cc-note-card",
  component: ({ title = "Untitled", body = "" }) => html\`
    <article>
      <h3>\${title}</h3>
      <p>\${body}</p>
    </article>
  \`,
});
\`\`\`

Use it from HTML (\`<cc-note-card title="Hi">\`), from React
(\`React.createElement("cc-note-card")\`), or from another Dim component
after \`useScope({ NoteCard })\`.
        `,
      },
    },
  },
};

export const TemplatesAndBindings = {
  render: () => React.createElement("cc-lesson-02"),
  name: "2. Templates and bindings",
  parameters: {
    docs: {
      description: {
        story: `
Templates are tagged literals. Interpolate **text** with \`\${value}\`
and **attributes** with multi-part values
(\`class="note \${active ? 'active' : ''}"\`).

Binding prefixes:

| Prefix | Meaning |
| --- | --- |
| \`.value=\` | set a DOM **property** |
| \`@click=\` | add an **event** listener |
| \`?disabled=\` | toggle a **boolean** attribute |

Lists are \`.map()\`. Wrap rows in \`keyed(id, html\`…\`)\` so identity
stays stable when the array reorders.

\`unsafeHTML\` interpolates a string as markup. **Trusted content only**
— never pass user input.

\`\`\`javascript
html\`
  <button @click=\${() => setPinned(!pinned)} ?disabled=\${busy}>
    \${pinned ? "Unpin" : "Pin"}
  </button>
  <input .value=\${title} @input=\${(e) => setTitle(e.target.value)} />
  \${notes.map((n) => keyed(n.id, html\`<li>\${n.title}</li>\`))}
\`
\`\`\`
        `,
      },
    },
  },
};

export const State = {
  render: () => React.createElement("cc-lesson-03"),
  name: "3. State with useState",
  parameters: {
    docs: {
      description: {
        story: `
\`useState(initial)\` returns \`[value, setValue]\`. Updates are batched
into a **microtask**. If the next value is \`Object.is\`-equal to the
current one, Dim **skips** the re-render.

Use functional updates when the next value depends on the previous one:
\`setCount((n) => n + 1)\`.

State is immutable: copy arrays and objects (\`[...notes]\`,
\`{ ...note, title }\`) instead of mutating.

Controlled inputs:

\`\`\`javascript
const [title, setTitle] = useState("Untitled");

html\`
  <input
    .value=\${title}
    @input=\${(e) => setTitle(e.target.value)}
  />
\`
\`\`\`

The renderer restores **focus and caret** after each commit, so typing
in a bound input feels native.
        `,
      },
    },
  },
};

export const Composition = {
  render: () => React.createElement("cc-lesson-04"),
  name: "4. Props and composition",
  parameters: {
    docs: {
      description: {
        story: `
Register children with \`useScope\`:

\`\`\`javascript
useScope({ NoteCard });                 // uses NoteCard.tag from define()
useScope({ "cc-note-card": NoteCard }); // explicit tag
\`\`\`

HTML lowercases attribute names. Dim's props proxy is
**case-insensitive**, so \`transitionId\` still reads from
\`transitionid\`. Values that look like JSON
(\`tags='["a","b"]'\`) are parsed automatically.

**Objects and functions cannot go through attributes** (they stringify).
Pass them with \`.props\`:

\`\`\`javascript
html\`
  <cc-note-list
    .props=\${{ notes, selectedId, onSelect: setSelectedId }}
  ></cc-note-list>
\`
\`\`\`

Parent markup is available as \`props.children\` /
\`props.childElements\`. Render it with \`renderChildren(children)\`
(usually a \`<slot>\`).

Data can also flow **up** via \`dispatchEvent(new CustomEvent("note-select", { detail: id, bubbles: true }))\`.
        `,
      },
    },
  },
};

export const EffectsAndMemo = {
  render: () => React.createElement("cc-lesson-05"),
  name: "5. Effects, lifecycle, memoisation",
  parameters: {
    docs: {
      description: {
        story: `
\`useEffect(fn, deps)\` runs after render when \`deps\` change.

- \`[]\` — once on mount
- \`[savedAt]\` — when that value changes
- Dim **requires** a deps array (passing nothing throws)

Return a cleanup function. It runs before the next effect **and** when
the element **disconnects** — use it for \`setInterval\`, subscriptions,
and listeners.

\`useMemo(fn, deps)\` caches derived data (filtered lists, word counts).

\`\`\`javascript
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);
}, [savedAt]);

const filtered = useMemo(() => {
  const q = query.trim().toLowerCase();
  return notes.filter((n) => n.title.toLowerCase().includes(q));
}, [notes, query]);
\`\`\`

Unmount the ticker in the live example to prove the interval is cleared.
        `,
      },
    },
  },
};

export const Refs = {
  render: () => React.createElement("cc-lesson-06"),
  name: "6. Refs and the DOM",
  parameters: {
    docs: {
      description: {
        story: `
\`useRef(initial)\` returns a stable \`{ current }\` box. Updating
\`current\` does **not** re-render (the live example keeps a render
counter this way).

**Dim-specific:** \`useRef()\` with no argument defaults \`current\` to
the **host element**, not \`null\`. Pass an explicit initial value when
you want React-like behaviour.

\`querySelector\` is bound to this component's **shadow root**.
\`getRef(selector)\` looks up another Dim child's default ref.

\`\`\`javascript
const titleRef = useRef(null);
const host = useRef(); // host custom element

const addAndFocus = () => {
  setNotes([createNote({ title }), ...notes]);
  queueMicrotask(() => querySelector("#title")?.focus());
};
\`\`\`
        `,
      },
    },
  },
};

export const Styling = {
  render: () => React.createElement("cc-lesson-07"),
  name: "7. Styling with useStyle",
  parameters: {
    docs: {
      description: {
        story: `
\`useStyle(css\`…\`)\` (or a string) injects CSS into the shadow root.
Selectors are naturally scoped. \`:host\` and \`:host([pinned])\` style
the custom element itself.

Where the browser supports it, Dim uses \`adoptedStyleSheets\`; otherwise
it appends a \`<style data-style-hook>\` tag. Dynamic values must go
through \`unsafeCSS\`:

\`\`\`javascript
useStyle(css\`
  :host {
    --cc-bg: \${unsafeCSS(dark ? "#0b1220" : "#ffffff")};
  }
  :host([pinned]) .card {
    border-left: 4px solid var(--cc-accent);
  }
\`);
\`\`\`

Theme by setting CSS variables on \`:host\` and reading them in children.
        `,
      },
    },
  },
};

export const Store = {
  render: () => React.createElement("cc-lesson-08"),
  name: "8. Global and persistent state",
  parameters: {
    docs: {
      description: {
        story: `
\`useStore\` is **bottom-up**: each component declares the slice it
needs. Same-named keys sync across components and survive reloads via
IndexedDB.

Each entry becomes \`[value, setValue, isLoading, setIsLoading]\`. Nested
objects are allowed.

\`\`\`javascript
const store = useStore({
  ccNotes: useState([]),
  ccTheme: useState("light"),
});
const [notes, setNotes, notesLoading] = store.ccNotes;
\`\`\`

Encryption is **opt-in** and there is **no default password**:

\`\`\`javascript
useStore(schema, { encryptionKey: userKey });
\`\`\`

Lose the key, lose the data. Never hardcode a production key.

The live example has two independent components sharing \`ccNotes\`, plus
an encrypted \`ccNotesEnc\` slice. Reload the story — plaintext notes
remain.
        `,
      },
    },
  },
};

export const ViewTransitions = {
  render: () => React.createElement("cc-lesson-09"),
  name: "9. View transitions",
  parameters: {
    docs: {
      description: {
        story: `
**Automatic:** put \`transitionId="\${viewId}"\` (and optionally
\`transitionDuration\`) on a child. Dim wraps the render in a two-layer
slide. Numeric ids pick direction (higher → right).

**Shared elements:** mark matching nodes with
\`data-vt-shared="note-title-\${id}"\`. Dim FLIPs them from the old box
to the new one.

**Manual:** \`useViewTransition(id, { duration, autoDirection })\`
returns \`isTransitioning\`, \`direction\`, \`getIncomingClass\`,
\`getOutgoingClass\`, plus \`viewTransitionStyles\`.

\`\`\`javascript
html\`
  <cc-notes-pane
    transitionId="\${viewId}"
    transitionDuration="450"
    .props=\${{ view, note, onOpen, onBack }}
  ></cc-notes-pane>
\`
\`\`\`

Click a note in the live example, then Back — the title is the shared
element.
        `,
      },
    },
  },
};

export const Files = {
  render: () => React.createElement("cc-lesson-10"),
  name: "10. Files with useFS",
  parameters: {
    docs: {
      description: {
        story: `
\`useFS()\` talks to the **File System Access** API, with **OPFS** as
the fallback. \`useFS({ opfs: true })\` is deterministic in Storybook
(no folder picker).

Useful fields and methods: \`isReady\`, \`fsMode\`,
\`selectDirectory\` / \`pickLocalDirectory\`, \`writeFile\`,
\`readFile\`, \`listDirectory\`, \`removeFile\`, \`uploadFile\`.

\`\`\`javascript
const fs = useFS({ opfs: true });
await fs.writeFile(\`\${id}.md\`, markdown, "notes");
const entries = await fs.listDirectory("notes");
const text = await fs.readFile(entries[0].name, "notes");
\`\`\`

Optional \`{ encrypt: true, encryptionPassword }\` encrypts file
contents. There is no default password.

**Caveats:** FSA needs a user gesture and a supporting browser
(Chromium). OPFS is origin-private — not a folder the user can see in
Finder / Explorer. jsdom has no OPFS, so tests skip this lesson.
        `,
      },
    },
  },
};

export const ReactInterop = {
  render: () => React.createElement(CrashCourseReactInterop),
  name: "11. React interop",
  parameters: {
    docs: {
      description: {
        story: `
Dim elements are just custom elements, so React can mount them:

\`\`\`javascript
React.createElement("cc-notes-app")
\`\`\`

React attributes are **strings**. To pass objects or functions, assign
\`.props\` through a ref:

\`\`\`javascript
const ref = useRef(null);
useEffect(() => {
  if (ref.current) ref.current.props = { note, onSelect };
}, [note]);
return React.createElement("cc-note-card", { ref });
\`\`\`

\`useDimStore({ key, password, defaultValue })\` is a **React** hook
into Dim's encrypted IndexedDB. A password is **required**.

It dispatches the same encrypted \`CustomEvent\` as Dim's
\`useStore(..., { encryptionKey })\` when the key and password match.
The live example pairs a React textarea with a Dim component on
\`ccReactNote\` / \`cc-crash-course\`. Edits should appear on both sides
after the 200ms event debounce.

If they drift, check that both sides use the **same key and password**,
and that values are strings (useDimStore is string-typed).
        `,
      },
    },
  },
};

export const UnderTheHood = {
  render: () => React.createElement("cc-lesson-12"),
  name: "12. Under the hood",
  parameters: {
    docs: {
      description: {
        story: `
## Element lifecycle

1. \`connectedCallback\` creates the open shadow root and
   \`requestUpdate()\`
2. \`requestUpdate\` coalesces into a **microtask**
3. \`render()\` resets \`hookIndex\`, sets the current instance, parses
   attributes, injects deps, calls your function
4. The renderer **commits** the result (\`preserveFocus: true\`)
5. \`useStyle\` queues flush (\`adoptedStyleSheets\` or \`<style>\`)
6. \`updated()\` runs (view-transition host hooks in here)

A \`MutationObserver\` on the host re-renders when **attributes**
change, so \`transitionId="\${id}"\` stays reactive.

## Hook slots

Hooks are stored as \`host.hooks["hook-N"]\` (and similar names for
style / view-transition). \`hookIndex\` increments on every hook call
and resets at the start of \`render()\`. That is why conditional hooks
break — the slots shift.

## Renderer

- **prepare** — template strings → parts: child, attr, prop (\`.\`),
  event (\`@\`), bool (\`?\`)
- **commit** — patch only changed parts
- **focus** — restore active element and caret unless a transition
  asked to skip

View transitions are wrapped by \`AutoTransitionHost\`
(\`src/core/transitions\`). Persistence lives in
\`src/core/store\`, files in \`src/core/fs\`.

Click Increment in the inspector to watch \`hookIndex\` and slot names.
        `,
      },
    },
  },
};

export const Pitfalls = {
  render: () => React.createElement("cc-lesson-13"),
  name: "13. Pitfalls and rules of hooks",
  parameters: {
    docs: {
      description: {
        story: `
### Conditional hooks

Wrong: \`if (flag) useState(0)\` — slots shift on the next render.

Right: call every hook unconditionally; branch **inside**.

### Mutating state

Wrong: \`notes.push(item); setNotes(notes)\` — same reference,
\`Object.is\` bails out, UI stays stale.

Right: \`setNotes([...notes, item])\`.

The live example: **Push (mutate)** does nothing until **Force
re-render** (the array was mutated in place). **Push (copy)** updates
immediately.

### Objects through attributes

Wrong: \`onSelect="\${fn}"\` stringifies the function.

Right: \`.props=\${{ onSelect }}\` or \`.onSelect=\${fn}\`.

### camelCase attributes

The DOM lowercases them. Read via the props proxy, or set properties
(\`.transitionId=\`).

### Double \`define\`

\`customElements.define\` is skipped if the tag exists. The first
component wins.

### Effects without cleanup

Timers leak. Always return \`() => clearInterval(id)\`. Dim also
requires a **deps array**.

### \`useLazyScope\`

Evaluates a string with \`new Function\`. Experimental, **unsafe** for
untrusted input.

### Encryption keys

No default password. Hardcoded or lost keys mean unreadable data.

### Controlled inputs

Bind \`.value=\${state}\`. A plain \`value=\${state}\` attribute will
fight the DOM.

### \`useRef()\`

No argument → \`current\` is the **host**, not \`null\`.
        `,
      },
    },
  },
};

export const FinalApp = {
  render: () => React.createElement("cc-lesson-14"),
  name: "14. Dim Notes (put it together)",
  parameters: {
    docs: {
      description: {
        story: `
The complete notes app: list + editor, search (\`useMemo\`), light/dark
(\`useStyle\` + CSS variables), persisted \`ccNotes\` / \`ccTheme\`,
list ↔ detail transitions with a shared title, and OPFS export.

## Recap

- \`define\` + \`html\` — a custom element
- Bindings — \`.\` \`@\` \`?\`, \`keyed\`, never \`unsafeHTML\` for users
- \`useState\` — immutable updates, controlled \`.value\` + \`@input\`
- \`useScope\` + \`.props\` — composition
- \`useEffect\` / \`useMemo\` — cleanup and derived data
- \`useRef\` / \`querySelector\` — host vs DOM nodes
- \`useStyle(css\`…\`)\` — shadow CSS, \`unsafeCSS\` for dynamics
- \`useStore\` — shared + persisted; encryption opt-in
- \`transitionId\` + \`data-vt-shared\` — motion
- \`useFS({ opfs: true })\` — files
- React — \`element.props\` via ref, \`useDimStore\` for encrypted keys

## Next

- **API Reference** — every hook, live
- **useStyle()** / **useTransition()** / **useFS()** — deeper galleries
- **Demo/Messaging App** and **Demo/Shopping App** — full apps
        `,
      },
    },
  },
};

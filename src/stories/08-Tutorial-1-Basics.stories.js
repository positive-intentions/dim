import React from "react";
import "./tutorial/index.js";

export default {
  title: "Tutorial/1. Basics",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Track 1 — Basics

Start with a **vanilla** custom element, then the same idea in Dim. By the end
you can register a component, bind events, hold state, pass props, and style
inside the Shadow DOM.

**Prerequisites:** HTML tags, JavaScript functions. No React.

Open each story’s **Docs** tab, then try the live canvas.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export const WebComponents = {
  render: () => React.createElement("tut-web-components"),
  name: "1. What is a web component?",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** See a custom element with no framework, then the same card in Dim.

**New words:**
- **Custom element** — a tag you teach the browser (\`tut-hello-vanilla\`). The name must contain a hyphen.
- **Shadow DOM** — a private tree on the host so this card’s CSS stays inside.
- **Attribute** — a string on the tag, e.g. \`name="Ada"\`.

**Why it matters:** Dim Notes is a pile of custom elements. If you can inspect a shadow root, the rest of the tutorial will make sense.

**Try this:**
1. Click **Greet** — both cards change name.
2. In DevTools, inspect \`<tut-hello-vanilla>\` — you should see a \`#shadow-root\`.
3. Compare it with \`<tut-hello-dim>\` — same idea, less class boilerplate.

**Snippet:**

\`\`\`javascript
class TutHelloVanilla extends HTMLElement {
  static get observedAttributes() { return ["name"]; }
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._render();
  }
  attributeChangedCallback() { this._render(); }
  _render() {
    const name = this.getAttribute("name") || "world";
    this.shadowRoot.innerHTML = \`<p>Hello, \${name}.</p>\`;
  }
}
customElements.define("tut-hello-vanilla", TutHelloVanilla);

// Same card in Dim:
define({
  tag: "tut-hello-dim",
  component: ({ name = "world" }) => html\`<p>Hello, \${name}.</p>\`,
});
\`\`\`

**Common mistake:** A tag without a hyphen (\`hello\`) is invalid — the browser will not register it. Always use \`tut-hello\`.

**Next:** Lesson 2 — \`define()\` as your first Dim component.
        `,
      },
    },
  },
};

export const FirstComponent = {
  render: () => React.createElement("tut-first-component"),
  name: "2. Your first component",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Register a custom element with \`define()\` and render \`html\`.

**New words:**
- **\`define()\`** — registers the tag and returns the function with \`.tag\` stamped on it.
- **Host** — the custom-element instance (the outer node).
- **Shadow root** — where Dim puts the template.

**Why it matters:** Every Dim Notes card starts here: one function, one tag, one template.

**Try this:**
1. Look at the note card — it is a real custom element, not a React tree.
2. Read the stamped tag name under the card (\`tut-first-component-card\`).

**Snippet:**

\`\`\`javascript
import { define, html } from "../../core/index.ts";

export const NoteCard = define({
  tag: "tut-note-card", // hyphen required
  component: ({ title = "Untitled", body = "" }) => html\`
    <article>
      <h3>\${title}</h3>
      <p>\${body}</p>
    </article>
  \`,
});
\`\`\`

Injected deps (\`deps.html\`, \`deps.useState\`, …) are the **same functions** as the named exports. \`define\` returns the function with \`.tag\` on it.

**Common mistake:** Forgetting the hyphen in the tag name. The browser will throw.

**Next:** Lesson 3 — bind clicks, properties, and lists.
        `,
      },
    },
  },
};

export const TemplatesAndBindings = {
  render: () => React.createElement("tut-templates-bindings"),
  name: "3. Templates and bindings",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Bind text, properties, events, and booleans; keep list identity with \`keyed\`.

**New words:**
- **Event** — a click (or input). Bind with \`@click=\`.
- **Property** — a JS value on the node. Bind with \`.value=\`.
- **Boolean attribute** — present or absent. Bind with \`?disabled=\`.

**Why it matters:** Pinning a note, disabling Save, and reordering the list are all bindings.

**Try this:**
1. Click **Pin / Unpin** — the card border changes.
2. Click **Go busy** — Save becomes disabled.
3. Click **Reorder list** — rows move but keep their ids.

**Snippet:**

\`\`\`javascript
html\`
  <button @click=\${() => setPinned(!pinned)} ?disabled=\${busy}>
    \${pinned ? "Unpin" : "Pin"}
  </button>
  \${notes.map((n) => keyed(n.id, html\`<li>\${n.title}</li>\`))}
\`
\`\`\`

| Prefix | Meaning | Example |
| --- | --- | --- |
| (none) | text / child | \`\${title}\` |
| \`.value=\` | DOM **property** | \`.value=\${title}\` |
| \`@click=\` | **event** listener | \`@click=\${onSave}\` |
| \`?disabled=\` | **boolean** attribute | \`?disabled=\${busy}\` |

**Common mistake:** \`unsafeHTML\` is for trusted markup only — never user input (XSS).

**Next:** Lesson 4 — \`useState\` so typing updates the preview.
        `,
      },
    },
  },
};

export const State = {
  render: () => React.createElement("tut-use-state"),
  name: "4. State with useState",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Local state with controlled inputs that keep focus and caret.

**New words:**
- **Hook** — \`useState\` stores a value on the host between renders.
- **Re-render** — Dim runs the function again after \`setTitle\`.
- **Controlled input** — \`.value\` plus \`@input\` so the field shows state.

**Why it matters:** The Dim Notes editor is this pattern: title and body live in state.

**Try this:**
1. Type in **Title** — character count and preview update.
2. Click **Save**, then **Reset**.

**Snippet:**

\`\`\`javascript
const [title, setTitle] = useState("Untitled");

html\`
  <input
    .value=\${title}
    @input=\${(e) => setTitle(e.target.value)}
  />
\`
\`\`\`

Unchanged values (\`Object.is\`) skip a re-render. Prefer \`setCount((n) => n + 1)\` when the next value depends on the previous one.

**Common mistake:** Using \`value="\${title}"\` (attribute) instead of \`.value=\`. Attributes are strings and fight the caret.

**Next:** Lesson 5 — pass notes into child components with \`.props\`.
        `,
      },
    },
  },
};

export const Composition = {
  render: () => React.createElement("tut-composition"),
  name: "5. Props and composition",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Compose children with \`useScope\` and pass objects/functions via \`.props\`.

**New words:**
- **\`.props\`** — a JavaScript object on the child host (notes, callbacks).
- **Attribute** — strings only (\`heading="Editor"\`). Fine for simple text.
- **\`useScope\`** — lets this template use another Dim tag.

**Why it matters:** Dim Notes is a list + editor. The parent owns the array; children render it.

**When to use which:**
- Attributes — strings, numbers-as-text, flags (\`title="Hi"\`, \`?pinned=\`).
- \`.props\` — arrays, objects, functions (\`notes\`, \`onSelect\`).

**Try this:**
1. Click **Add note** — the badge count goes up.
2. Click a card — it highlights.
3. Edit the title in the editor — the card updates.

**Snippet:**

\`\`\`javascript
useScope({ NoteCard }); // uses NoteCard.tag from define()

html\`
  <tut-note-list
    .props=\${{ notes, selectedId, onSelect: setSelectedId }}
  ></tut-note-list>
\`
\`\`\`

**Common mistake:** Putting an object or function in an HTML attribute — it stringifies to \`[object Object]\`. Use \`.props\` or \`.onSelect=\${fn}\`.

**Next:** Lesson 6 — style inside the Shadow DOM and theme with CSS variables.
        `,
      },
    },
  },
};

export const Styling = {
  render: () => React.createElement("tut-styling"),
  name: "6. Styling and Shadow DOM",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Scope CSS to the shadow root and theme with CSS variables.

**New words:**
- **Shadow DOM** — page CSS does not style your internals (and yours do not leak out).
- **CSS custom properties** — \`var(--tut-bg)\` *do* cross the shadow boundary, so they are the theming pipe.
- **\`useStyle\`** — attaches a stylesheet to this shadow root.

**Why it matters:** Dark mode in Dim Notes is \`data-theme\` on the **host** plus tokens children consume.

**Try this:**
1. Click **Dark theme** — the shell and cards invert.
2. Click again to return to light.

**Snippet:**

\`\`\`javascript
useStyle(themeStyles); // static :host([data-theme="dark"]) tokens
useStyle(lessonStyles);  // consumes var(--tut-bg), etc.

host.setAttribute("data-theme", dark ? "dark" : "light");
\`\`\`

Apply theme tokens on the **lesson host** only. Nested children should **consume** variables, not reassign the light palette on their \`:host\`.

**Common mistake:** Putting the whole light palette on every nested \`:host\` — dark mode on the parent never reaches the cards.

**Next:** Track 2 — effects, refs, and persistence as we assemble Dim Notes.
        `,
      },
    },
  },
};

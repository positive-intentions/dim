import React from "react";
import "./tutorial/index.js";

export default {
  title: "Tutorial/2. Building an app",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Track 2 — Building an app

You already have cards, state, props, and Shadow DOM. This track adds
**effects**, **refs**, **persistence**, **motion**, and **files**, then puts
them together as **Dim Notes**.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export const EffectsAndMemo = {
  render: () => React.createElement("tut-effects-memo"),
  name: "7. Effects, lifecycle, memoisation",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Run side effects with cleanup; memoize derived lists.

**New words:**
- **Effect** — work after render (timers, subscriptions). Always return a cleanup.
- **Deps array** — when these values change, the effect re-runs. Dim requires it.
- **Memo** — cache a derived value (\`filtered\` notes) until inputs change.

**Why it matters:** Search in Dim Notes is \`useMemo\`. A “saved N seconds ago” ticker is \`useEffect\` with \`clearInterval\`.

**Try this:**
1. Search \`hooks\` — match count drops to 1.
2. Click **Unmount ticker** — the interval is cleared.

**Snippet:**

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

**Common mistake:** Omitting the deps array — Dim throws. Omitting cleanup leaks timers after unmount.

**Next:** Lesson 8 — focus the title field after adding a note.
        `,
      },
    },
  },
};

export const Refs = {
  render: () => React.createElement("tut-refs"),
  name: "8. Refs and the DOM",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Hold mutable values and focus elements inside the shadow root.

**New words:**
- **Ref** — a box whose \`.current\` you can change without a re-render.
- **Host** — \`useRef()\` with no argument defaults \`.current\` to this custom element.
- **\`querySelector\`** — looks inside the shadow root, not the whole page.

**Why it matters:** After “New note”, Dim Notes keeps the title field focused so you can type immediately.

**Try this:**
1. Click **New note** — the title field stays focused.
2. Watch the render count — updating a ref does not re-render.

**Snippet:**

\`\`\`javascript
const host = useRef(); // host custom element when called with no arg
const addAndFocus = () => {
  setNotes([createNote({ title }), ...notes]);
  void host.current.updateComplete.then(() => querySelector("#title")?.focus());
};
\`\`\`

**Common mistake:** Expecting \`useRef()\` with no argument to be \`null\` (React-style). In Dim it is the **host**.

**Next:** Lesson 9 — persist notes in IndexedDB with one \`useStore\` owner.
        `,
      },
    },
  },
};

export const Store = {
  render: () => React.createElement("tut-use-store"),
  name: "9. Global and persistent state",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Own \`useStore\` in one parent and pass data down via \`.props\`.

**New words:**
- **Persistence** — IndexedDB so notes survive a refresh.
- **Store owner** — the parent that calls \`useStore\`; children stay presentational.
- **Encryption key** — optional; lose it, lose the ciphertext.

**Why it matters:** Dim Notes should not forget your list on reload. Recommended pattern: **one owner, children receive props**.

**Try this:**
1. Type a title and click **Add note** — the badge and list update.
2. Reload the story — plaintext notes remain.
3. Type a secret title and add an encrypted note on the right.

**Snippet:**

\`\`\`javascript
// Prefer one useStore at the top; children stay presentational.
const store = useStore({
  tutNotes: useState([]),
  tutTheme: useState("light"),
});
const [notes, setNotes, notesLoading] = store.tutNotes;

// Encryption is opt-in — there is no default password:
const enc = useStore(schema, { encryptionKey: userKey });

html\`<notes-badge .props=\${{ notes, loading: notesLoading }}></notes-badge>\`
\`\`\`

**Common mistake:** Hardcoding a production encryption key (or losing it). Never bake a real password into source.

**Next:** Lesson 10 — animate list ↔ detail.
        `,
      },
    },
  },
};

export const ViewTransitions = {
  render: () => React.createElement("tut-view-transitions"),
  name: "10. View transitions",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Animate list ↔ detail with \`transitionId\` and shared elements.

**New words:**
- **View transition** — the browser morphs between two states of the same host.
- **Shared element** — a node marked \`data-vt-shared\` that FLIPs (title and body).
- **\`transitionId\`** — numeric ids pick slide direction automatically.

**Why it matters:** Opening a note in Dim Notes should feel like navigation, not a hard swap.

**Try this:**
1. Click a note — content slides to detail.
2. Click **Back** — title and body FLIP as shared elements.

**Snippet:**

\`\`\`javascript
html\`
  <tut-notes-pane
    transitionId="\${viewId}"
    transitionDuration="450"
    .props=\${{ view, note, onOpen, onBack }}
  ></tut-notes-pane>
\`
\`\`\`

Mark matching nodes with the same key on both views, e.g. \`data-vt-shared="note-title-\${id}"\` and \`data-vt-shared="note-body-\${id}"\`.

**Common mistake:** Different \`data-vt-shared\` ids on list vs detail — those nodes will not morph.

**Next:** Lesson 11 — export notes as files with \`useFS\`.
        `,
      },
    },
  },
};

export const Files = {
  render: () => React.createElement("tut-use-fs"),
  name: "11. Files with useFS",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Read and write files via OPFS (or File System Access).

**New words:**
- **OPFS** — Origin Private File System: files for this site, in the browser.
- **\`useFS\`** — Dim hook for write / read / list.
- **Origin-private** — other sites cannot see these files.

**Why it matters:** Dim Notes can export markdown into \`notes/\` and import it back.

**Try this:**
1. Click **Export notes** (needs a browser with OPFS).
2. Click **Import** on a listed file.

**Snippet:**

\`\`\`javascript
const fs = useFS({ opfs: true });
await fs.writeFile(\`\${id}.md\`, markdown, "notes");
const entries = await fs.listDirectory("notes");
\`\`\`

**Common mistake:** Expecting OPFS in jsdom / some embeds — the demo shows \`unavailable\` there. Optional \`{ encrypt: true, encryptionPassword }\` encrypts bytes (no default password).

**Next:** Lesson 12 — put tracks 1–2 together as Dim Notes.
        `,
      },
    },
  },
};

export const FinalApp = {
  render: () => React.createElement("tut-final-app"),
  name: "12. Dim Notes (put it together)",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Use Basics + Building an app in one notes app.

**New words:**
- **Dim Notes** — list, editor, search, theme, persistence, motion, export.
- **Local mirror** — UI state that updates immediately while \`useStore\` persists.

**Why it matters:** This is the destination of the tutorial: a real custom-element app.

**Try this:**
1. **New note**, edit title/body.
2. **Search** to filter.
3. **Dark** — theme inverts (and persists via \`tutTheme\`).
4. Open a note — list ↔ detail transition.
5. **Export to OPFS** when available.

**Snippet:** one parent \`useStore\`, children via \`.props\`, \`data-theme\` on the host.

## Recap

- \`define\` + \`html\` — a custom element
- Bindings — \`.\` \`@\` \`?\`, \`keyed\`
- \`useState\` — immutable updates, \`.value\` + \`@input\`
- \`useScope\` + \`.props\` — composition
- \`useEffect\` / \`useMemo\` — cleanup and derived data
- \`useRef\` / \`querySelector\` — host vs DOM nodes
- \`useStyle\` + \`data-theme\` — shadow CSS and theming
- \`useStore\` — shared + persisted; encryption opt-in
- \`transitionId\` + \`data-vt-shared\` — motion
- \`useFS({ opfs: true })\` — files

**Common mistake:** Mutating the notes array in place — Dim bails out (see Advanced · Pitfalls).

**Next:** Track 3 — React interop, internals, and rules of hooks.
        `,
      },
    },
  },
};

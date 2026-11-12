import React from "react";
import "./tutorial/index.js";
import { TutorialReactInterop } from "./tutorial/advanced/13-react-interop.js";

export default {
  title: "Tutorial/3. Advanced",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Track 3 — Advanced

Optional once Dim Notes works: **React interop**, how Dim stores hooks
(no virtual DOM), and the **rules of hooks**.
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export const ReactInterop = {
  render: () => React.createElement(TutorialReactInterop),
  name: "13. React interop",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Mount Dim in React and share encrypted store data via \`useDimStore\`.

**New words:**
- **\`useDimStore\`** — React hook that talks to the same encrypted key as Dim \`useStore\`.
- **\`element.props\`** — how React passes objects into a custom element (attributes are strings).
- **Debounce** — store events wait ~200ms before broadcasting.

**Why it matters:** You can drop a Dim notes widget into an existing React page.

**Try this:**
1. Type in the React textarea.
2. Watch the Dim textarea (after ~200ms debounce).
3. The echo card updates via \`element.props\` from a React ref.

**Snippet:**

\`\`\`javascript
const ref = useRef(null);
useEffect(() => {
  if (ref.current) ref.current.props = { label: value };
}, [value]);

const [value, setValue, isLoading] = useDimStore({
  key: "tutReactNote",
  password: userKey, // required — no default
  defaultValue: "",
});
\`\`\`

**Common mistake:** Passing objects through React JSX attributes — they become strings. Use \`element.props\`.

**Next:** Lesson 14 — hook slots and the update path.
        `,
      },
    },
  },
};

export const UnderTheHood = {
  render: () => React.createElement("tut-under-the-hood"),
  name: "14. Under the hood",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** See how one update flows through Dim.

**New words:**
- **Hook slot** — \`hooks["hook-N"]\` on the host, filled in call order.
- **No virtual DOM** — Dim commits template parts to the real shadow tree.
- **\`requestUpdate\`** — batches work in a microtask.

**Why it matters:** Conditional hooks shift slot numbers and “lose” state. Knowing the path explains the rules.

**Try this:**
1. Click **Increment**.
2. Read the inspector: render count, \`hookIndex\`, hook slot names.

**Update path:**
1. \`requestUpdate\` batches in a microtask
2. \`render()\` resets \`hookIndex\` and runs your function
3. Renderer commits only changed parts (\`preserveFocus\`)
4. \`useStyle\` flushes (adopted sheet or \`<style>\`)
5. \`updated()\` runs

Hooks live in numbered slots on the **host element**. React keeps a fiber tree; Dim keeps slots on the custom element and patches the shadow DOM. That is why there is no virtual DOM, and why hook order must be stable.

Source maps: \`src/core/renderer\`, \`element\`, \`hooks\`, \`store\`, \`transitions\`, \`fs\`.

**Common mistake:** Calling \`useState\` inside \`if\` — the next render reads the wrong slot.

**Next:** Lesson 15 — immutable updates and the rest of the rules.
        `,
      },
    },
  },
};

export const Pitfalls = {
  render: () => React.createElement("tut-pitfalls"),
  name: "15. Pitfalls and rules of hooks",
  parameters: {
    docs: {
      description: {
        story: `
**Goal:** Avoid the mistakes that make Dim feel “broken.”

**New words:**
- **Identity** — \`Object.is(prev, next)\`. Same array reference → no re-render.
- **Rules of hooks** — same number, same order, every render.
- **Copy then set** — \`setNotes([...notes, item])\`.

**Why it matters:** Mutating notes in Dim Notes looks like “the button does nothing.”

**Try this:**
1. **Push (mutate)** — UI stays at 2 items.
2. **Force re-render** — mutated data finally shows.
3. **Push (copy)** — UI updates immediately.

**Wrong / right:**

\`\`\`javascript
// Wrong — same array identity, Object.is bails out
notes.push(item); setNotes(notes);

// Right
setNotes([...notes, item]);
\`\`\`

Other rules:
- Never call hooks inside conditions or loops
- Objects/functions → \`.props\`, not attributes
- \`useEffect\` always needs a deps array and usually a cleanup
- \`useLazyScope\` evaluates code — unsafe for untrusted input
- \`useRef()\` with no arg → host element, not \`null\`
- Boolean state (\`useState(false)\`) is valid — Dim preserves falsy values

**Common mistake:** \`notes.push\` then \`setNotes(notes)\`. Always copy.

**Next:** API Reference and the Demo apps when you want more depth.
        `,
      },
    },
  },
};

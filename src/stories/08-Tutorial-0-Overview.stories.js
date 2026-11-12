import React from "react";

export default {
  title: "Tutorial/Overview",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: `
# Dim Tutorial

Dim is a **functional web-components** framework: React-like hooks, an owned
template renderer (\`html\` / \`css\`), Shadow DOM, and **no virtual DOM**.

You do **not** need React to follow this tutorial. Basic HTML and JavaScript
are enough.

## What you will build

**Dim Notes** — a small notes app that grows lesson by lesson:

- Cards, lists, and an editor
- Search, theme, and persisted notes
- Optional encryption
- List ↔ detail motion
- Export / import as files

## Three tracks

1. **Basics** — what a web component is, then Dim’s \`define\`, templates, state, props, and Shadow DOM styling
2. **Building an app** — effects, refs, persistence, motion, files, and the full Dim Notes app
3. **Advanced** — React interop, how Dim works inside, and the rules of hooks

## How to read each lesson

1. **Goal** — what this step teaches
2. **New words** — terms you will see in the live example
3. **Why it matters** — how it shows up in Dim Notes
4. **Try this** — numbered clicks and what you should see
5. **Snippet** — the smallest working code
6. **Common mistake** — one pitfall and the fix
7. **Next** — the following lesson

Import from the public API:

\`\`\`javascript
import { define, html, css, useState } from "../core/index.ts";
// src/core/dim.ts re-exports the same surface.
\`\`\`

## Glossary

| Term | Meaning |
| --- | --- |
| **Custom element** | A tag you register with the browser (\`tut-note-card\`). Tag names must contain a hyphen. |
| **Tag name** | The string in HTML, e.g. \`<tut-note-card>\`. |
| **Host** | The custom-element instance itself (the outer node). |
| **Shadow DOM** | A private DOM tree attached to the host. Page CSS does not leak in. |
| **Shadow root** | The root of that private tree (\`element.shadowRoot\`). |
| **Attribute** | A string on the HTML tag: \`title="Hello"\`. Always text. |
| **Property** | A JavaScript value on the element: objects, functions, booleans. Use \`.props\` or \`.value=\`. |
| **Event** | Something the user (or browser) did, e.g. a click. Bind with \`@click=\`. |
| **Template** | The \`html\` tagged template that describes the shadow tree. |
| **Hook** | A function like \`useState\` that Dim calls in the same order every render. |
| **Re-render** | Dim runs your component function again and updates only what changed. |
| **Persistence** | Saving state so it survives a refresh (IndexedDB via \`useStore\`). |
        `,
      },
    },
  },
  tags: ["autodocs"],
};

export const StartHere = {
  render: () =>
    React.createElement(
      "div",
      {
        style: {
          fontFamily: "system-ui, sans-serif",
          maxWidth: 720,
          margin: "2rem auto",
          padding: "1.5rem",
          lineHeight: 1.5,
        },
      },
      React.createElement("p", { style: { color: "#029cfd", fontWeight: 700, letterSpacing: "0.08em", fontSize: 12 } }, "TUTORIAL"),
      React.createElement("h1", { style: { marginTop: 4 } }, "Start here"),
      React.createElement(
        "p",
        null,
        "Open Tutorial / 1. Basics / 1. What is a web component? when you are ready. Use the Docs tab on each lesson for Goal, New words, Try this, and the snippet."
      ),
      React.createElement(
        "ol",
        null,
        React.createElement("li", null, "Basics — web components, define, templates, state, props, styling"),
        React.createElement("li", null, "Building an app — effects, refs, store, motion, files, Dim Notes"),
        React.createElement("li", null, "Advanced — React, internals, pitfalls")
      )
    ),
  name: "Start here",
};

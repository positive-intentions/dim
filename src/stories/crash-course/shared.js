import { css } from "../../core/index.ts";

export const SEED_NOTES = [
  {
    id: "n-welcome",
    title: "Welcome to Dim Notes",
    body: "A tiny notes app that grows with each crash-course lesson.",
    pinned: true,
    tags: ["intro"],
    updatedAt: 1,
  },
  {
    id: "n-hooks",
    title: "Hooks feel familiar",
    body: "useState, useEffect, useMemo, useRef — same ideas, native custom elements.",
    pinned: false,
    tags: ["hooks"],
    updatedAt: 2,
  },
  {
    id: "n-store",
    title: "State that outlives the tab",
    body: "useStore persists to IndexedDB. Encryption is opt-in; there is no default password.",
    pinned: false,
    tags: ["store"],
    updatedAt: 3,
  },
];

export function createNote(overrides = {}) {
  return {
    id:
      overrides.id ||
      `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: overrides.title || "Untitled",
    body: overrides.body || "",
    pinned: !!overrides.pinned,
    tags: overrides.tags || [],
    updatedAt: overrides.updatedAt || Date.now(),
  };
}

export function wordCount(text) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

/** Shared chrome for every crash-course live example. */
export const lessonStyles = css`
  :host {
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    color: var(--cc-fg, #0f172a);
    background: var(--cc-bg, #ffffff);
    --cc-accent: #029cfd;
    --cc-accent-hover: #0278c7;
    --cc-border: #e2e8f0;
    --cc-muted: #64748b;
    --cc-card: #f8fafc;
    --cc-danger: #dc3545;
    --cc-ok: #15803d;
    line-height: 1.45;
  }

  * {
    box-sizing: border-box;
  }

  .shell {
    max-width: 920px;
    margin: 0 auto;
    padding: 1.25rem;
    border: 1px solid var(--cc-border);
    border-radius: 12px;
    background: var(--cc-bg, #fff);
  }

  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--cc-accent);
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  h1,
  h2,
  h3 {
    margin: 0 0 0.5rem;
  }

  p {
    margin: 0 0 0.75rem;
    color: var(--cc-muted);
  }

  .row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    align-items: center;
  }

  .stack {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  @media (max-width: 700px) {
    .split {
      grid-template-columns: 1fr;
    }
  }

  button,
  .btn {
    background: var(--cc-accent);
    color: #fff;
    border: none;
    padding: 0.45rem 0.85rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    font-size: 0.875rem;
  }

  button:hover,
  .btn:hover {
    background: var(--cc-accent-hover);
  }

  button:disabled,
  .btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  button.ghost {
    background: transparent;
    color: var(--cc-fg, #0f172a);
    border: 1px solid var(--cc-border);
  }

  button.ghost:hover {
    background: var(--cc-card);
  }

  button.danger {
    background: var(--cc-danger);
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--cc-border);
    border-radius: 6px;
    font: inherit;
    background: var(--cc-bg, #fff);
    color: inherit;
  }

  textarea {
    min-height: 7rem;
    resize: vertical;
  }

  .card {
    background: var(--cc-card);
    border: 1px solid var(--cc-border);
    border-radius: 10px;
    padding: 0.9rem 1rem;
  }

  .card.selected,
  .card.active {
    border-color: var(--cc-accent);
    box-shadow: 0 0 0 2px rgba(2, 156, 253, 0.2);
  }

  .card.pinned {
    border-left: 4px solid var(--cc-accent);
  }

  .muted {
    color: var(--cc-muted);
    font-size: 0.85rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: #e0f2fe;
    color: #075985;
    border-radius: 999px;
    padding: 0.1rem 0.55rem;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .note-title {
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  .note-body {
    margin: 0;
    color: var(--cc-muted);
    white-space: pre-wrap;
  }

  .status {
    font-size: 0.85rem;
    color: var(--cc-ok);
  }

  .status.error {
    color: var(--cc-danger);
  }

  kbd {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8em;
    background: var(--cc-card);
    border: 1px solid var(--cc-border);
    border-radius: 4px;
    padding: 0.05rem 0.3rem;
  }
`;

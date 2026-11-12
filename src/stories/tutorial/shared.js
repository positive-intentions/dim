import { css } from "../../core/index.ts";

export const SEED_NOTES = [
  {
    id: "n-welcome",
    title: "Welcome to Dim Notes",
    body: "A tiny notes app that grows with each tutorial lesson.",
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

/**
 * Static theme tokens for the lesson HOST only.
 * Toggle with host.setAttribute("data-theme", "light"|"dark").
 * Children inherit these vars across the shadow boundary — do not reassign
 * the palette in nested :host rules.
 */
export const themeStyles = css`
  :host,
  :host([data-theme="light"]) {
    --tut-bg: #ffffff;
    --tut-fg: #0f172a;
    --tut-card: #f8fafc;
    --tut-border: #e2e8f0;
    --tut-muted: #64748b;
    --tut-accent: #029cfd;
    --tut-accent-hover: #0278c7;
    --tut-danger: #dc3545;
    --tut-ok: #15803d;
    --tut-badge-bg: #e0f2fe;
    --tut-badge-fg: #075985;
  }

  :host([data-theme="dark"]) {
    --tut-bg: #0b1220;
    --tut-fg: #e2e8f0;
    --tut-card: #111827;
    --tut-border: #1f2937;
    --tut-muted: #94a3b8;
    --tut-accent: #38bdf8;
    --tut-accent-hover: #7dd3fc;
    --tut-danger: #f87171;
    --tut-ok: #4ade80;
    --tut-badge-bg: #0c4a6e;
    --tut-badge-fg: #e0f2fe;
  }
`;

/**
 * Shared chrome. Consumes theme tokens — does NOT assign the light palette
 * on :host (that would reset nested children and defeat dark mode).
 */
export const lessonStyles = css`
  :host {
    display: block;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
      sans-serif;
    color: var(--tut-fg, #0f172a);
    background: var(--tut-bg, #ffffff);
    line-height: 1.45;
  }

  * {
    box-sizing: border-box;
  }

  .shell {
    max-width: 920px;
    margin: 0 auto;
    padding: 1.25rem;
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 12px;
    background: var(--tut-bg, #fff);
    color: var(--tut-fg, #0f172a);
  }

  .eyebrow {
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--tut-accent, #029cfd);
    font-weight: 700;
    margin: 0 0 0.25rem;
  }

  h1,
  h2,
  h3 {
    margin: 0 0 0.5rem;
    color: var(--tut-fg, #0f172a);
  }

  p {
    margin: 0 0 0.75rem;
    color: var(--tut-muted, #64748b);
  }

  .try {
    margin: 0 0 1rem;
    padding: 0.55rem 0.75rem;
    border-radius: 8px;
    background: var(--tut-card, #f8fafc);
    border: 1px dashed var(--tut-border, #e2e8f0);
    color: var(--tut-fg, #0f172a);
    font-size: 0.9rem;
  }

  .try strong {
    color: var(--tut-accent, #029cfd);
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
    background: var(--tut-accent, #029cfd);
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
    background: var(--tut-accent-hover, #0278c7);
  }

  button:disabled,
  .btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  button.ghost {
    background: transparent;
    color: var(--tut-fg, #0f172a);
    border: 1px solid var(--tut-border, #e2e8f0);
  }

  button.ghost:hover {
    background: var(--tut-card, #f8fafc);
  }

  button.danger {
    background: var(--tut-danger, #dc3545);
  }

  input,
  textarea,
  select {
    width: 100%;
    padding: 0.5rem 0.7rem;
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 6px;
    font: inherit;
    background: var(--tut-bg, #fff);
    color: inherit;
  }

  textarea {
    min-height: 7rem;
    resize: vertical;
  }

  .card {
    background: var(--tut-card, #f8fafc);
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 10px;
    padding: 0.9rem 1rem;
    color: var(--tut-fg, #0f172a);
  }

  .card.selected,
  .card.active {
    border-color: var(--tut-accent, #029cfd);
    box-shadow: 0 0 0 2px rgba(2, 156, 253, 0.2);
  }

  .card.pinned {
    border-left: 4px solid var(--tut-accent, #029cfd);
  }

  .muted {
    color: var(--tut-muted, #64748b);
    font-size: 0.85rem;
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    background: var(--tut-badge-bg, #e0f2fe);
    color: var(--tut-badge-fg, #075985);
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
    color: var(--tut-muted, #64748b);
    white-space: pre-wrap;
  }

  .status {
    font-size: 0.85rem;
    color: var(--tut-ok, #15803d);
  }

  .status.error {
    color: var(--tut-danger, #dc3545);
  }

  kbd {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.8em;
    background: var(--tut-card, #f8fafc);
    border: 1px solid var(--tut-border, #e2e8f0);
    border-radius: 4px;
    padding: 0.05rem 0.3rem;
  }
`;

/**
 * Apply data-theme on the host so static themeStyles take effect.
 * Call from the lesson host only (not nested children).
 */
export function applyTheme(host, theme) {
  if (!host || typeof host.setAttribute !== "function") return;
  host.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
}

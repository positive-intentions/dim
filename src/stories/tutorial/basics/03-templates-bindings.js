import { define, html, css, useState, useStyle, keyed, unsafeHTML } from "../../../core/index.ts";
import { lessonStyles, SEED_NOTES } from "../shared.js";

export const Lesson02 = define({
  tag: "tut-templates-bindings",
  component: (
    _,
    { html: tpl, css: cssFn, useStyle: style, useState: state }
  ) => {
    style(lessonStyles);
    style(cssFn`
      .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }
      .trusted {
        font-size: 0.9rem;
      }
    `);

    const [pinned, setPinned] = state(true);
    const [busy, setBusy] = state(false);
    const [notes, setNotes] = state(SEED_NOTES.map((n) => ({ ...n })));
    const trusted = "<em>trusted markup</em> via unsafeHTML";

    const togglePin = () => setPinned((p) => !p);
    const toggleBusy = () => setBusy((b) => !b);
    const shuffle = () => setNotes((list) => [...list].reverse());

    return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 3</div>
        <h2>Templates and bindings</h2>
        <p class="try"><strong>Try:</strong> 1) Pin / Unpin — the card border changes. 2) Go busy — Save greys out. 3) Reorder list — rows move but keep their ids.</p>

        <div class="toolbar">
          <button id="toggle-pin" @click="${togglePin}">
            ${pinned ? "Unpin" : "Pin"}
          </button>
          <button id="shuffle" @click="${shuffle}">Reorder list</button>
          <button id="busy-toggle" @click="${toggleBusy}">
            ${busy ? "Stop" : "Go busy"}
          </button>
          <button id="save" ?disabled="${busy}">
            ${busy ? "Saving…" : "Save"}
          </button>
        </div>

        <article class="card ${pinned ? "pinned active" : ""}" data-pinned="${pinned ? "yes" : "no"}">
          <h3 class="note-title">Binding playground</h3>
          <p class="muted">Pinned: ${pinned ? "yes" : "no"} · Save disabled: ${busy ? "yes" : "no"}</p>
          <p class="trusted">${unsafeHTML(trusted)}</p>
        </article>

        <div class="list" style="margin-top: 0.75rem" id="note-list">
          ${notes.map((note) =>
            keyed(
              note.id,
              tpl`
                <div class="card" data-id="${note.id}">
                  <div class="note-title">${note.title}</div>
                  <div class="muted">${note.id}</div>
                </div>
              `
            )
          )}
        </div>
      </div>
    `;
  },
});

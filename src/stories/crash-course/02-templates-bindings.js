import { define, html, css, useState, useStyle, keyed, unsafeHTML } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES } from "./shared.js";

export const Lesson02 = define({
  tag: "cc-lesson-02",
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

    const shuffle = () => {
      setNotes([...notes].reverse());
    };

    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 2</div>
        <h2>Templates and bindings</h2>
        <p>
          Interpolate text and attributes. Prefixes:
          <kbd>.prop=</kbd> properties,
          <kbd>@event=</kbd> listeners,
          <kbd>?bool=</kbd> boolean attributes.
          Use <kbd>keyed</kbd> so list rows keep identity when they move.
        </p>

        <div class="toolbar">
          <button id="toggle-pin" @click="${() => setPinned(!pinned)}">
            ${pinned ? "Unpin" : "Pin"}
          </button>
          <button id="shuffle" @click="${shuffle}">Reorder list</button>
          <button
            id="busy-toggle"
            @click="${() => setBusy(!busy)}"
          >${busy ? "Stop" : "Go busy"}</button>
          <button id="save" ?disabled="${busy}">
            ${busy ? "Saving…" : "Save"}
          </button>
        </div>

        <article class="card ${pinned ? "pinned active" : ""}">
          <h3 class="note-title">Binding playground</h3>
          <p class="muted">Pinned: ${pinned ? "yes" : "no"} · Save disabled: ${busy ? "yes" : "no"}</p>
          <p class="trusted">${unsafeHTML(trusted)}</p>
        </article>

        <div class="list" style="margin-top: 0.75rem">
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

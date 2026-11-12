import { define, html, css, useState, useStyle, useScope } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES } from "./shared.js";

const NotesPane = define({
  tag: "cc-l09-pane",
  component: (
    { view, note, notes, onOpen, onBack },
    { html: tpl, css: cssFn, useStyle: style }
  ) => {
    style(lessonStyles);
    style(cssFn`
      :host { display: block; min-height: 280px; }
      .hero {
        font-size: 1.4rem;
        margin-bottom: 0.5rem;
      }
    `);

    if (view === "detail" && note) {
      return tpl`
        <div class="stack">
          <button id="back" class="ghost" @click="${onBack}">← Back</button>
          <h2 class="hero" data-vt-shared="${`note-title-${note.id}`}">${note.title}</h2>
          <p class="note-body">${note.body}</p>
        </div>
      `;
    }

    const items = notes || [];
    return tpl`
      <div class="list">
        ${items.map(
          (n) => tpl`
            <article
              class="card"
              data-id="${n.id}"
              @click="${() => onOpen && onOpen(n.id)}"
            >
              <div class="note-title" data-vt-shared="${`note-title-${n.id}`}">${n.title}</div>
              <p class="note-body">${n.body}</p>
            </article>
          `
        )}
      </div>
    `;
  },
});

export const Lesson09 = define({
  tag: "cc-lesson-09",
  component: (
    _,
    { html: tpl, css: cssFn, useStyle: style, useState: state, useScope: scope }
  ) => {
    style(lessonStyles);
    scope({ NotesPane });

    const notes = SEED_NOTES;
    const [selectedId, setSelectedId] = state(null);
    const view = selectedId ? "detail" : "list";
    const note = notes.find((n) => n.id === selectedId);
    // Numeric-ish view ids give automatic slide direction.
    const viewId = selectedId ? notes.findIndex((n) => n.id === selectedId) + 1 : 0;

    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 9</div>
        <h2>View transitions</h2>
        <p>
          Put <kbd>transitionId</kbd> on a child to animate content changes.
          Mark matching nodes with <kbd>data-vt-shared</kbd> for a FLIP
          shared-element animation. Numeric ids pick slide direction.
        </p>
        <cc-l09-pane
          transitionId="${viewId}"
          transitionDuration="450"
          .props="${{
            view,
            note,
            notes,
            onOpen: setSelectedId,
            onBack: () => setSelectedId(null),
          }}"
        ></cc-l09-pane>
      </div>
    `;
  },
});

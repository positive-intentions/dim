import { define, html, css, useState, useStyle, useScope, renderChildren } from "../../../core/index.ts";
import { lessonStyles, SEED_NOTES, createNote } from "../shared.js";

export const NoteCard = define({
  tag: "tut-composition-note-card",
  component: (
    { note, selected, onSelect, tags },
    { html: tpl, css: cssFn, useStyle: style }
  ) => {
    style(lessonStyles);
    style(cssFn`
      .card { cursor: pointer; }
      .tags { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.35rem; }
    `);
    const data = note || { title: "Untitled", body: "", id: "unknown" };
    const tagList = Array.isArray(tags) ? tags : data.tags || [];
    return tpl`
      <article
        class="card ${selected ? "selected" : ""} ${data.pinned ? "pinned" : ""}"
        data-id="${data.id}"
        @click="${() => onSelect && onSelect(data.id)}"
      >
        <div class="note-title">${data.title}</div>
        <p class="note-body">${data.body}</p>
        <div class="tags">
          ${tagList.map((t) => tpl`<span class="badge">${t}</span>`)}
        </div>
      </article>
    `;
  },
});

export const Panel = define({
  tag: "tut-composition-panel",
  component: ({ heading, children }, { html: tpl, css: cssFn, useStyle: style }) => {
    style(lessonStyles);
    style(cssFn`
      h3 { font-size: 0.95rem; }
    `);
    return tpl`
      <section class="card">
        <h3>${heading || "Panel"}</h3>
        <div>${renderChildren(children)}</div>
      </section>
    `;
  },
});

export const NoteList = define({
  tag: "tut-composition-note-list",
  component: (
    { notes, selectedId, onSelect },
    { html: tpl, css: cssFn, useStyle: style, useScope: scope }
  ) => {
    style(lessonStyles);
    scope({ NoteCard });
    const items = notes || [];
    return tpl`
      <div class="list">
        ${items.map(
          (note) => tpl`
            <tut-composition-note-card
              .props="${{
                note,
                selected: note.id === selectedId,
                onSelect,
                tags: note.tags,
              }}"
            ></tut-composition-note-card>
          `
        )}
      </div>
    `;
  },
});

export const Lesson04 = define({
  tag: "tut-composition",
  component: (
    _,
    { html: tpl, css: cssFn, useStyle: style, useState: state, useScope: scope }
  ) => {
    style(lessonStyles);
    scope({ NoteCard, NoteList, Panel });

    const [notes, setNotes] = state(SEED_NOTES.map((n) => ({ ...n })));
    const [selectedId, setSelectedId] = state(notes[0].id);

    const selected = notes.find((n) => n.id === selectedId) || notes[0];

    const addNote = () => {
      const note = createNote({
        title: `Note ${notes.length + 1}`,
        body: "Written in the composition lesson.",
        tags: ["new"],
      });
      setNotes([note, ...notes]);
      setSelectedId(note.id);
    };

    const updateTitle = (title) => {
      setNotes(
        notes.map((n) => (n.id === selectedId ? { ...n, title } : n))
      );
    };

    return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 5</div>
        <h2>Props and composition</h2>
        <p class="try"><strong>Try:</strong> 1) Add note — the badge count goes up. 2) Click a card. 3) Edit its title in the editor — both views stay in sync.</p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button id="add-note" @click="${addNote}">Add note</button>
          <span class="badge" id="count">${notes.length} notes</span>
        </div>

        <div class="split">
          <tut-composition-note-list
            .props="${{ notes, selectedId, onSelect: setSelectedId }}"
          ></tut-composition-note-list>
          <div class="stack">
            <tut-composition-panel heading="Editor">
              <label>
                <span class="muted">Title</span>
                <input
                  id="title"
                  .value="${selected.title}"
                  @input="${(e) => updateTitle(e.target.value)}"
                />
              </label>
            </tut-composition-panel>
            <tut-composition-note-card
              tags='["json","attr"]'
              .props="${{ note: selected, selected: true }}"
            ></tut-composition-note-card>
          </div>
        </div>
      </div>
    `;
  },
});

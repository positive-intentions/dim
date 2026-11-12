import { define, html, css, useState, useStyle, useScope, renderChildren } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES, createNote } from "./shared.js";

export const NoteCard = define({
  tag: "cc-l04-note-card",
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
  tag: "cc-l04-panel",
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
  tag: "cc-l04-note-list",
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
            <cc-l04-note-card
              .props="${{
                note,
                selected: note.id === selectedId,
                onSelect,
                tags: note.tags,
              }}"
            ></cc-l04-note-card>
          `
        )}
      </div>
    `;
  },
});

export const Lesson04 = define({
  tag: "cc-lesson-04",
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
        <div class="eyebrow">Lesson 4</div>
        <h2>Props and composition</h2>
        <p>
          <kbd>useScope({ NoteCard })</kbd> registers children using the
          <kbd>.tag</kbd> stamped by <kbd>define</kbd>. Pass objects and
          functions with <kbd>.props</kbd>. Slot markup with
          <kbd>renderChildren</kbd>. JSON attributes such as
          <kbd>tags='["a"]'</kbd> are parsed automatically.
        </p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button id="add-note" @click="${addNote}">Add note</button>
          <span class="badge" id="count">${notes.length} notes</span>
        </div>

        <div class="split">
          <cc-l04-note-list
            .props="${{ notes, selectedId, onSelect: setSelectedId }}"
          ></cc-l04-note-list>
          <div class="stack">
            <cc-l04-panel heading="Editor">
              <label>
                <span class="muted">Title</span>
                <input
                  id="title"
                  .value="${selected.title}"
                  @input="${(e) => updateTitle(e.target.value)}"
                />
              </label>
            </cc-l04-panel>
            <cc-l04-note-card
              tags='["json","attr"]'
              .props="${{ note: selected, selected: true }}"
            ></cc-l04-note-card>
          </div>
        </div>
      </div>
    `;
  },
});

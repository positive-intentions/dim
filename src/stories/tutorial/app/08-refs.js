import { define, html, css, useState, useRef, useStyle } from "../../../core/index.ts";
import { lessonStyles, SEED_NOTES, createNote } from "../shared.js";

export const Lesson06 = define({
  tag: "tut-refs",
  component: (
    _,
    {
      html: tpl,
      css: cssFn,
      useStyle: style,
      useState: state,
      useRef: ref,
      querySelector,
    }
  ) => {
    style(lessonStyles);

    const [notes, setNotes] = state(SEED_NOTES.map((n) => ({ ...n })));
    const [title, setTitle] = state("");
    const [selectedId, setSelectedId] = state(notes[0].id);

    const renderCount = ref(0);
    renderCount.current += 1;

    // No initial value → `.current` is the host custom element (Dim-specific).
    const host = ref();

    const addAndFocus = () => {
      const note = createNote({
        title: title || `Note ${notes.length + 1}`,
        body: "",
      });
      setNotes([note, ...notes]);
      setSelectedId(note.id);
      setTitle("");
      // Wait for the scheduled re-render, then focus inside the shadow root.
      const el = host.current;
      void Promise.resolve(el?.updateComplete).then(() => {
        querySelector("#title")?.focus();
      });
    };

    return tpl`
      <div class="shell">
        <div class="eyebrow">Building an app · Lesson 8</div>
        <h2>Refs and the DOM</h2>
        <p class="try"><strong>Try:</strong> Click New note — the title field stays focused. Watch the render count: refs change without extra renders.</p>

        <div class="row" style="margin-bottom: 0.75rem">
          <input
            id="title"
            placeholder="New note title"
            .value="${title}"
            @input="${(e) => setTitle(e.target.value)}"
            @keydown="${(e) => {
              if (e.key === "Enter") addAndFocus();
            }}"
          />
          <button id="add-note" @click="${addAndFocus}">New note</button>
        </div>

        <p class="muted" id="renders">
          Render count (ref, no re-render): ${renderCount.current}
          · Host tag: ${host.current?.tagName?.toLowerCase?.() || "…"}
        </p>

        <div class="list" id="note-list">
          ${notes.map(
            (note) => tpl`
              <article
                class="card ${note.id === selectedId ? "selected" : ""}"
                data-id="${note.id}"
                @click="${() => setSelectedId(note.id)}"
              >
                <div class="note-title">${note.title}</div>
              </article>
            `
          )}
        </div>
      </div>
    `;
  },
});

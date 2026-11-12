import { define, html, css, useState, useStyle, useStore, useScope, useMemo } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES, createNote, wordCount } from "./shared.js";

const FinalCard = define({
  tag: "cc-final-card",
  component: ({ note, selected, onSelect }, { html: tpl, css: cssFn, useStyle: style }) => {
    style(lessonStyles);
    style(cssFn`
      .card { cursor: pointer; }
    `);
    const data = note || { id: "", title: "", body: "" };
    return tpl`
      <article
        class="card ${selected ? "selected" : ""} ${data.pinned ? "pinned" : ""}"
        data-id="${data.id}"
        @click="${() => onSelect && onSelect(data.id)}"
      >
        <div class="note-title" data-vt-shared="${`final-title-${data.id}`}">${data.title}</div>
        <p class="note-body">${(data.body || "").slice(0, 80)}</p>
      </article>
    `;
  },
});

const FinalPane = define({
  tag: "cc-final-pane",
  component: (
    { view, notes, selected, onSelect, onBack, onSave, onExport, files, status, fsReady },
    { html: tpl, css: cssFn, useStyle: style, useScope: scope }
  ) => {
    style(lessonStyles);
    style(cssFn`
      :host { display: block; min-height: 320px; }
      .editor { display: flex; flex-direction: column; gap: 0.5rem; }
    `);
    scope({ FinalCard });

    if (view === "edit" && selected) {
      return tpl`
        <div class="editor">
          <button id="back" class="ghost" @click="${onBack}">← Notes</button>
          <h2 data-vt-shared="${`final-title-${selected.id}`}">${selected.title}</h2>
          <input
            id="title"
            .value="${selected.title}"
            @input="${(e) => onSave({ ...selected, title: e.target.value })}"
          />
          <textarea
            id="body"
            .value="${selected.body}"
            @input="${(e) => onSave({ ...selected, body: e.target.value })}"
          ></textarea>
          <span class="muted">${wordCount(selected.body)} words</span>
        </div>
      `;
    }

    const items = notes || [];
    return tpl`
      <div class="stack">
        <div class="list">
          ${items.map(
            (note) => tpl`
              <cc-final-card
                .props="${{
                  note,
                  selected: selected && note.id === selected.id,
                  onSelect,
                }}"
              ></cc-final-card>
            `
          )}
        </div>
        <div class="row">
          <button id="export" @click="${onExport}" ?disabled="${!fsReady}">Export to OPFS</button>
          <span class="muted">${status || (files || []).join(", ")}</span>
        </div>
      </div>
    `;
  },
});

export const Lesson14 = define({
  tag: "cc-lesson-14",
  component: (
    _,
    {
      html: tpl,
      css: cssFn,
      useStyle: style,
      useState: state,
      useStore: storeHook,
      useScope: scope,
      useMemo: memo,
      useFS,
      unsafeCSS: unsafe,
    }
  ) => {
    const store = storeHook({
      ccNotes: state(SEED_NOTES.map((n) => ({ ...n }))),
      ccTheme: state("light"),
    });
    const [notes, setNotes, notesLoading] = store.ccNotes;
    const [theme, setTheme] = store.ccTheme;
    const list = Array.isArray(notes) ? notes : [];
    const dark = theme === "dark";

    style(lessonStyles);
    style(cssFn`
      :host {
        --cc-bg: ${unsafe(dark ? "#0b1220" : "#ffffff")};
        --cc-fg: ${unsafe(dark ? "#e2e8f0" : "#0f172a")};
        --cc-card: ${unsafe(dark ? "#111827" : "#f8fafc")};
        --cc-border: ${unsafe(dark ? "#1f2937" : "#e2e8f0")};
        --cc-muted: ${unsafe(dark ? "#94a3b8" : "#64748b")};
      }
    `);
    scope({ FinalPane, FinalCard });

    const [selectedId, setSelectedId] = state(null);
    const [query, setQuery] = state("");
    const [files, setFiles] = state([]);
    const [status, setStatus] = state("");
    const fs = useFS({ opfs: true });

    const filtered = memo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return list;
      return list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }, [list, query]);

    const selected = list.find((n) => n.id === selectedId);
    const view = selected ? "edit" : "list";
    const viewId = selected ? list.findIndex((n) => n.id === selectedId) + 1 : 0;

    const addNote = () => {
      const note = createNote({ title: "Untitled", body: "" });
      setNotes([note, ...list]);
      setSelectedId(note.id);
    };

    const onSave = (next) => {
      setNotes(list.map((n) => (n.id === next.id ? { ...next, updatedAt: Date.now() } : n)));
    };

    const onExport = async () => {
      try {
        for (const note of list) {
          await fs.writeFile(`${note.id}.md`, `# ${note.title}\n\n${note.body}\n`, "notes");
        }
        const entries = await fs.listDirectory("notes");
        setFiles(entries.map((e) => e.name));
        setStatus(`Exported ${list.length} notes`);
      } catch (err) {
        setStatus(err?.message || String(err));
      }
    };

    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 14</div>
        <h2>Dim Notes</h2>
        <p>
          The pieces from lessons 1–11 in one app: composition, controlled
          inputs, memoised search, theming, persisted store, view transitions,
          and OPFS export.
        </p>
        <div class="row" style="margin-bottom: 0.75rem">
          <input
            id="search"
            placeholder="Search…"
            .value="${query}"
            @input="${(e) => setQuery(e.target.value)}"
            style="max-width: 16rem"
          />
          <button id="add-note" @click="${addNote}">New note</button>
          <button
            id="theme"
            class="ghost"
            @click="${() => setTheme(dark ? "light" : "dark")}"
          >${dark ? "Light" : "Dark"}</button>
          <span class="badge">${notesLoading ? "Loading…" : `${list.length} notes`}</span>
        </div>
        <cc-final-pane
          transitionId="${viewId}"
          transitionDuration="400"
          .props="${{
            view,
            notes: filtered,
            selected,
            onSelect: setSelectedId,
            onBack: () => setSelectedId(null),
            onSave,
            onExport,
            files,
            status,
            fsReady: fs.isReady,
          }}"
        ></cc-final-pane>
      </div>
    `;
  },
});

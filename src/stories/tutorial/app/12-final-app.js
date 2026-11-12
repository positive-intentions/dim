import {
  define,
  html,
  css,
  useState,
  useStyle,
  useStore,
  useScope,
  useMemo,
  useRef,
  useEffect,
} from "../../../core/index.ts";
import {
  lessonStyles,
  themeStyles,
  SEED_NOTES,
  createNote,
  wordCount,
  applyTheme,
} from "../shared.js";

const FinalCard = define({
  tag: "tut-final-app-card",
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
  tag: "tut-final-app-pane",
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
              <tut-final-app-card
                .props="${{
                  note,
                  selected: selected && note.id === selected.id,
                  onSelect,
                }}"
              ></tut-final-app-card>
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
  tag: "tut-final-app",
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
      useRef: ref,
      useEffect: effect,
    }
  ) => {
    const store = storeHook({
      tutNotes: state(SEED_NOTES.map((n) => ({ ...n }))),
      tutTheme: state("light"),
    });
    const [storedNotes, setStoredNotes, notesLoading] = store.tutNotes;
    const [storedTheme, setStoredTheme] = store.tutTheme;

    // Local mirror so the UI updates immediately. useStore setters persist via
    // a debounced event round-trip; without a local copy, add/select would race.
    const [notes, setNotesLocal] = state(SEED_NOTES.map((n) => ({ ...n })));
    const list = Array.isArray(notes) ? notes : [];
    const setNotes = (next) => {
      setNotesLocal(next);
      setStoredNotes(next);
    };

    // Drive theme UI from local state so the toggle re-renders immediately.
    const [theme, setTheme] = state(
      storedTheme === "dark" ? "dark" : "light"
    );
    const dark = theme === "dark";
    const host = ref();
    applyTheme(host.current, theme);

    // Sync from store after IndexedDB load (and when another tab updates).
    effect(() => {
      if (!notesLoading && Array.isArray(storedNotes)) {
        setNotesLocal(storedNotes);
      }
    }, [storedNotes, notesLoading]);

    effect(() => {
      if (!notesLoading && (storedTheme === "dark" || storedTheme === "light")) {
        if (storedTheme !== theme) setTheme(storedTheme);
      }
    }, [storedTheme, notesLoading]);

    style(themeStyles);
    style(lessonStyles);
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
      setNotes(
        list.map((n) =>
          n.id === next.id ? { ...next, updatedAt: Date.now() } : n
        )
      );
    };

    const toggleTheme = () => {
      const next = dark ? "light" : "dark";
      setTheme(next);
      setStoredTheme(next);
    };

    const onExport = async () => {
      if (!fs?.isReady || typeof fs.writeFile !== "function") {
        setStatus("File system not ready in this environment.");
        return;
      }
      try {
        for (const note of list) {
          await fs.writeFile(
            `${note.id}.md`,
            `# ${note.title}\n\n${note.body}\n`,
            "notes"
          );
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
        <div class="eyebrow">Building an app · Lesson 12</div>
        <h2>Dim Notes</h2>
        <p class="try"><strong>Try:</strong> 1) New note and edit title/body. 2) Search. 3) Dark — theme persists. 4) Open a note for the list ↔ detail slide.</p>
        <div class="row" style="margin-bottom: 0.75rem">
          <input
            id="search"
            placeholder="Search…"
            .value="${query}"
            @input="${(e) => setQuery(e.target.value)}"
            style="max-width: 16rem"
          />
          <button id="add-note" @click="${addNote}">New note</button>
          <button id="theme" class="ghost" @click="${toggleTheme}">
            ${dark ? "Light" : "Dark"}
          </button>
          <span class="badge" id="count">${notesLoading ? "Loading…" : `${list.length} notes`}</span>
        </div>
        <tut-final-app-pane
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
            fsReady: !!fs?.isReady,
          }}"
        ></tut-final-app-pane>
      </div>
    `;
  },
});

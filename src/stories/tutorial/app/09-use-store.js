import { define } from "../../../core/index.ts";
import { lessonStyles, SEED_NOTES, createNote } from "../shared.js";

const NotesBadge = define({
  tag: "tut-use-store-badge",
  component: ({ notes, loading }, { html: tpl, useStyle: style }) => {
    style(lessonStyles);
    const list = Array.isArray(notes) ? notes : [];
    return tpl`
      <span class="badge" id="badge">
        ${list.length} shared notes${loading ? " (loading)" : ""}
      </span>
    `;
  },
});

const NotesPanel = define({
  tag: "tut-use-store-panel",
  component: (
    { notes, loading, draft, onDraft, onAdd },
    { html: tpl, useStyle: style }
  ) => {
    style(lessonStyles);
    const list = Array.isArray(notes) ? notes : [];
    const title = typeof draft === "string" ? draft : "";
    const setDraft = typeof onDraft === "function" ? onDraft : () => {};
    const add = typeof onAdd === "function" ? onAdd : () => {};

    return tpl`
      <div class="stack">
        <div class="row">
          <input
            id="note-title"
            placeholder="New note title"
            .value="${title}"
            @input="${(e) => setDraft(e.target.value)}"
            @keydown="${(e) => {
              if (e.key === "Enter") add();
            }}"
          />
          <button id="add-note" @click="${add}">Add note</button>
          ${loading ? tpl`<span class="muted" id="restoring">Restoring from IndexedDB…</span>` : null}
        </div>
        <div class="list">
          ${list.map(
            (note) => tpl`
              <article class="card" data-id="${note.id}">
                <div class="note-title">${note.title}</div>
                <p class="note-body">${note.body}</p>
              </article>
            `
          )}
        </div>
      </div>
    `;
  },
});

const EncryptedPanel = define({
  tag: "tut-use-store-encrypted",
  component: (
    { notes, loading, draft, onDraft, onAdd },
    { html: tpl, useStyle: style }
  ) => {
    style(lessonStyles);
    const list = Array.isArray(notes) ? notes : [];
    const title = typeof draft === "string" ? draft : "";
    const setDraft = typeof onDraft === "function" ? onDraft : () => {};
    const add = typeof onAdd === "function" ? onAdd : () => {};

    return tpl`
      <div class="stack">
        <p class="muted">
          Encrypted with key <kbd>dim-tutorial</kbd>. Lose the key, lose the data.
        </p>
        <div class="row">
          <input
            id="enc-title"
            placeholder="Secret note title"
            .value="${title}"
            @input="${(e) => setDraft(e.target.value)}"
            @keydown="${(e) => {
              if (e.key === "Enter") add();
            }}"
          />
          <button id="add-enc" @click="${add}">Add encrypted note</button>
        </div>
        ${loading ? tpl`<span class="muted" id="decrypting">Decrypting…</span>` : null}
        <div class="list">
          ${list.map(
            (note) => tpl`
              <article class="card">
                <div class="note-title">${note.title}</div>
              </article>
            `
          )}
        </div>
      </div>
    `;
  },
});

export const Lesson08 = define({
  tag: "tut-use-store",
  component: (
    _,
    {
      html: tpl,
      useStyle: style,
      useScope: scope,
      useState: state,
      useStore: storeHook,
    }
  ) => {
    style(lessonStyles);
    scope({ NotesBadge, NotesPanel, EncryptedPanel });

    // One owner for plaintext + encrypted slices; children stay presentational.
    const store = storeHook({
      tutNotes: state(SEED_NOTES.map((n) => ({ ...n }))),
    });
    const encStore = storeHook(
      { tutNotesEnc: state([]) },
      { encryptionKey: "dim-tutorial" }
    );

    const [notes, setNotes, notesLoading] = store.tutNotes;
    const [encNotes, setEncNotes, encLoading] = encStore.tutNotesEnc;
    const [draft, setDraft] = state("");
    const [encDraft, setEncDraft] = state("");
    const list = Array.isArray(notes) ? notes : [];
    const encList = Array.isArray(encNotes) ? encNotes : [];

    const addNote = () => {
      setNotes([
        createNote({
          title: draft.trim() || `Shared ${list.length + 1}`,
          body: "From the list panel.",
        }),
        ...list,
      ]);
      setDraft("");
    };

    const addEnc = () => {
      setEncNotes([
        createNote({
          title: encDraft.trim() || `Secret ${encList.length + 1}`,
          body: "Ciphertext in IndexedDB.",
        }),
        ...encList,
      ]);
      setEncDraft("");
    };

    return tpl`
      <div class="shell">
        <div class="eyebrow">Building an app · Lesson 9</div>
        <h2>Global and persistent state</h2>
        <p class="try"><strong>Try:</strong> 1) Type a title and Add note — badge and list update. 2) Reload this story — plaintext notes remain. 3) Add an encrypted note on the right.</p>
        <div class="row" style="margin-bottom: 0.75rem">
          <tut-use-store-badge .props="${{ notes: list, loading: notesLoading }}"></tut-use-store-badge>
          <span class="muted">Reload this story — plaintext notes remain.</span>
        </div>
        <div class="split">
          <div>
            <h3>Shared plaintext</h3>
            <tut-use-store-panel .props="${{
              notes: list,
              loading: notesLoading,
              draft,
              onDraft: setDraft,
              onAdd: addNote,
            }}"></tut-use-store-panel>
          </div>
          <div>
            <h3>Encrypted slice</h3>
            <tut-use-store-encrypted .props="${{
              notes: encList,
              loading: encLoading,
              draft: encDraft,
              onDraft: setEncDraft,
              onAdd: addEnc,
            }}"></tut-use-store-encrypted>
          </div>
        </div>
      </div>
    `;
  },
});

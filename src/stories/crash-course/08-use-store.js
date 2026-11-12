import { define, html, css, useState, useStyle, useStore, useScope } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES, createNote } from "./shared.js";

function useStoreRefresh(key, { useState: state, useEffect: effect }) {
  const [, bump] = state(0);
  effect(() => {
    const refresh = () => bump((n) => n + 1);
    window.addEventListener(key, refresh);
    return () => window.removeEventListener(key, refresh);
  }, []);
}

const NotesBadge = define({
  tag: "cc-l08-badge",
  component: (
    _,
    {
      html: tpl,
      css: cssFn,
      useStyle: style,
      useState: state,
      useEffect: effect,
      useStore: storeHook,
    }
  ) => {
    style(lessonStyles);
    useStoreRefresh("ccNotes", { useState: state, useEffect: effect });
    const store = storeHook({
      ccNotes: state(SEED_NOTES.map((n) => ({ ...n }))),
    });
    const [notes, , loading] = store.ccNotes;
    const list = Array.isArray(notes) ? notes : [];
    return tpl`
      <span class="badge" id="badge">
        ${list.length} shared notes${loading ? " (loading)" : ""}
      </span>
    `;
  },
});

const NotesPanel = define({
  tag: "cc-l08-panel",
  component: (
    _,
    {
      html: tpl,
      css: cssFn,
      useStyle: style,
      useState: state,
      useEffect: effect,
      useStore: storeHook,
    }
  ) => {
    style(lessonStyles);
    useStoreRefresh("ccNotes", { useState: state, useEffect: effect });
    const store = storeHook({
      ccNotes: state(SEED_NOTES.map((n) => ({ ...n }))),
    });
    const [notes, setNotes, loading] = store.ccNotes;
    const list = Array.isArray(notes) ? notes : [];

    const add = () => {
      setNotes([
        createNote({ title: `Shared ${list.length + 1}`, body: "From the list panel." }),
        ...list,
      ]);
    };

    return tpl`
      <div class="stack">
        <div class="row">
          <button id="add-note" @click="${add}">Add note</button>
          ${loading ? tpl`<span class="muted">Restoring from IndexedDB…</span>` : null}
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
  tag: "cc-l08-encrypted",
  component: (_, { html: tpl, css: cssFn, useStyle: style, useState: state, useStore: storeHook }) => {
    style(lessonStyles);
    const store = storeHook(
      { ccNotesEnc: state([]) },
      { encryptionKey: "cc-crash-course" }
    );
    const [notes, setNotes, loading] = store.ccNotesEnc;
    const list = Array.isArray(notes) ? notes : [];

    return tpl`
      <div class="stack">
        <p class="muted">
          Encrypted with key <kbd>cc-crash-course</kbd>. Lose the key, lose the data.
        </p>
        <button
          id="add-enc"
          @click="${() =>
            setNotes([
              createNote({ title: `Secret ${list.length + 1}`, body: "Ciphertext in IndexedDB." }),
              ...list,
            ])}"
        >Add encrypted note</button>
        ${loading ? tpl`<span class="muted">Decrypting…</span>` : null}
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
  tag: "cc-lesson-08",
  component: (_, { html: tpl, css: cssFn, useStyle: style, useScope: scope }) => {
    style(lessonStyles);
    scope({ NotesBadge, NotesPanel, EncryptedPanel });
    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 8</div>
        <h2>Global and persistent state</h2>
        <p>
          Each component declares the slice it needs. Same-named keys sync
          across components and reloads (IndexedDB). Entries are
          <kbd>[value, setValue, isLoading, setIsLoading]</kbd>.
          Encryption is opt-in: <kbd>useStore(schema, { encryptionKey })</kbd>.
        </p>
        <div class="row" style="margin-bottom: 0.75rem">
          <cc-l08-badge></cc-l08-badge>
          <span class="muted">Reload this story — plaintext notes remain.</span>
        </div>
        <div class="split">
          <div>
            <h3>Shared plaintext</h3>
            <cc-l08-panel></cc-l08-panel>
          </div>
          <div>
            <h3>Encrypted slice</h3>
            <cc-l08-encrypted></cc-l08-encrypted>
          </div>
        </div>
      </div>
    `;
  },
});

import { define, html, css, useState, useStyle, useStore } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES, createNote } from "./shared.js";

export const Lesson10 = define({
  tag: "cc-lesson-10",
  component: (
    _,
    {
      html: tpl,
      css: cssFn,
      useStyle: style,
      useState: state,
      useStore: storeHook,
      useFS,
    }
  ) => {
    style(lessonStyles);

    const store = storeHook({
      ccNotes: state(SEED_NOTES.map((n) => ({ ...n }))),
    });
    const [notes, setNotes, notesLoading] = store.ccNotes;
    const list = Array.isArray(notes) ? notes : [];

    const fs = useFS({ opfs: true });
    const [files, setFiles] = state([]);
    const [status, setStatus] = state("");
    const [error, setError] = state("");

    const refresh = async () => {
      try {
        const entries = await fs.listDirectory("notes");
        setFiles(entries.map((e) => e.name));
        setError("");
      } catch (err) {
        // Directory may not exist yet.
        setFiles([]);
      }
    };

    const exportNotes = async () => {
      setStatus("Exporting…");
      setError("");
      try {
        for (const note of list) {
          const md = `# ${note.title}\n\n${note.body}\n`;
          await fs.writeFile(`${note.id}.md`, md, "notes");
        }
        await refresh();
        setStatus(`Exported ${list.length} note(s) to OPFS notes/.`);
      } catch (err) {
        setError(err?.message || String(err));
        setStatus("");
      }
    };

    const importFile = async (name) => {
      setStatus("Importing…");
      try {
        const content = await fs.readFile(name, "notes");
        const text = typeof content === "string" ? content : "";
        const [heading, ...rest] = text.split("\n");
        const title = heading.replace(/^#\s*/, "").trim() || name;
        const body = rest.join("\n").trim();
        setNotes([createNote({ title, body, tags: ["imported"] }), ...list]);
        setStatus(`Imported ${name}`);
        setError("");
      } catch (err) {
        setError(err?.message || String(err));
        setStatus("");
      }
    };

    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 10</div>
        <h2>Files with useFS</h2>
        <p>
          File System Access with an Origin Private File System fallback.
          This demo forces <kbd>useFS({ opfs: true })</kbd> so it works inside
          Storybook without a folder picker. Optional
          <kbd>{ encrypt: true, encryptionPassword }</kbd> encrypts file bytes.
        </p>

        <div class="row" style="margin-bottom: 0.75rem">
          <span class="badge">mode: ${fs.fsMode || "…"}</span>
          <span class="badge">${fs.isReady ? "ready" : "init"}</span>
          <button id="export" @click="${exportNotes}" ?disabled="${!fs.isReady || notesLoading}">
            Export notes
          </button>
          <button id="refresh" class="ghost" @click="${refresh}" ?disabled="${!fs.isReady}">
            List files
          </button>
        </div>
        ${status ? tpl`<p class="status" id="status">${status}</p>` : null}
        ${error ? tpl`<p class="status error" id="error">${error}</p>` : null}

        <div class="split">
          <div>
            <h3>In-memory / store</h3>
            <div class="list">
              ${list.map(
                (n) => tpl`
                  <article class="card">
                    <div class="note-title">${n.title}</div>
                  </article>
                `
              )}
            </div>
          </div>
          <div>
            <h3>OPFS notes/</h3>
            ${
              files.length === 0
                ? tpl`<p class="muted">No files yet. Export to create them.</p>`
                : tpl`<div class="list">
                    ${files.map(
                      (name) => tpl`
                        <div class="card row">
                          <span>${name}</span>
                          <button class="ghost" @click="${() => importFile(name)}">Import</button>
                        </div>
                      `
                    )}
                  </div>`
            }
          </div>
        </div>
      </div>
    `;
  },
});

import { define, html, css, useState, useStyle, useStore } from "../../../core/index.ts";
import { lessonStyles, SEED_NOTES, createNote } from "../shared.js";

function hasOpfs() {
  return typeof navigator !== "undefined" && !!navigator.storage?.getDirectory;
}

export const Lesson10 = define({
  tag: "tut-use-fs",
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
      tutNotes: state(SEED_NOTES.map((n) => ({ ...n }))),
    });
    const [notes, setNotes, notesLoading] = store.tutNotes;
    const list = Array.isArray(notes) ? notes : [];

    const opfsAvailable = hasOpfs();
    const fs = useFS({ opfs: true });
    const [files, setFiles] = state([]);
    const [status, setStatus] = state("");
    const [error, setError] = state("");

    const canWrite = opfsAvailable && fs?.isReady && typeof fs.writeFile === "function";

    const refresh = async () => {
      if (!canWrite) {
        setError("OPFS is not available in this environment.");
        return;
      }
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
      if (!canWrite) {
        setError("OPFS is not available in this environment.");
        setStatus("");
        return;
      }
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
      if (!canWrite) {
        setError("OPFS is not available in this environment.");
        return;
      }
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
        <div class="eyebrow">Building an app · Lesson 11</div>
        <h2>Files with useFS</h2>
        <p class="try"><strong>Try:</strong> 1) Click Export notes (needs a browser with OPFS). 2) Click Import on a listed file.</p>

        <div class="row" style="margin-bottom: 0.75rem">
          <span class="badge" id="fs-mode">mode: ${fs.fsMode || "…"}</span>
          <span class="badge" id="fs-ready">${canWrite ? "ready" : opfsAvailable ? "init" : "unavailable"}</span>
          <button id="export" @click="${exportNotes}" ?disabled="${!canWrite || notesLoading}">
            Export notes
          </button>
          <button id="refresh" class="ghost" @click="${refresh}" ?disabled="${!canWrite}">
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

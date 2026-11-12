import { define, html, css, useStyle } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES } from "./shared.js";

/**
 * A static note card — the smallest useful Dim component.
 * `define` registers the custom element and stamps `.tag` on the function.
 */
export const NoteCard = define({
  tag: "cc-l01-note-card",
  component: (
    { title = "Untitled", body = "" },
    { html: tpl, css: cssFn, useStyle: style }
  ) => {
    style(lessonStyles);
    style(cssFn`
      article {
        margin: 0;
      }
    `);
    return tpl`
      <article class="card" data-testid="note-card">
        <h3 class="note-title">${title}</h3>
        <p class="note-body">${body}</p>
      </article>
    `;
  },
});

export const Lesson01 = define({
  tag: "cc-lesson-01",
  component: (_, { html: tpl, css: cssFn, useStyle: style, useScope }) => {
    style(lessonStyles);
    style(cssFn`
      .preview {
        display: grid;
        gap: 0.75rem;
      }
    `);
    useScope({ NoteCard });
    const note = SEED_NOTES[0];
    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 1</div>
        <h2>Your first component</h2>
        <p>
          <kbd>define({ tag, component })</kbd> registers a custom element.
          The function receives <kbd>(props, deps)</kbd> and returns
          <kbd>html</kbd>. Injected deps match the named exports.
        </p>
        <div class="preview">
          <cc-l01-note-card
            title="${note.title}"
            body="${note.body}"
          ></cc-l01-note-card>
          <p class="muted">
            Tag stamped by define: <kbd>${NoteCard.tag}</kbd>
          </p>
        </div>
      </div>
    `;
  },
});

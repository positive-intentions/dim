import { define, html, css, useState, useStyle } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES } from "./shared.js";

export const Lesson03 = define({
  tag: "cc-lesson-03",
  component: (_, { html: tpl, css: cssFn, useStyle: style, useState: state }) => {
    style(lessonStyles);
    style(cssFn`
      .counter {
        font-variant-numeric: tabular-nums;
      }
    `);

    const seed = SEED_NOTES[0];
    const [title, setTitle] = state(seed.title);
    const [body, setBody] = state(seed.body);
    const [saves, setSaves] = state(0);

    const chars = title.length + body.length;

    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 3</div>
        <h2>State with useState</h2>
        <p>
          Controlled inputs use <kbd>.value</kbd> + <kbd>@input</kbd>.
          The renderer keeps focus and caret across re-renders.
          Unchanged values (<kbd>Object.is</kbd>) skip a re-render.
        </p>

        <div class="stack">
          <label>
            <span class="muted">Title</span>
            <input
              id="title"
              .value="${title}"
              @input="${(e) => setTitle(e.target.value)}"
            />
          </label>
          <label>
            <span class="muted">Body</span>
            <textarea
              id="body"
              .value="${body}"
              @input="${(e) => setBody(e.target.value)}"
            ></textarea>
          </label>
          <div class="row">
            <span class="badge counter" id="chars">${chars} characters</span>
            <button
              id="save"
              @click="${() => setSaves((n) => n + 1)}"
            >Save</button>
            <button
              id="reset"
              class="ghost"
              @click="${() => {
                setTitle(seed.title);
                setBody(seed.body);
              }}"
            >Reset</button>
            <span class="muted" id="saves">Saved ${saves} time${saves === 1 ? "" : "s"}</span>
          </div>
          <article class="card">
            <h3 class="note-title">${title || "Untitled"}</h3>
            <p class="note-body">${body}</p>
          </article>
        </div>
      </div>
    `;
  },
});

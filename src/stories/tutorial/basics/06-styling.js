import { define, html, css, useState, useStyle, useRef } from "../../../core/index.ts";
import { lessonStyles, themeStyles, SEED_NOTES, applyTheme } from "../shared.js";

const ThemedCard = define({
  tag: "tut-styling-card",
  component: ({ note, accent }, { html: tpl, css: cssFn, useStyle: style, unsafeCSS: unsafe }) => {
    // Consume tokens only — do not reassign the palette on nested :host.
    style(lessonStyles);
    const color = accent || "#029cfd";
    style(cssFn`
      :host {
        display: block;
      }
      :host([pinned]) .card {
        border-left: 4px solid var(--card-accent, ${unsafe(color)});
      }
      .card {
        --card-accent: ${unsafe(color)};
      }
      .swatch {
        width: 0.7rem;
        height: 0.7rem;
        border-radius: 99px;
        background: var(--card-accent);
        display: inline-block;
      }
    `);
    const data = note || { title: "", body: "", pinned: false };
    return tpl`
      <article class="card ${data.pinned ? "pinned" : ""}">
        <div class="row">
          <span class="swatch"></span>
          <strong>${data.title}</strong>
        </div>
        <p class="note-body">${data.body}</p>
      </article>
    `;
  },
});

export const Lesson07 = define({
  tag: "tut-styling",
  component: (
    _,
    {
      html: tpl,
      css: cssFn,
      useStyle: style,
      useState: state,
      useScope: scope,
      useRef: ref,
    }
  ) => {
    const [theme, setTheme] = state("light");
    const dark = theme === "dark";
    const host = ref();
    applyTheme(host.current, theme);

    // themeStyles (static) on the lesson host only; children inherit vars.
    style(themeStyles);
    style(lessonStyles);
    style(cssFn`
      .theme-bar {
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }
    `);
    scope({ ThemedCard });

    const toggle = () => setTheme(dark ? "light" : "dark");

    return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 6</div>
        <h2>Styling with useStyle</h2>
        <p class="try"><strong>Try:</strong> Click Dark theme — the shell and cards invert. Click again for light. Page CSS does not leak in; tokens travel through CSS variables.</p>

        <div class="row theme-bar">
          <button id="theme" class="ghost" @click="${toggle}">
            ${dark ? "Light theme" : "Dark theme"}
          </button>
          <span class="muted" id="theme-label">Theme: ${theme}</span>
        </div>

        <div class="list">
          ${SEED_NOTES.map(
            (note, i) => tpl`
              <tut-styling-card
                ?pinned="${note.pinned}"
                .props="${{
                  note,
                  accent: i === 0 ? "#029cfd" : i === 1 ? "#7c3aed" : "#15803d",
                }}"
              ></tut-styling-card>
            `
          )}
        </div>
      </div>
    `;
  },
});

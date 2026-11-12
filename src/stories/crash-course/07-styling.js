import { define, html, css, useState, useStyle } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES } from "./shared.js";

const ThemedCard = define({
  tag: "cc-l07-card",
  component: ({ note, accent }, { html: tpl, css: cssFn, useStyle: style, unsafeCSS: unsafe }) => {
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
  tag: "cc-lesson-07",
  component: (
    _,
    {
      html: tpl,
      css: cssFn,
      useStyle: style,
      useState: state,
      useScope: scope,
      unsafeCSS: unsafe,
    }
  ) => {
    const [theme, setTheme] = state("light");
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
      .theme-bar {
        justify-content: space-between;
        margin-bottom: 0.75rem;
      }
    `);
    scope({ ThemedCard });

    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 7</div>
        <h2>Styling with useStyle</h2>
        <p>
          <kbd>useStyle(css\`…\`)</kbd> scopes CSS to the shadow root
          (<kbd>:host</kbd>, <kbd>:host([pinned])</kbd>). Where supported,
          Dim uses <kbd>adoptedStyleSheets</kbd>; otherwise a
          <kbd>&lt;style&gt;</kbd> tag. Theme with CSS variables.
        </p>

        <div class="row theme-bar">
          <button
            id="theme"
            class="ghost"
            @click="${() => setTheme(dark ? "light" : "dark")}"
          >${dark ? "Light theme" : "Dark theme"}</button>
          <span class="muted">Theme: ${theme}</span>
        </div>

        <div class="list">
          ${SEED_NOTES.map(
            (note, i) => tpl`
              <cc-l07-card
                ?pinned="${note.pinned}"
                .props="${{
                  note,
                  accent: i === 0 ? "#029cfd" : i === 1 ? "#7c3aed" : "#15803d",
                }}"
              ></cc-l07-card>
            `
          )}
        </div>
      </div>
    `;
  },
});

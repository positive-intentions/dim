import { define, html, css, useState, useStyle } from "../../core/index.ts";
import { lessonStyles } from "./shared.js";

export const Lesson13 = define({
  tag: "cc-lesson-13",
  component: (_, { html: tpl, css: cssFn, useStyle: style, useState: state }) => {
    style(lessonStyles);
    style(cssFn`
      .wrong { border-color: #fecaca; }
      .right { border-color: #bbf7d0; }
      h3 { font-size: 1rem; }
    `);

    const [wrong, setWrong] = state(["Alpha", "Beta"]);
    const [right, setRight] = state(["Alpha", "Beta"]);
    const [tick, setTick] = state(0);

    const mutate = () => {
      // Mutating in place keeps the same array identity — Object.is bails out.
      wrong.push(`Item ${wrong.length + 1}`);
      setWrong(wrong);
    };

    const copy = () => {
      setRight([...right, `Item ${right.length + 1}`]);
    };

    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 13</div>
        <h2>Pitfalls and rules of hooks</h2>
        <p>
          Hooks occupy numbered slots. Call them in the same order every
          render — never inside conditions or loops. State is immutable:
          <kbd>notes.push</kbd> will not update the UI.
        </p>

        <div class="split">
          <div class="card wrong">
            <h3>Wrong: mutate then set</h3>
            <p class="muted">Rendered items: ${wrong.length} · paint ${tick}</p>
            <div class="row">
              <button id="mutate" class="danger" @click="${mutate}">Push (mutate)</button>
              <button id="force" class="ghost" @click="${() => setTick(tick + 1)}">Force re-render</button>
            </div>
            <div class="list" style="margin-top: 0.5rem">
              ${wrong.map((item) => tpl`<div class="muted">${item}</div>`)}
            </div>
          </div>
          <div class="card right">
            <h3>Right: copy then set</h3>
            <p class="muted">Rendered items: ${right.length}</p>
            <button id="copy" @click="${copy}">Push (copy)</button>
            <div class="list" style="margin-top: 0.5rem">
              ${right.map((item) => tpl`<div class="muted">${item}</div>`)}
            </div>
          </div>
        </div>
      </div>
    `;
  },
});

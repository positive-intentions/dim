import { define, html, css, useState, useMemo, useRef, useStyle } from "../../core/index.ts";
import { lessonStyles } from "./shared.js";

export const Lesson12 = define({
  tag: "cc-lesson-12",
  component: (
    _,
    {
      html: tpl,
      css: cssFn,
      useStyle: style,
      useState: state,
      useMemo: memo,
      useRef: ref,
    }
  ) => {
    style(lessonStyles);
    style(cssFn`
      pre {
        background: var(--cc-card);
        border: 1px solid var(--cc-border);
        border-radius: 8px;
        padding: 0.75rem 1rem;
        overflow: auto;
        font-size: 0.8rem;
      }
    `);

    const [count, setCount] = state(0);
    const doubled = memo(() => count * 2, [count]);
    const renders = ref(0);
    renders.current += 1;
    const host = ref();

    const hookSlots = Object.keys(host.current?.hooks || {}).sort();
    const hookIndex = host.current?.hookIndex ?? 0;

    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 12</div>
        <h2>Under the hood</h2>
        <p>
          Each update: <kbd>requestUpdate</kbd> batches in a microtask,
          <kbd>render()</kbd> resets <kbd>hookIndex</kbd> and runs the
          function, the renderer commits only the changed parts, styles
          flush, then <kbd>updated()</kbd>.
        </p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button id="inc" @click="${() => setCount(count + 1)}">Increment</button>
          <span class="badge">count: ${count}</span>
          <span class="badge">doubled: ${doubled}</span>
        </div>

        <pre id="inspector">renders: ${renders.current}
hookIndex (after this render): ${hookIndex}
hook slots:
${hookSlots.map((k) => `  ${k}`).join("\n") || "  (first paint)"}
host: ${host.current?.tagName || "…"}
        </pre>
      </div>
    `;
  },
});

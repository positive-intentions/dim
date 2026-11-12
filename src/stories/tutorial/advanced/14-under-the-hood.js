import { define, html, css, useState, useMemo, useRef, useStyle } from "../../../core/index.ts";
import { lessonStyles } from "../shared.js";

export const Lesson12 = define({
  tag: "tut-under-the-hood",
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
        background: var(--tut-card, #f8fafc);
        border: 1px solid var(--tut-border, #e2e8f0);
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
        <div class="eyebrow">Advanced · Lesson 14</div>
        <h2>Under the hood</h2>
        <p class="try"><strong>Try:</strong> Click Increment — render count and hook slots update. Dim stores hooks on the host (no virtual DOM).</p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button id="inc" @click="${() => setCount(count + 1)}">Increment</button>
          <span class="badge" id="count">count: ${count}</span>
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

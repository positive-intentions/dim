import { define, html, css, useState, useEffect, useMemo, useStyle } from "../../core/index.ts";
import { lessonStyles, SEED_NOTES, wordCount } from "./shared.js";

const SavedTicker = define({
  tag: "cc-l05-ticker",
  component: ({ savedAt }, { html: tpl, css: cssFn, useStyle: style, useState: state, useEffect: effect }) => {
    style(lessonStyles);
    const [seconds, setSeconds] = state(0);

    effect(() => {
      setSeconds(0);
      const id = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => clearInterval(id);
    }, [savedAt]);

    return tpl`
      <span class="muted" id="ticker">Saved ${seconds}s ago</span>
    `;
  },
});

export const Lesson05 = define({
  tag: "cc-lesson-05",
  component: (
    _,
    {
      html: tpl,
      css: cssFn,
      useStyle: style,
      useState: state,
      useEffect: effect,
      useMemo: memo,
      useScope: scope,
    }
  ) => {
    style(lessonStyles);
    scope({ SavedTicker });

    const [notes] = state(SEED_NOTES.map((n) => ({ ...n })));
    const [query, setQuery] = state("");
    const [savedAt, setSavedAt] = state(Date.now());
    const [showTicker, setShowTicker] = state(true);
    const [mountLogs, setMountLogs] = state(0);

    effect(() => {
      setMountLogs((n) => n + 1);
      return () => {};
    }, []);

    const filtered = memo(() => {
      const q = query.trim().toLowerCase();
      if (!q) return notes;
      return notes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }, [notes, query]);

    const totalWords = memo(
      () => notes.reduce((sum, n) => sum + wordCount(n.body), 0),
      [notes]
    );

    return tpl`
      <div class="shell">
        <div class="eyebrow">Lesson 5</div>
        <h2>Effects, lifecycle, memoisation</h2>
        <p>
          <kbd>useEffect(fn, deps)</kbd> runs after render. Return a cleanup
          for timers and listeners — it also runs on disconnect.
          Dim requires a deps array (unlike React's "no deps" form).
          <kbd>useMemo</kbd> caches derived data such as search results.
        </p>

        <div class="stack">
          <input
            id="search"
            placeholder="Search notes…"
            .value="${query}"
            @input="${(e) => setQuery(e.target.value)}"
          />
          <div class="row">
            <span class="badge" id="matches">${filtered.length} match${filtered.length === 1 ? "" : "es"}</span>
            <span class="badge">${totalWords} words</span>
            <span class="muted" id="mounts">Mounted ${mountLogs} time${mountLogs === 1 ? "" : "s"}</span>
          </div>
          <div class="row">
            <button id="save" @click="${() => setSavedAt(Date.now())}">Mark saved</button>
            <button
              id="toggle-ticker"
              class="ghost"
              @click="${() => setShowTicker(!showTicker)}"
            >${showTicker ? "Unmount ticker" : "Mount ticker"}</button>
            ${showTicker ? tpl`<cc-l05-ticker savedAt="${savedAt}"></cc-l05-ticker>` : tpl`<span class="muted">Ticker unmounted (interval cleared)</span>`}
          </div>
          <div class="list">
            ${filtered.map(
              (note) => tpl`
                <article class="card">
                  <div class="note-title">${note.title}</div>
                  <p class="note-body">${note.body}</p>
                </article>
              `
            )}
          </div>
        </div>
      </div>
    `;
  },
});

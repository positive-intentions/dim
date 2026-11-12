import { define, html, css, useState, useEffect, useMemo, useStyle } from "../../../core/index.ts";
import { lessonStyles, SEED_NOTES, wordCount } from "../shared.js";

const SavedTicker = define({
  tag: "tut-effects-memo-ticker",
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
  tag: "tut-effects-memo",
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
        <div class="eyebrow">Building an app · Lesson 7</div>
        <h2>Effects, lifecycle, memoisation</h2>
        <p class="try"><strong>Try:</strong> 1) Search “hooks” — the match count drops to 1. 2) Unmount ticker — the interval is cleared (no more ticking).</p>

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
              @click="${() => setShowTicker((v) => !v)}"
            >${showTicker ? "Unmount ticker" : "Mount ticker"}</button>
            ${
              showTicker
                ? tpl`<tut-effects-memo-ticker savedAt="${savedAt}"></tut-effects-memo-ticker>`
                : tpl`<span class="muted" id="ticker-gone">Ticker unmounted (interval cleared)</span>`
            }
          </div>
          <div class="list" id="results">
            ${filtered.map(
              (note) => tpl`
                <article class="card" data-id="${note.id}">
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

import React, { useEffect, useRef } from "react";
import { define, html, css, useState, useStyle, useStore } from "../../core/index.ts";
import { useDimStore } from "../../core/index.ts";
import { lessonStyles } from "./shared.js";

const INTEROP_KEY = "ccReactNote";
const INTEROP_PASSWORD = "cc-crash-course";

/**
 * Dim side of the encrypted store. Listens on the same key/password as
 * React's useDimStore — both dispatch encrypted CustomEvents on `ccReactNote`.
 */
export const DimNote = define({
  tag: "cc-l11-dim-note",
  component: (_, { html: tpl, css: cssFn, useStyle: style, useState: state, useStore: storeHook }) => {
    style(lessonStyles);
    const store = storeHook(
      { [INTEROP_KEY]: state("Hello from Dim") },
      { encryptionKey: INTEROP_PASSWORD }
    );
    const [text, setText, loading] = store[INTEROP_KEY];
    const value = typeof text === "string" ? text : String(text ?? "");

    return tpl`
      <div class="card">
        <div class="eyebrow">Dim component</div>
        <p class="muted">${loading ? "Loading encrypted store…" : "useStore + encryptionKey"}</p>
        <textarea
          id="dim-note"
          .value="${value}"
          @input="${(e) => setText(e.target.value)}"
        ></textarea>
      </div>
    `;
  },
});

export const DimEcho = define({
  tag: "cc-l11-echo",
  component: ({ label }, { html: tpl, css: cssFn, useStyle: style }) => {
    style(lessonStyles);
    return tpl`
      <div class="card">
        <div class="eyebrow">.props from React</div>
        <p id="echo-label">${label || "(no label yet — set via element.props)"}</p>
      </div>
    `;
  },
});

/**
 * React story render: a textarea bound to useDimStore next to a Dim element
 * on the same encrypted key, plus a ref that assigns `.props`.
 */
export function CrashCourseReactInterop() {
  const [value, setValue, isLoading] = useDimStore({
    key: INTEROP_KEY,
    password: INTEROP_PASSWORD,
    defaultValue: "Hello from React",
  });
  const echoRef = useRef(null);

  useEffect(() => {
    if (echoRef.current) {
      echoRef.current.props = {
        label: `React says: ${value || ""}`,
      };
    }
  }, [value]);

  return React.createElement(
    "div",
    {
      style: {
        fontFamily: "system-ui, sans-serif",
        maxWidth: 920,
        margin: "0 auto",
        padding: 20,
        border: "1px solid #e2e8f0",
        borderRadius: 12,
      },
    },
    React.createElement("div", { style: { color: "#029cfd", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em" } }, "LESSON 11"),
    React.createElement("h2", { style: { marginTop: 4 } }, "React interop"),
    React.createElement(
      "p",
      { style: { color: "#64748b" } },
      "React cannot pass objects through HTML attributes (they stringify). Set ",
      React.createElement("code", null, "element.props"),
      " through a ref. ",
      React.createElement("code", null, "useDimStore"),
      " is the React hook into Dim's encrypted IndexedDB store."
    ),
    React.createElement(
      "div",
      {
        style: {
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 16,
        },
      },
      React.createElement(
        "div",
        null,
        React.createElement("div", { style: { fontSize: 12, fontWeight: 700, color: "#029cfd" } }, "React"),
        isLoading
          ? React.createElement("p", null, "Loading…")
          : React.createElement("textarea", {
              id: "react-note",
              value: value || "",
              onChange: (e) => setValue(e.target.value),
              style: { width: "100%", minHeight: 120, font: "inherit", padding: 8 },
            })
      ),
      React.createElement(DimNote.tag)
    ),
    React.createElement(DimEcho.tag, { ref: echoRef })
  );
}

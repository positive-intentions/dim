import { define } from "../../../core/index.ts";
import { lessonStyles } from "../shared.js";

/**
 * A custom element with no framework: a class, a tag name with a hyphen,
 * a shadow root, and an observed attribute.
 */
class TutHelloVanilla extends HTMLElement {
  static get observedAttributes() {
    return ["name"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._render();
  }

  attributeChangedCallback() {
    this._render();
  }

  _render() {
    const name = this.getAttribute("name") || "world";
    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        .card {
          background: var(--tut-card, #f8fafc);
          border: 1px solid var(--tut-border, #e2e8f0);
          border-radius: 10px;
          padding: 0.9rem 1rem;
        }
        .label { font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; color: var(--tut-accent, #029cfd); font-weight: 700; }
        p { margin: 0.35rem 0 0; }
      </style>
      <div class="card">
        <div class="label">Vanilla HTMLElement</div>
        <p id="hello">Hello, ${name}.</p>
      </div>
    `;
  }
}

if (!customElements.get("tut-hello-vanilla")) {
  customElements.define("tut-hello-vanilla", TutHelloVanilla);
}

const HelloDim = define({
  tag: "tut-hello-dim",
  component: ({ name = "world" }, { html: tpl, useStyle: style }) => {
    style(lessonStyles);
    return tpl`
      <article class="card">
        <div class="eyebrow">Dim define()</div>
        <p id="hello">Hello, ${name}.</p>
      </article>
    `;
  },
});

export const Lesson01 = define({
  tag: "tut-web-components",
  component: (
    _,
    { html: tpl, css: cssFn, useStyle: style, useState: state, useScope: scope }
  ) => {
    style(lessonStyles);
    style(cssFn`
      .compare { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      @media (max-width: 700px) { .compare { grid-template-columns: 1fr; } }
      .tip {
        margin-top: 1rem;
        font-size: 0.85rem;
      }
    `);
    scope({ HelloDim });

    const [name, setName] = state("Ada");

    return tpl`
      <div class="shell">
        <div class="eyebrow">Basics · Lesson 1</div>
        <h2>What is a web component?</h2>
        <p class="try"><strong>Try:</strong> Click Greet — both cards update. In DevTools, inspect either tag: each has a #shadow-root of its own.</p>

        <div class="row" style="margin-bottom: 0.75rem">
          <button
            id="greet"
            @click="${() => setName(name === "Ada" ? "Linus" : "Ada")}"
          >Greet ${name === "Ada" ? "Linus" : "Ada"}</button>
          <span class="muted">Attribute <kbd>name="${name}"</kbd> is a string on the element.</span>
        </div>

        <div class="compare">
          <tut-hello-vanilla id="vanilla" name="${name}"></tut-hello-vanilla>
          <tut-hello-dim .props="${{ name }}"></tut-hello-dim>
        </div>

        <p class="muted tip">
          Custom element tag names must contain a hyphen (<kbd>tut-hello-vanilla</kbd>).
          The Shadow DOM keeps each card’s CSS off the rest of the page.
          Dim’s <kbd>define()</kbd> is the same idea — class, tag, shadow root — with less boilerplate.
        </p>
      </div>
    `;
  },
});

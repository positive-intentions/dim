import { define, html, render, useState, useEffect } from "../core/dim.ts";
import * as renderer from "../core/renderer/index.js";
import * as shim from "./renderer";

const nextFrame = () => new Promise((r) => setTimeout(r, 0));

describe("WASM runtime", () => {
  test("core imports resolve to the WASM-backed shims", () => {
    expect(renderer.html).toBe(shim.html);
    expect(html).toBe(shim.html);
  });

  test("switching a part between array, text and array stays consistent", () => {
    const container = document.createElement("div");
    const view = (v) => renderer.html`<ul>${v}</ul>`;
    const items = (n) =>
      Array.from({ length: n }, (_, i) => renderer.html`<li>${i}</li>`);

    renderer.render(view(items(3)), container);
    expect(container.querySelectorAll("li")).toHaveLength(3);
    renderer.render(view("empty"), container);
    expect(container.querySelectorAll("li")).toHaveLength(0);
    expect(container.textContent).toBe("empty");
    renderer.render(view(items(2)), container);
    expect(container.querySelectorAll("li")).toHaveLength(2);
    renderer.render(view(items(4)), container);
    expect(container.querySelectorAll("li")).toHaveLength(4);
  });

  test("useEffect without a dependency array runs on every render", async () => {
    let runs = 0;
    let bump;
    define({
      tag: "wasm-effect-every-render",
      component: () => {
        const [n, setN] = useState(0);
        bump = () => setN(n + 1);
        useEffect(() => {
          runs++;
        });
        return html`<p>${n}</p>`;
      },
    });
    const el = document.createElement("wasm-effect-every-render");
    document.body.appendChild(el);
    await el.updateComplete;
    bump();
    await el.updateComplete;
    await nextFrame();
    expect(runs).toBe(2);
    el.remove();
  });

  test("public entry matches JS (no render export); shim render commits", () => {
    expect(render).toBeUndefined();
    const container = document.createElement("div");
    shim.render(html`<b>${"x"}</b>`, container);
    expect(container.innerHTML).toBe("<b>x</b>");
  });
});

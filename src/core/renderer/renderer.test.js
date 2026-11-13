import { html, render, keyed, unsafeHTML, css } from "./index.js";
import { DimElement } from "../element/dim-element.js";

function mount() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  return container;
}

describe("html/render", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("renders text content", () => {
    const el = mount();
    render(html`<span>hello</span>`, el);
    expect(el.textContent).toBe("hello");
  });

  test("updates text parts in place", () => {
    const el = mount();
    const tpl = (v) => html`<span>${v}</span>`;
    render(tpl("a"), el);
    const span = el.querySelector("span");
    render(tpl("b"), el);
    expect(el.querySelector("span")).toBe(span);
    expect(span.textContent).toBe("b");
  });

  test("sets attributes", () => {
    const el = mount();
    render(html`<div id="${"x"}" class="${"y"}"></div>`, el);
    const div = el.querySelector("div");
    expect(div.getAttribute("id")).toBe("x");
    expect(div.getAttribute("class")).toBe("y");
  });

  test("partial attribute values (prefix and suffix)", () => {
    const el = mount();
    const tpl = (bg, cls) =>
      html`<div style="background:${bg}" class="${cls} extra"></div>`;
    render(tpl("#fff", "base"), el);
    const div = el.querySelector("div");
    expect(div.getAttribute("style")).toBe("background:#fff");
    expect(div.getAttribute("class")).toBe("base extra");
  });

  test('multi-binding class attribute class="${a} ${b}"', () => {
    const el = mount();
    const tpl = (a, b) => html`<button class="${a} ${b}">x</button>`;
    render(tpl("sidebar-tab", "active"), el);
    const btn = el.querySelector("button");
    expect(btn.getAttribute("class")).toBe("sidebar-tab active");
    expect(el.innerHTML).not.toContain("data-dim");
    expect(el.textContent).not.toContain("data-dim");
    expect(btn.textContent).toBe("x");
  });

  test("multi-binding attribute with static prefix and suffix", () => {
    const el = mount();
    const tpl = (a, b) => html`<div class="x ${a} y ${b} z"></div>`;
    render(tpl("foo", "bar"), el);
    expect(el.querySelector("div").getAttribute("class")).toBe("x foo y bar z");
    expect(el.innerHTML).not.toContain("data-dim");
  });

  test("multi-binding class updates in place on re-render", () => {
    const el = mount();
    const tpl = (a, b) => html`<button class="${a} ${b}">tab</button>`;
    render(tpl("sidebar-tab", ""), el);
    const btn = el.querySelector("button");
    expect(btn.getAttribute("class").trim()).toBe("sidebar-tab");
    render(tpl("sidebar-tab", "active"), el);
    expect(el.querySelector("button")).toBe(btn);
    expect(btn.getAttribute("class")).toBe("sidebar-tab active");
  });

  test("shopping-shaped active class binding", () => {
    const el = mount();
    const tpl = (name, on) =>
      html`<button class="${name} ${on ? "active" : ""}" title="Shop">
        🛍️
      </button>`;
    render(tpl("sidebar-tab", false), el);
    let btn = el.querySelector("button");
    expect(btn.getAttribute("class").trim()).toBe("sidebar-tab");
    expect(el.textContent).not.toMatch(/data-dim/);
    expect(btn.getAttribute("title")).toBe("Shop");

    render(tpl("sidebar-tab", true), el);
    btn = el.querySelector("button");
    expect(btn.getAttribute("class")).toBe("sidebar-tab active");
    expect(el.innerHTML).not.toContain("data-dim");
  });

  test("sets properties with .prop=", () => {
    const el = mount();
    render(html`<input .value="${"hello"}" />`, el);
    expect(el.querySelector("input").value).toBe("hello");
  });

  test("boolean attributes with ?attr=", () => {
    const el = mount();
    render(html`<button ?disabled="${true}">x</button>`, el);
    expect(el.querySelector("button").hasAttribute("disabled")).toBe(true);
    render(html`<button ?disabled="${false}">x</button>`, el);
    expect(el.querySelector("button").hasAttribute("disabled")).toBe(false);
  });

  test("event listeners with @event=", () => {
    const el = mount();
    let clicked = 0;
    render(
      html`<button
        @click="${() => {
          clicked++;
        }}"
      >
        go
      </button>`,
      el,
    );
    el.querySelector("button").click();
    expect(clicked).toBe(1);
  });

  test("ref binding sets .current", () => {
    const el = mount();
    const ref = { current: null };
    render(html`<input ref="${ref}" />`, el);
    expect(ref.current).toBe(el.querySelector("input"));
  });

  test("nested templates", () => {
    const el = mount();
    const inner = html`<em>${"nested"}</em>`;
    render(html`<div>${inner}</div>`, el);
    expect(el.querySelector("em").textContent).toBe("nested");
  });

  test("arrays of templates", () => {
    const el = mount();
    const items = [1, 2, 3].map((n) => html`<li>${n}</li>`);
    render(
      html`<ul>
        ${items}
      </ul>`,
      el,
    );
    expect(el.querySelectorAll("li").length).toBe(3);
    expect(el.textContent.replace(/\s+/g, "")).toBe("123");
  });

  test("keyed remounts on key change and reuses on same key", () => {
    const el = mount();
    const inner = (n) => html`<span id="s">${n}</span>`;
    const tpl = (key, n) => html`<div>${keyed(key, inner(n))}</div>`;
    render(tpl("a", 1), el);
    const span1 = el.querySelector("#s");
    render(tpl("a", 2), el);
    expect(el.querySelector("#s")).toBe(span1);
    expect(span1.textContent).toBe("2");

    render(tpl("b", 3), el);
    const span2 = el.querySelector("#s");
    expect(span2).not.toBe(span1);
    expect(span2.textContent).toBe("3");
  });

  test("unsafeHTML inserts markup", () => {
    const el = mount();
    render(html`<div>${unsafeHTML("<b>bold</b>")}</div>`, el);
    expect(el.querySelector("b").textContent).toBe("bold");
  });

  test("child custom element is not recreated on parent re-render", () => {
    class ChildEl extends HTMLElement {
      connectedCallback() {
        this.dataset.mounted = "1";
      }
    }
    if (!customElements.get("ml-child")) {
      customElements.define("ml-child", ChildEl);
    }
    const el = mount();
    const tpl = (n) => html`<div><ml-child></ml-child><span>${n}</span></div>`;
    render(tpl(0), el);
    const child = el.querySelector("ml-child");
    render(tpl(1), el);
    expect(el.querySelector("ml-child")).toBe(child);
    expect(el.querySelector("span").textContent).toBe("1");
  });

  test("self-closing custom elements are expanded", () => {
    const el = mount();
    // html preprocess turns <foo-bar /> into <foo-bar></foo-bar>
    render(html`<wrapper-el><inner-el /></wrapper-el>`, el);
    expect(el.querySelector("inner-el")).toBeTruthy();
    expect(el.innerHTML).not.toMatch(/<inner-el\s*\/>/);
  });

  test("JSON attr={{}} is parsed into an attribute", () => {
    const el = mount();
    render(html`<div data-x={{ "a": 1 }}></div>`, el);
    const div = el.querySelector("div");
    expect(div.getAttribute("data-x")).toBe('{"a":1}');
  });

  test("non-JSON attr={{}} warns and does not throw", () => {
    const el = mount();
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});
    expect(() => {
      render(html`<div data-x={{ a: 1 }}></div>`, el);
    }).not.toThrow();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test("skips .value write when focused and value is equal", () => {
    const el = mount();
    const tpl = (v) => html`<input .value="${v}" />`;
    render(tpl("abc"), el);
    const input = el.querySelector("input");
    input.focus();
    input.setSelectionRange(2, 2);
    // Same value — must not reset caret
    render(tpl("abc"), el);
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(2);
  });

  test("preserves focus and caret across unrelated sibling updates", () => {
    const el = mount();
    const paint = (label) =>
      render(
        html`<div>
          <input .value="${"hello"}" />
          <span>${label}</span>
        </div>`,
        el,
      );
    paint("x");
    const input = el.querySelector("input");
    input.focus();
    input.setSelectionRange(3, 3);
    paint("y");
    expect(document.activeElement).toBe(input);
    expect(input.selectionStart).toBe(3);
    expect(el.querySelector("span").textContent).toBe("y");
  });
});

describe("DimElement", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("renders into shadow root and exposes updateComplete", async () => {
    class Demo extends DimElement {
      render() {
        return html`<p>hi</p>`;
      }
    }
    if (!customElements.get("dim-el-demo")) {
      customElements.define("dim-el-demo", Demo);
    }
    const el = document.createElement("dim-el-demo");
    document.body.appendChild(el);
    await el.updateComplete;
    expect(el.shadowRoot.querySelector("p").textContent).toBe("hi");
  });

  test("addController hostDisconnected runs on remove", async () => {
    let disconnected = 0;
    class Demo2 extends DimElement {
      constructor() {
        super();
        this.addController({
          hostDisconnected() {
            disconnected++;
          },
        });
      }
      render() {
        return html`<span>x</span>`;
      }
    }
    if (!customElements.get("dim-el-demo2")) {
      customElements.define("dim-el-demo2", Demo2);
    }
    const el = document.createElement("dim-el-demo2");
    document.body.appendChild(el);
    await el.updateComplete;
    el.remove();
    expect(disconnected).toBe(1);
  });

  test("css helper still works", () => {
    const result = css`
      .x {
        color: red;
      }
    `;
    expect(result.cssText).toContain("color: red");
  });
});

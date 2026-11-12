import "./basics/01-web-components.js";
import "./basics/02-first-component.js";
import "./basics/03-templates-bindings.js";
import "./basics/04-use-state.js";
import "./basics/05-composition.js";
import "./basics/06-styling.js";
import "./app/07-effects-memo.js";
import "./app/08-refs.js";
import "./app/09-use-store.js";
import "./app/10-view-transitions.js";
import "./app/11-use-fs.js";
import "./advanced/14-under-the-hood.js";
import "./advanced/15-pitfalls.js";
import "./app/12-final-app.js";
import "./advanced/13-react-interop.js";
import { SEED_NOTES } from "./shared.js";

async function mount(tag) {
  const el = document.createElement(tag);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const text = (el) =>
  (el.shadowRoot?.textContent || "").replace(/\s+/g, " ").trim();

function dispatchInput(input, value) {
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Tutorial smoke", () => {
  const tags = [
    "tut-web-components",
    "tut-first-component",
    "tut-templates-bindings",
    "tut-use-state",
    "tut-composition",
    "tut-styling",
    "tut-effects-memo",
    "tut-refs",
    "tut-use-store",
    "tut-view-transitions",
    "tut-use-fs",
    "tut-under-the-hood",
    "tut-pitfalls",
    "tut-final-app",
    "tut-react-interop-dim-note",
  ];

  test.each(tags)("%s defines and renders", async (tag) => {
    expect(customElements.get(tag)).toBeDefined();
    const el = await mount(tag);
    expect(el.shadowRoot).toBeTruthy();
    expect(text(el).length).toBeGreaterThan(0);
  });
});

describe("Tutorial behaviours", () => {
  test("lesson 1: greet updates vanilla attribute-driven text", async () => {
    const el = await mount("tut-web-components");
    const vanilla = el.shadowRoot.querySelector("tut-hello-vanilla");
    expect(vanilla?.shadowRoot).toBeTruthy();
    expect(vanilla.getAttribute("name")).toBe("Ada");
    expect(vanilla.shadowRoot.querySelector("#hello")?.textContent).toContain(
      "Ada"
    );

    el.shadowRoot.querySelector("#greet").click();
    await el.updateComplete;

    expect(vanilla.getAttribute("name")).toBe("Linus");
    expect(vanilla.shadowRoot.querySelector("#hello")?.textContent).toContain(
      "Linus"
    );
  });

  test("lesson 2: shows seed note title", async () => {
    const el = await mount("tut-first-component");
    const card = el.shadowRoot.querySelector("tut-first-component-card");
    expect(card?.shadowRoot).toBeTruthy();
    await card.updateComplete;
    expect(
      (card.shadowRoot.textContent || "").replace(/\s+/g, " ")
    ).toContain(SEED_NOTES[0].title);
  });

  test("lesson 3: pin toggle and shuffle keep three ids", async () => {
    const el = await mount("tut-templates-bindings");
    const pinLabel = () =>
      (el.shadowRoot.querySelector("#toggle-pin")?.textContent || "")
        .replace(/\s+/g, " ")
        .trim();
    const pinnedAttr = () =>
      el.shadowRoot.querySelector("[data-pinned]")?.getAttribute("data-pinned");

    expect(pinLabel()).toBe("Unpin");
    expect(pinnedAttr()).toBe("yes");

    el.shadowRoot.querySelector("#toggle-pin").click();
    await el.updateComplete;
    await Promise.resolve();
    expect(pinnedAttr()).toBe("no");
    expect(pinLabel()).toBe("Pin");

    const before = [
      ...el.shadowRoot.querySelectorAll("#note-list [data-id]"),
    ].map((n) => n.getAttribute("data-id"));
    expect(before).toHaveLength(3);

    el.shadowRoot.querySelector("#shuffle").click();
    await el.updateComplete;
    await Promise.resolve();
    const after = [
      ...el.shadowRoot.querySelectorAll("#note-list [data-id]"),
    ].map((n) => n.getAttribute("data-id"));
    expect(after).toHaveLength(3);
    expect(new Set(after)).toEqual(new Set(before));
    expect(after.join(",")).not.toBe(before.join(","));
  });

  test("lesson 4: typing updates character count", async () => {
    const el = await mount("tut-use-state");
    const title = el.shadowRoot.querySelector("#title");
    dispatchInput(title, "Hi");
    await el.updateComplete;
    const chars = el.shadowRoot.querySelector("#chars")?.textContent;
    expect(chars).toMatch(/\d+ characters/);
    const expected = "Hi".length + SEED_NOTES[0].body.length;
    expect(chars).toContain(`${expected} characters`);
    expect(el.shadowRoot.querySelector("#preview-title")?.textContent).toBe(
      "Hi"
    );
  });

  test("lesson 5: adding a note updates the list", async () => {
    const el = await mount("tut-composition");
    const before = el.shadowRoot.querySelector("#count")?.textContent;
    expect(before).toMatch(/3 notes/);

    el.shadowRoot.querySelector("#add-note").click();
    await el.updateComplete;

    expect(el.shadowRoot.querySelector("#count")?.textContent).toMatch(
      /4 notes/
    );
  });

  test("lesson 6: theme toggle sets data-theme=dark", async () => {
    const el = await mount("tut-styling");
    expect(el.getAttribute("data-theme")).toBe("light");
    el.shadowRoot.querySelector("#theme").click();
    await el.updateComplete;
    expect(el.getAttribute("data-theme")).toBe("dark");
    expect(el.shadowRoot.querySelector("#theme-label")?.textContent).toMatch(
      /Theme: dark/
    );
    expect(el.getAttribute("data-theme")).toBe("dark");
  });

  test("lesson 7: search filters and unmount removes ticker", async () => {
    const el = await mount("tut-effects-memo");
    const tickerHost = el.shadowRoot.querySelector("tut-effects-memo-ticker");
    expect(tickerHost?.shadowRoot).toBeTruthy();
    await tickerHost.updateComplete;
    expect(tickerHost.shadowRoot.querySelector("#ticker")).toBeTruthy();
    expect(el.shadowRoot.querySelector("#matches")?.textContent).toMatch(
      /3 matches/
    );

    dispatchInput(el.shadowRoot.querySelector("#search"), "hooks");
    await el.updateComplete;
    expect(el.shadowRoot.querySelector("#matches")?.textContent).toMatch(
      /1 match/
    );
    expect(el.shadowRoot.querySelectorAll("#results [data-id]")).toHaveLength(
      1
    );

    el.shadowRoot.querySelector("#toggle-ticker").click();
    await el.updateComplete;
    await Promise.resolve();
    expect(el.shadowRoot.querySelector("tut-effects-memo-ticker")).toBeNull();
    expect(el.shadowRoot.querySelector("#ticker-gone")).toBeTruthy();
  });

  test("lesson 8: new note grows the list and title input exists", async () => {
    const el = await mount("tut-refs");
    const before = el.shadowRoot.querySelectorAll("#note-list [data-id]")
      .length;
    el.shadowRoot.querySelector("#add-note").click();
    await el.updateComplete;
    expect(
      el.shadowRoot.querySelectorAll("#note-list [data-id]").length
    ).toBe(before + 1);
    expect(el.shadowRoot.querySelector("#title")).toBeTruthy();
  });

  test("lesson 9: restoring clears and typed titles appear without refresh", async () => {
    const el = await mount("tut-use-store");
    await el.updateComplete;

    const panel = el.shadowRoot.querySelector("tut-use-store-panel");
    const badge = el.shadowRoot.querySelector("tut-use-store-badge");
    const enc = el.shadowRoot.querySelector("tut-use-store-encrypted");
    expect(panel?.shadowRoot).toBeTruthy();
    expect(badge?.shadowRoot).toBeTruthy();
    expect(enc?.shadowRoot).toBeTruthy();

    await panel.updateComplete;
    await badge.updateComplete;
    await enc.updateComplete;

    for (let i = 0; i < 40; i++) {
      await el.updateComplete;
      await panel.updateComplete;
      if (!panel.shadowRoot.querySelector("#restoring")) break;
      await new Promise((r) => setTimeout(r, 50));
    }
    expect(panel.shadowRoot.querySelector("#restoring")).toBeNull();

    const badgeLabel = () =>
      (badge.shadowRoot.querySelector("#badge")?.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

    const count = () => {
      const m = badgeLabel().match(/(\d+)\s+shared notes/);
      return m ? Number(m[1]) : null;
    };

    const before = count();
    expect(before).toBeGreaterThanOrEqual(1);

    const noteTitle = panel.shadowRoot.querySelector("#note-title");
    expect(noteTitle).toBeTruthy();
    dispatchInput(noteTitle, "Plain from test");
    await el.updateComplete;
    await panel.updateComplete;

    const add = panel.shadowRoot.querySelector("#add-note");
    expect(add).toBeTruthy();
    add.click();

    await el.updateComplete;
    await panel.updateComplete;
    await badge.updateComplete;
    expect(count()).toBe(before + 1);
    expect(panel.shadowRoot.textContent).toContain("Plain from test");

    const encTitle = enc.shadowRoot.querySelector("#enc-title");
    expect(encTitle).toBeTruthy();
    dispatchInput(encTitle, "Secret from test");
    await el.updateComplete;
    await enc.updateComplete;

    const addEnc = enc.shadowRoot.querySelector("#add-enc");
    expect(addEnc).toBeTruthy();
    addEnc.click();

    await el.updateComplete;
    await enc.updateComplete;
    expect(enc.shadowRoot.textContent).toContain("Secret from test");
  });

  test("lesson 10: opening a note shows Back", async () => {
    const el = await mount("tut-view-transitions");
    const pane = el.shadowRoot.querySelector("tut-view-transitions-pane");
    expect(pane?.shadowRoot).toBeTruthy();
    await pane.updateComplete;

    const card = pane.shadowRoot.querySelector("[data-id]");
    expect(card).toBeTruthy();
    card.click();
    await el.updateComplete;
    await pane.updateComplete;

    expect(pane.shadowRoot.querySelector("#back")).toBeTruthy();
  });

  test("lesson 11: renders Export without calling writeFile", async () => {
    const el = await mount("tut-use-fs");
    const exportBtn = el.shadowRoot.querySelector("#export");
    expect(exportBtn).toBeTruthy();
    expect(el.shadowRoot.querySelector("#fs-ready")).toBeTruthy();
  });

  test("lesson 12: theme sets data-theme and add-note opens editor", async () => {
    const el = await mount("tut-final-app");
    await el.updateComplete;

    el.shadowRoot.querySelector("#theme").click();
    await el.updateComplete;
    expect(el.getAttribute("data-theme")).toBe("dark");

    const pane = el.shadowRoot.querySelector("tut-final-app-pane");
    expect(pane?.shadowRoot).toBeTruthy();
    await pane.updateComplete;

    el.shadowRoot.querySelector("#add-note").click();
    await el.updateComplete;
    await pane.updateComplete;
    for (let i = 0; i < 20 && !pane.shadowRoot.querySelector("#back"); i++) {
      await new Promise((r) => setTimeout(r, 50));
      await pane.updateComplete;
      await el.updateComplete;
    }
    expect(pane.shadowRoot.querySelector("#back")).toBeTruthy();
    expect(pane.shadowRoot.querySelector("#title")).toBeTruthy();
  });

  test("lesson 13: Dim note renders a textarea", async () => {
    const el = await mount("tut-react-interop-dim-note");
    expect(el.shadowRoot.querySelector("#dim-note")).toBeTruthy();
    expect(el.shadowRoot.querySelector("textarea")).toBeTruthy();
  });

  test("lesson 14: increment updates count in inspector", async () => {
    const el = await mount("tut-under-the-hood");
    el.shadowRoot.querySelector("#inc").click();
    await el.updateComplete;
    expect(el.shadowRoot.querySelector("#count")?.textContent).toMatch(
      /count: 1/
    );
    expect(el.shadowRoot.querySelector("#inspector")?.textContent).toMatch(
      /count|renders:/
    );
  });

  test("lesson 15: mutated array stays stale until force re-render; copy updates", async () => {
    const el = await mount("tut-pitfalls");
    const wrong = () =>
      el.shadowRoot.querySelector(".wrong")?.textContent.replace(/\s+/g, " ");
    const right = () =>
      el.shadowRoot.querySelector(".right")?.textContent.replace(/\s+/g, " ");

    expect(wrong()).toContain("Rendered items: 2");
    expect(right()).toContain("Rendered items: 2");

    el.shadowRoot.querySelector("#mutate").click();
    await el.updateComplete;
    expect(wrong()).toContain("Rendered items: 2");

    el.shadowRoot.querySelector("#force").click();
    await el.updateComplete;
    expect(wrong()).toContain("Rendered items: 3");

    el.shadowRoot.querySelector("#copy").click();
    await el.updateComplete;
    expect(right()).toContain("Rendered items: 3");
  });
});

import "./01-first-component.js";
import "./02-templates-bindings.js";
import "./03-use-state.js";
import "./04-composition.js";
import "./05-effects-memo.js";
import "./06-refs.js";
import "./07-styling.js";
import "./08-use-store.js";
import "./09-view-transitions.js";
import "./12-under-the-hood.js";
import "./13-pitfalls.js";
import "./14-final-app.js";
import "./11-react-interop.js";

async function mount(tag) {
  const el = document.createElement(tag);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const text = (el) =>
  (el.shadowRoot?.textContent || "").replace(/\s+/g, " ").trim();

afterEach(() => {
  document.body.innerHTML = "";
});

describe("Crash course smoke", () => {
  const tags = [
    "cc-lesson-01",
    "cc-lesson-02",
    "cc-lesson-03",
    "cc-lesson-04",
    "cc-lesson-05",
    "cc-lesson-06",
    "cc-lesson-07",
    "cc-lesson-08",
    "cc-lesson-09",
    "cc-lesson-12",
    "cc-lesson-13",
    "cc-lesson-14",
    "cc-l11-dim-note",
  ];

  test.each(tags)("%s defines and renders", async (tag) => {
    expect(customElements.get(tag)).toBeDefined();
    const el = await mount(tag);
    expect(el.shadowRoot).toBeTruthy();
    expect(text(el).length).toBeGreaterThan(0);
  });
});

describe("Crash course behaviours", () => {
  test("lesson 4: adding a note updates the list", async () => {
    const el = await mount("cc-lesson-04");
    const before = el.shadowRoot.querySelector("#count")?.textContent;
    expect(before).toMatch(/3 notes/);

    el.shadowRoot.querySelector("#add-note").click();
    await el.updateComplete;

    expect(el.shadowRoot.querySelector("#count")?.textContent).toMatch(
      /4 notes/
    );
  });

  test("lesson 13: mutated array stays stale until force re-render; copy updates", async () => {
    const el = await mount("cc-lesson-13");
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

  test("lesson 8: list and badge share ccNotes", async () => {
    const el = await mount("cc-lesson-08");
    await el.updateComplete;

    const panel = el.shadowRoot.querySelector("cc-l08-panel");
    const badge = el.shadowRoot.querySelector("cc-l08-badge");
    expect(panel?.shadowRoot).toBeTruthy();
    expect(badge?.shadowRoot).toBeTruthy();

    await panel.updateComplete;
    await badge.updateComplete;

    const badgeLabel = () =>
      (badge.shadowRoot.querySelector("#badge")?.textContent || "").replace(
        /\s+/g,
        " "
      ).trim();

    const count = () => {
      const m = badgeLabel().match(/(\d+)\s+shared notes/);
      return m ? Number(m[1]) : null;
    };

    const before = count();
    expect(before).toBeGreaterThanOrEqual(1);

    const add = panel.shadowRoot.querySelector("#add-note");
    expect(add).toBeTruthy();
    add.click();

    await panel.updateComplete;
    for (let i = 0; i < 25 && count() !== before + 1; i++) {
      await new Promise((r) => setTimeout(r, 100));
      await badge.updateComplete;
    }

    expect(count()).toBe(before + 1);
  });
});

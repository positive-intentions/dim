// Setup polyfills for the test environment
import { TextDecoder, TextEncoder } from "util";
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const crypto = require("crypto");

// Define global crypto object
Object.defineProperty(globalThis, "crypto", {
  value: {
    getRandomValues: (arr) => crypto.randomBytes(arr.length),
    subtle: {
      digest: async (algorithm, data) => {
        const nodeAlgorithm = algorithm === "SHA-256" ? "sha256" : "sha1";
        const hash = crypto.createHash(nodeAlgorithm);
        hash.update(data);
        return new Uint8Array(hash.digest());
      },
    },
  },
});

// Mock LitElement
class MockLitElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.updateComplete = Promise.resolve();
    this.attributes = [];
  }

  requestUpdate() {
    this.updateComplete = Promise.resolve();
    // Simulate re-render
    if (this.render) {
      this.render();
    }
  }

  addController(controller) {
    this.controller = controller;
  }

  getAttribute(name) {
    const attr = this.attributes.find((a) => a.name === name);
    return attr ? attr.value : null;
  }
}

global.HTMLElement = MockLitElement;

// Mock customElements
global.customElements = {
  registry: new Map(),
  define: jest.fn((tag, component) => {
    global.customElements.registry.set(tag, component);
  }),
  get: jest.fn((tag) => global.customElements.registry.get(tag)),
};

// Mock window
global.window = {
  customElements: global.customElements,
};

// Mock mini-lit
jest.mock("../mini-lit.js", () => ({
  html: (strings, ...values) => ({
    strings,
    values,
    _$litType$: 1,
    toString: () => {
      let result = strings[0];
      for (let i = 0; i < values.length; i++) {
        result += values[i] + strings[i + 1];
      }
      return result;
    },
  }),
  css: (strings, ...values) => ({
    strings,
    values,
    cssText: strings.join(""),
  }),
  unsafeCSS: (styles) => ({
    cssText: typeof styles === "string" ? styles : styles.cssText,
  }),
}));

// Mock lit
jest.mock("lit", () => ({
  LitElement: MockLitElement,
}));

// Import components after mocks
import { define } from "../component/define.js";
import { DimComponent } from "../component/DimComponent.js";
import { html } from "../mini-lit.js";

describe("Component Tests", () => {
  beforeEach(() => {
    global.customElements.registry.clear();
    jest.clearAllMocks();
  });

  describe("Component Definition", () => {
    test("should define a custom element", () => {
      const TestComponent = (props, deps) => {
        return deps.html`<div>Test</div>`;
      };

      define({ tag: "test-element", component: TestComponent });

      expect(global.customElements.define).toHaveBeenCalledWith(
        "test-element",
        expect.any(Function),
      );
      expect(global.customElements.registry.has("test-element")).toBe(true);
    });

    test("should create component with correct functional component", () => {
      const TestComponent = (props, deps) => {
        return deps.html`<div>${props.message}</div>`;
      };

      define({ tag: "test-comp", component: TestComponent });

      const ComponentClass = global.customElements.registry.get("test-comp");
      expect(ComponentClass.functionalComponent).toBe(TestComponent);
    });
  });

  describe("Component Rendering", () => {
    test("should render with props", () => {
      let renderCount = 0;
      const TestComponent = ({ message }, { html }) => {
        renderCount++;
        return html`<div>Message: ${message}</div>`;
      };

      define({ tag: "prop-test", component: TestComponent });
      const ComponentClass = global.customElements.registry.get("prop-test");
      const element = new ComponentClass();
      element.props = { message: "Hello World" };

      // Trigger render
      element.render();

      expect(renderCount).toBe(1);
    });

    test("should merge attributes and props", () => {
      let receivedProps = null;
      const TestComponent = (props, deps) => {
        receivedProps = props;
        return deps.html`<div>Test</div>`;
      };

      define({ tag: "merge-test", component: TestComponent });
      const ComponentClass = global.customElements.registry.get("merge-test");
      const element = new ComponentClass();

      // Set attributes
      element.attributes = [
        { name: "title", value: "Test Title" },
        { name: "id", value: "test-id" },
      ];

      // Set props
      element.props = { message: "Hello", count: 5 };

      // Trigger render
      element.render();

      expect(receivedProps).toEqual({
        title: "Test Title",
        id: "test-id",
        message: "Hello",
        count: 5,
        children: "",
      });
    });

    test("should provide all dependencies to component", () => {
      let receivedDeps = null;
      const TestComponent = (props, deps) => {
        receivedDeps = deps;
        return deps.html`<div>Test</div>`;
      };

      define({ tag: "deps-test", component: TestComponent });
      const ComponentClass = global.customElements.registry.get("deps-test");
      const element = new ComponentClass();

      element.render();

      expect(receivedDeps).toHaveProperty("useState");
      expect(receivedDeps).toHaveProperty("useEffect");
      expect(receivedDeps).toHaveProperty("useMemo");
      expect(receivedDeps).toHaveProperty("useRef");
      expect(receivedDeps).toHaveProperty("useScope");
      expect(receivedDeps).toHaveProperty("useStyle");
      expect(receivedDeps).toHaveProperty("useStore");
      expect(receivedDeps).toHaveProperty("html");
      expect(receivedDeps).toHaveProperty("css");
      expect(receivedDeps).toHaveProperty("querySelector");
      expect(receivedDeps).toHaveProperty("getRef");
    });
  });

  describe("Component State and Re-rendering", () => {
    test("should re-render when state changes", () => {
      let renderCount = 0;
      let setCountFn = null;

      const TestComponent = (props, { useState, html }) => {
        renderCount++;
        const [count, setCount] = useState(0);
        setCountFn = setCount;
        return html`<div>Count: ${count}</div>`;
      };

      define({ tag: "state-test", component: TestComponent });
      const ComponentClass = global.customElements.registry.get("state-test");
      const element = new ComponentClass();

      // Mock requestUpdate to trigger render
      element.requestUpdate = jest.fn(() => {
        element.render();
      });

      // Initial render
      element.render();
      expect(renderCount).toBe(1);

      // Update state
      if (setCountFn) {
        setCountFn(5);
        expect(element.requestUpdate).toHaveBeenCalled();
        expect(renderCount).toBe(2);
      }
    });

    test("should maintain hook state across renders", () => {
      let stateValues = [];

      const TestComponent = (props, { useState, html }) => {
        const [count, setCount] = useState(10);
        const [name, setName] = useState("test");
        stateValues.push({ count, name });
        return html`<div>${count} ${name}</div>`;
      };

      define({ tag: "hook-state-test", component: TestComponent });
      const ComponentClass =
        global.customElements.registry.get("hook-state-test");
      const element = new ComponentClass();

      // First render
      element.render();
      expect(stateValues[0]).toEqual({ count: 10, name: "test" });

      // Second render should maintain state
      element.render();
      expect(stateValues[1]).toEqual({ count: 10, name: "test" });
    });
  });

  describe("Nested Components", () => {
    test("should support nested component definitions", () => {
      const ChildComponent = ({ message }, { html }) => {
        return html`<span>${message}</span>`;
      };

      const ParentComponent = (props, { useScope, html }) => {
        useScope({
          "child-comp": ChildComponent,
        });

        return html`
          <div>
            <child-comp .props="${{ message: "Hello Child" }}"></child-comp>
          </div>
        `;
      };

      define({ tag: "parent-comp", component: ParentComponent });
      const ComponentClass = global.customElements.registry.get("parent-comp");
      const element = new ComponentClass();

      element.render();

      // Check that child component was registered
      expect(global.customElements.define).toHaveBeenCalledWith(
        "child-comp",
        expect.any(Function),
      );
    });

    test("should pass props to nested components", () => {
      let childProps = null;

      const ChildComponent = (props, { html }) => {
        childProps = props;
        return html`<span>Child</span>`;
      };

      const ParentComponent = (
        { parentProp },
        { useScope, useState, html },
      ) => {
        const [parentState] = useState("parent state");

        useScope({
          "nested-child": ChildComponent,
        });

        return html`
          <div>
            <nested-child
              .props="${{
                fromParent: parentProp,
                parentState,
              }}"
            ></nested-child>
          </div>
        `;
      };

      define({ tag: "nested-parent", component: ParentComponent });
      const ComponentClass =
        global.customElements.registry.get("nested-parent");
      const element = new ComponentClass();
      element.props = { parentProp: "test prop" };

      element.render();

      // Create and render child
      const ChildClass = global.customElements.registry.get("nested-child");
      if (ChildClass) {
        const childElement = new ChildClass();
        childElement.props = {
          fromParent: "test prop",
          parentState: "parent state",
        };
        childElement.render();

        expect(childProps).toEqual({
          fromParent: "test prop",
          parentState: "parent state",
          children: "",
        });
      }
    });
  });

  describe("Component Lifecycle", () => {
    test("should reset hook index on each render", () => {
      let hookIndices = [];

      const TestComponent = (props, { useState, html }) => {
        // This accesses the component instance directly (not ideal but for testing)
        const component = global.currentInstance;
        if (component) {
          hookIndices.push(component.hookIndex);
        }

        const [state1] = useState(1);
        const [state2] = useState(2);
        const [state3] = useState(3);

        return html`<div>${state1} ${state2} ${state3}</div>`;
      };

      define({ tag: "lifecycle-test", component: TestComponent });
      const ComponentClass =
        global.customElements.registry.get("lifecycle-test");
      const element = new ComponentClass();

      // Set global instance for testing
      global.currentInstance = element;

      // First render
      element.render();

      // Second render
      element.render();

      // Hook index should reset to 0 at the start of each render
      expect(element.hookIndex).toBe(3); // After 3 useState calls
    });
  });
});

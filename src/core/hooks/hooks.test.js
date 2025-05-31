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
  }

  requestUpdate() {
    this.updateComplete = Promise.resolve();
  }

  addController(controller) {
    this.controller = controller;
  }
}

global.HTMLElement = MockLitElement;

// Mock mini-lit
jest.mock("../mini-lit.js", () => ({
  html: (strings, ...values) => ({
    strings,
    values,
    _$litType$: 1,
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

// Import hooks after mocks are set up
import { useState } from "../hooks/useState.js";
import { useEffect } from "../hooks/useEffect.js";
import { useMemo } from "../hooks/useMemo.js";
import { useRef } from "../hooks/useRef.js";
import { useScope } from "../hooks/useScope.js";
import { useStyle } from "../hooks/useStyle.js";
import { useStore } from "../hooks/useStore.js";
import { setCurrentInstance } from "../utils/instance.js";

describe("Hook Tests", () => {
  let mockComponent;

  beforeEach(() => {
    // Create a mock component instance
    mockComponent = {
      hookIndex: 0,
      hooks: {},
      requestUpdate: jest.fn(),
      addController: jest.fn(),
      shadowRoot: {
        appendChild: jest.fn(),
        querySelector: jest.fn(),
      },
    };

    // Set the current instance for hooks to use
    setCurrentInstance(mockComponent);
  });

  afterEach(() => {
    // Clear the current instance
    setCurrentInstance(null);
  });

  describe("useState", () => {
    test("should initialize with initial state", () => {
      const [state, setState] = useState("initial");
      expect(state).toBe("initial");
      expect(typeof setState).toBe("function");
    });

    test("should update state with new value", () => {
      const [state, setState] = useState(0);
      setState(5);
      expect(mockComponent.hooks["hook-0"]).toBe(5);
      expect(mockComponent.requestUpdate).toHaveBeenCalled();
    });

    test("should update state with function", () => {
      useState(10);
      const [, setState] = useState(10);
      setState((prev) => prev + 5);
      expect(mockComponent.hooks["hook-1"]).toBe(15);
    });

    test("should maintain separate states for multiple calls", () => {
      const [state1] = useState("first");
      const [state2] = useState("second");
      expect(state1).toBe("first");
      expect(state2).toBe("second");
    });

    describe("falsy value handling", () => {
      test("should handle false as initial state", () => {
        const [state, setState] = useState(false);
        expect(state).toBe(false);
        
        setState(true);
        expect(mockComponent.hooks["hook-0"]).toBe(true);
        
        // Reset for next render
        mockComponent.hookIndex = 0;
        const [newState] = useState(false);
        expect(newState).toBe(true); // Should maintain the updated state
      });

      test("should handle 0 as initial state", () => {
        const [state, setState] = useState(0);
        expect(state).toBe(0);
        
        setState(1);
        expect(mockComponent.hooks["hook-0"]).toBe(1);
        
        // Reset for next render
        mockComponent.hookIndex = 0;
        const [newState] = useState(0);
        expect(newState).toBe(1); // Should maintain the updated state
      });

      test("should handle null as initial state", () => {
        const [state, setState] = useState(null);
        expect(state).toBe(null);
        
        setState("not null");
        expect(mockComponent.hooks["hook-0"]).toBe("not null");
        
        // Reset for next render
        mockComponent.hookIndex = 0;
        const [newState] = useState(null);
        expect(newState).toBe("not null"); // Should maintain the updated state
      });

      test("should handle undefined as initial state", () => {
        const [state, setState] = useState(undefined);
        expect(state).toBe(undefined);
        
        setState("defined");
        expect(mockComponent.hooks["hook-0"]).toBe("defined");
        
        // Reset for next render
        mockComponent.hookIndex = 0;
        const [newState] = useState(undefined);
        expect(newState).toBe("defined"); // Should maintain the updated state
      });

      test("should handle empty string as initial state", () => {
        const [state, setState] = useState("");
        expect(state).toBe("");
        
        setState("not empty");
        expect(mockComponent.hooks["hook-0"]).toBe("not empty");
        
        // Reset for next render
        mockComponent.hookIndex = 0;
        const [newState] = useState("");
        expect(newState).toBe("not empty"); // Should maintain the updated state
      });

      test("should toggle boolean state correctly", () => {
        const [state, setState] = useState(true);
        expect(state).toBe(true);
        
        // Toggle to false
        setState(false);
        expect(mockComponent.hooks["hook-0"]).toBe(false);
        
        // Reset for next render
        mockComponent.hookIndex = 0;
        const [newState1, setNewState1] = useState(true);
        expect(newState1).toBe(false); // Should maintain false state
        
        // Toggle back to true
        setNewState1(true);
        expect(mockComponent.hooks["hook-0"]).toBe(true);
        
        // Reset for next render
        mockComponent.hookIndex = 0;
        const [newState2] = useState(true);
        expect(newState2).toBe(true); // Should maintain true state
      });

      test("should handle state updates from falsy to truthy values", () => {
        const [state, setState] = useState(false);
        
        setState(0);
        expect(mockComponent.hooks["hook-0"]).toBe(0);
        
        setState(null);
        expect(mockComponent.hooks["hook-0"]).toBe(null);
        
        setState(undefined);
        expect(mockComponent.hooks["hook-0"]).toBe(undefined);
        
        setState("");
        expect(mockComponent.hooks["hook-0"]).toBe("");
        
        setState("truthy");
        expect(mockComponent.hooks["hook-0"]).toBe("truthy");
      });
    });

    test("should persist state across multiple renders", () => {
      // First render
      const [state1, setState1] = useState("initial");
      expect(state1).toBe("initial");
      
      // Update state
      setState1("updated");
      expect(mockComponent.requestUpdate).toHaveBeenCalledTimes(1);
      
      // Second render
      mockComponent.hookIndex = 0;
      const [state2] = useState("initial");
      expect(state2).toBe("updated");
      
      // Third render without state change
      mockComponent.hookIndex = 0;
      const [state3] = useState("initial");
      expect(state3).toBe("updated");
    });
  });

  describe("useEffect", () => {
    test("should execute effect on first render", () => {
      const effect = jest.fn();
      useEffect(effect, []);
      expect(effect).toHaveBeenCalled();
    });

    test("should not execute effect if dependencies unchanged", () => {
      const effect = jest.fn();
      useEffect(effect, ["dep1", "dep2"]);

      // Reset for next render
      mockComponent.hookIndex = 0;
      effect.mockClear();

      useEffect(effect, ["dep1", "dep2"]);
      expect(effect).not.toHaveBeenCalled();
    });

    test("should execute effect if dependencies change", () => {
      const effect = jest.fn();
      useEffect(effect, ["dep1"]);

      // Reset for next render
      mockComponent.hookIndex = 0;
      effect.mockClear();

      useEffect(effect, ["dep2"]);
      expect(effect).toHaveBeenCalled();
    });

    test("should call cleanup function when dependencies change", () => {
      const cleanup = jest.fn();
      const effect = jest.fn(() => cleanup);

      useEffect(effect, ["dep1"]);
      expect(effect).toHaveBeenCalled();

      // Reset for next render
      mockComponent.hookIndex = 0;

      useEffect(effect, ["dep2"]);
      expect(cleanup).toHaveBeenCalled();
    });

    test("should register disconnect handler", () => {
      const effect = jest.fn();
      useEffect(effect, []);
      expect(mockComponent.addController).toHaveBeenCalled();
    });
  });

  describe("useMemo", () => {
    test("should calculate value on first call", () => {
      const calculation = jest.fn(() => "calculated");
      const result = useMemo(calculation, []);
      expect(calculation).toHaveBeenCalled();
      expect(result).toBe("calculated");
    });

    test("should not recalculate if dependencies unchanged", () => {
      const calculation = jest.fn(() => "calculated");
      useMemo(calculation, ["dep1"]);

      // Reset for next render
      mockComponent.hookIndex = 0;
      calculation.mockClear();

      const result = useMemo(calculation, ["dep1"]);
      expect(calculation).not.toHaveBeenCalled();
      expect(result).toBe("calculated");
    });

    test("should recalculate if dependencies change", () => {
      const calculation = jest.fn(() => "calculated");
      useMemo(calculation, ["dep1"]);

      // Reset for next render
      mockComponent.hookIndex = 0;
      calculation.mockClear();
      calculation.mockReturnValue("recalculated");

      const result = useMemo(calculation, ["dep2"]);
      expect(calculation).toHaveBeenCalled();
      expect(result).toBe("recalculated");
    });
  });

  describe("useRef", () => {
    test("should create ref with current property", () => {
      const ref = useRef();
      expect(ref).toHaveProperty("current");
      expect(ref.current).toBe(mockComponent);
    });

    test("should persist ref across renders", () => {
      const ref1 = useRef();

      // Reset for next render
      mockComponent.hookIndex = 0;

      const ref2 = useRef();
      expect(ref1).toBe(ref2);
    });
  });

  describe("useScope", () => {
    beforeEach(() => {
      global.customElements = {
        get: jest.fn(),
        define: jest.fn(),
      };
    });

    test("should register components", () => {
      const TestComponent = () => {};
      useScope({
        "test-component": TestComponent,
      });

      expect(global.customElements.define).toHaveBeenCalledWith(
        "test-component",
        expect.any(Function),
      );
    });

    test("should not re-register existing components", () => {
      global.customElements.get.mockReturnValue(true);

      const TestComponent = () => {};
      useScope({
        "existing-component": TestComponent,
      });

      expect(global.customElements.define).not.toHaveBeenCalled();
    });
  });

  describe("useStyle", () => {
    test("should apply styles to shadow root", () => {
      const styles = { cssText: ".test { color: red; }" };
      useStyle(styles);

      expect(mockComponent.shadowRoot.appendChild).toHaveBeenCalledWith(
        expect.objectContaining({
          textContent: ".test { color: red; }",
        }),
      );
    });

    test("should only apply styles once", () => {
      const styles = { cssText: ".test { color: red; }" };
      useStyle(styles);
      useStyle(styles);

      expect(mockComponent.shadowRoot.appendChild).toHaveBeenCalledTimes(1);
    });
  });

  describe("useStore", () => {
    test("should initialize store with useState values", () => {
      const store = {
        count: useState(0),
        name: useState("test"),
      };

      const result = useStore(store);
      expect(result).toBe(store);
    });

    test("should setup effect for storage management", () => {
      const effectFn = jest.fn();
      jest
        .spyOn(require("../hooks/useEffect.js"), "useEffect")
        .mockImplementation(effectFn);

      const store = {
        data: useState({}),
      };

      useStore(store);
      expect(effectFn).toHaveBeenCalled();
    });
  });
});

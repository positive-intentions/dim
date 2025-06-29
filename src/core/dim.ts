import { LitElement, html as litHtml } from "../vendor/lit/index.js";
import { unsafeHTML } from "../vendor/lit/directives/unsafe-html.js";
import AsyncronousStateManager from "./async-manager";
import { css, unsafeCSS } from "./mini-lit";
import StorageManager from "./storage-manager";
import CryptoManager from "./crypto-manager";
import {
  useViewTransition,
  viewTransitionStyles,
  setCurrentInstance as setViewTransitionInstance,
} from "./view-transitions.js";

// Enhanced html function that supports React-like syntax
export const html = (strings, ...values) => {
  // If this is a proper template literal, strings will have a 'raw' property
  if (!strings || !strings.raw) {
    // If called as a function instead of template literal, create proper structure
    if (typeof strings === "string") {
      const templateStrings = [strings];
      templateStrings.raw = [strings];
      return litHtml(templateStrings, ...values);
    }
    return litHtml(strings, ...values);
  }

  // Process templates to support object attributes like todo={{ ... }}
  const processedTemplate = processReactLikeSyntax(strings, values);

  // Ensure the processed strings array has the raw property
  if (processedTemplate.strings && !processedTemplate.strings.raw) {
    processedTemplate.strings.raw = [...processedTemplate.strings];
  }

  return litHtml(processedTemplate.strings, ...processedTemplate.values);
};

function processReactLikeSyntax(strings, values) {
  // Join template to analyze, preserving the original structure
  let fullTemplate = strings[0];
  for (let i = 0; i < values.length; i++) {
    fullTemplate += `__VALUE_${i}__` + strings[i + 1];
  }

  // Look for object attribute patterns like todo={{ ... }}
  const objectAttrRegex = /(\w+)=\{\{([^}]+)\}\}/g;
  let hasReplacements = false;

  // Check if we have any object attributes to process
  if (!objectAttrRegex.test(fullTemplate)) {
    // No processing needed, return original
    return { strings, values };
  }

  // Reset regex
  objectAttrRegex.lastIndex = 0;
  let match;
  let replacements = [];

  while ((match = objectAttrRegex.exec(fullTemplate)) !== null) {
    const [fullMatch, attrName, attrValue] = match;

    // Try to parse the object literal
    try {
      const objValue = new Function("return {" + attrValue + "}")();
      const jsonString = JSON.stringify(objValue);

      // Replace with JSON string
      replacements.push({
        from: fullMatch,
        to: `${attrName}='${jsonString}'`,
      });
      hasReplacements = true;
    } catch (e) {
      console.warn("Failed to parse object attribute:", attrValue);
    }
  }

  if (!hasReplacements) {
    return { strings, values };
  }

  // Apply replacements
  let processedTemplate = fullTemplate;
  replacements.forEach((replacement) => {
    processedTemplate = processedTemplate.replace(
      replacement.from,
      replacement.to
    );
  });

  // Split back into strings and values arrays
  const parts = processedTemplate.split(/__VALUE_(\d+)__/);
  const newStrings = [];
  const newValues = [];

  // Rebuild strings array
  newStrings.push(parts[0]);
  for (let i = 1; i < parts.length; i += 2) {
    const valueIndex = parseInt(parts[i]);
    if (valueIndex < values.length) {
      newValues.push(values[valueIndex]);
    }
    newStrings.push(parts[i + 1] || "");
  }

  // Ensure we have the right number of strings (should be values.length + 1)
  while (newStrings.length < newValues.length + 1) {
    newStrings.push("");
  }

  // Add raw property to maintain template literal structure
  newStrings.raw = [...newStrings];

  return {
    strings: newStrings,
    values: newValues,
  };
}

// Helper to render children content
export const renderChildren = (children) => {
  if (!children) return litHtml``;

  // If children is a string (innerHTML), check if it contains custom elements
  if (typeof children === "string") {
    // If the string contains custom elements (with hyphens), use slot rendering
    // This allows the custom elements to be properly processed by lit-html
    if (
      children.includes("-") &&
      children.includes("<") &&
      children.includes(">")
    ) {
      return litHtml`<slot></slot>`;
    }
    // For simple text content, use unsafeHTML
    return litHtml`${unsafeHTML(children)}`;
  }

  // If children is an array of elements, render them
  if (Array.isArray(children)) {
    return litHtml`<slot></slot>`;
  }

  // Default slot for any other content
  return litHtml`<slot></slot>`;
};

let currentInstance = null;

function setCurrentInstance(instance) {
  currentInstance = instance;
  // Also set for view transitions
  setViewTransitionInstance(instance);
}

function getCurrentInstance() {
  if (!currentInstance) {
    console.error("Hooks should only be called inside a component.");
  }
  return currentInstance;
}

export function define({ tag, component: CustomFunctionalComponent }) {
  class DimComponent extends LitElement {
    static get properties() {
      return {
        props: { type: Object },
      };
    }
    constructor() {
      super();
      this.hookIndex = 0;
      this.hooks = {};
      this._childNodes = [];
      this._slotContent = null;
      this._childNodesCaptured = false;
    }

    connectedCallback() {
      super.connectedCallback();
      // Capture child nodes before they're moved to shadow DOM
      if (!this._childNodesCaptured) {
        this._childNodes = Array.from(this.childNodes);
        this._slotContent = this.innerHTML;
        this._childNodesCaptured = true;
      }
    }

    render() {
      // Reset hook index on every render
      this.hookIndex = 0;

      // Set the current instance context
      setCurrentInstance(this);

      // Get all attributes as props, including parsing object attributes
      const attributes = Array.from(this.attributes).reduce((acc, attr) => {
        let value = attr.value;

        // Try to parse JSON-like object attributes
        if (value && (value.startsWith("{") || value.startsWith("["))) {
          try {
            value = JSON.parse(value);
          } catch (e) {
            // If parsing fails, keep original string value
          }
        }

        acc[attr.name] = value;
        return acc;
      }, {});

      this.props = this.props || {};

      // Auto-detect transitionId prop and set up view transitions
      let autoTransition = null;
      if (
        attributes.transitionId !== undefined ||
        this.props.transitionId !== undefined
      ) {
        const transitionId = attributes.transitionId || this.props.transitionId;
        autoTransition = useViewTransition(transitionId.toString(), {
          duration: parseInt(attributes.transitionDuration) || 500,
          autoDirection: attributes.transitionAutoDirection !== "false",
        });
      }

      const querySelector = this.shadowRoot?.querySelector.bind(
        this.shadowRoot
      );
      const getRef = (ref) => {
        const component = querySelector(ref);
        const refHookName =
          Object.keys(component.hooks).find(
            (o) => !!component.hooks[o].current
          ) || "";
        return component.hooks[refHookName].current;
      };

      // Create a useFS function that uses the current component context
      const useFS = (options = {}) => {
        return _useFS(options, { useState, useEffect, useStore });
      };

      const sharedDependencies = {
        useState,
        useEffect,
        useMemo,
        useScope,
        useStyle,
        useStore,
        useFS,
        useViewTransition,
        html: litHtml,
        css,
        unsafeCSS,
        useRef,
        querySelector,
        getRef,
        renderChildren,
      };

      // Process children to make them available
      const children = this._slotContent || "";
      const childElements = this._childNodes.filter(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && node.textContent.trim())
      );

      // Call the functional component
      const result = CustomFunctionalComponent(
        {
          ...attributes,
          ...this.props,
          children,
          childElements,
        },
        sharedDependencies
      );

      // Clear the current instance context
      setCurrentInstance(null);

      // Auto-wrap result with view transitions if transitionId is present
      if (autoTransition) {
        const transitionClasses = autoTransition.getTransitionClasses(
          "view-transition-item"
        );
        const transitionStyles = autoTransition.getTransitionStyles();
        const styleString = Object.entries(transitionStyles)
          .map(([key, value]) => `${key}: ${value}`)
          .join("; ");

        return litHtml`
          <style>
            ${viewTransitionStyles}
            .auto-transition-wrapper {
              position: relative;
              overflow: hidden;
              width: 100%;
              height: 100%;
            }
          </style>
          <div class="auto-transition-wrapper view-transition-container">
            <div class="${transitionClasses}" style="${styleString}">
              ${result}
            </div>
          </div>
        `;
      }

      return result;
    }
  }

  window.customElements.define(tag, DimComponent);
}

export function useState(initialState) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  if (!component.hooks[hookName]) {
    component.hooks[hookName] = initialState;
  }

  const setState = (newState) => {
    const value =
      typeof newState === "function"
        ? newState(component.hooks[hookName])
        : newState;
    component.hooks[hookName] = value;
    component.requestUpdate();
  };

  return [component.hooks[hookName], setState];
}

export function useEffect(effect, dependencies) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  const prevDeps = component.hooks[hookName]?.dependencies;
  const hasChanged =
    !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    if (component.hooks[hookName]?.cleanup) {
      component.hooks[hookName].cleanup();
    }
    const cleanup = effect();
    component.hooks[hookName] = { dependencies, cleanup };
  }

  // // Add event listener to handle unmount
  // component.addEventListener("disconnectedCallback", () => {
  //   if (component.hooks[hookName]?.cleanup) {
  //     component.hooks[hookName].cleanup();
  //   }
  // });

  component.addController({
    hostDisconnected() {
      if (component.hooks[hookName]?.cleanup) {
        component.hooks[hookName].cleanup();
      }
    },
  });
}

export function useMemo(calculation, dependencies) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  const prevDeps = component.hooks[hookName]?.dependencies;
  const hasChanged =
    !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    component.hooks[hookName] = {
      value: calculation(),
      dependencies,
    };
  }

  return component.hooks[hookName].value;
}

export function useScope(elements) {
  Object.keys(elements).forEach((key) => {
    const elementClass = elements[key];

    // Define the custom element with a unique tag per component instance
    if (!customElements.get(key)) {
      define({ tag: key, component: elementClass });
    }
  });
}

export function useStyle(styles: any) {
  const component = getCurrentInstance() as any;
  const hookIndex = component.hookIndex++;
  const hookName = `style-hook-${hookIndex}`;

  // Convert styles to CSSResult if it's a string
  const cssResult = typeof styles === "string" ? unsafeCSS(styles) : styles;
  const cssText = cssResult.cssText;

  // Check if styles have changed
  const prevStyles = component.hooks[hookName];
  if (prevStyles !== cssText) {
    component.hooks[hookName] = cssText;

    // Create or update style element
    let styleElement = component.shadowRoot.querySelector(
      `[data-style-hook="${hookName}"]`
    );

    if (!styleElement) {
      // Use adoptedStyleSheets when available for static styles
      if (
        component.shadowRoot.adoptedStyleSheets !== undefined &&
        cssResult.styleSheet &&
        !prevStyles
      ) {
        component.shadowRoot.adoptedStyleSheets = [
          ...component.shadowRoot.adoptedStyleSheets,
          cssResult.styleSheet,
        ];
      } else {
        // Use style element for dynamic styles or fallback
        styleElement = document.createElement("style");
        styleElement.setAttribute("data-style-hook", hookName);
        component.shadowRoot.appendChild(styleElement);
      }
    }

    // Update style content if using style element
    if (styleElement) {
      styleElement.textContent = cssText;
    }
  }
}

export const useLazyScope = (tag: string, promise: Promise<any>) => {
  promise.then((module: any) => {
    const elementClass = new Function(`return ${module}`)();

    if (!customElements.get(tag)) {
      define({ tag, component: elementClass });
    }
  });
};

export function useRef() {
  const component = getCurrentInstance() as any;
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  if (!component.hooks[hookName]) {
    component.hooks[hookName] = { current: component };
  }

  return component.hooks[hookName];
}

// Hardcoded password for testing
const HARDCODED_PASSWORD = "test-password-123";

// Create a default crypto manager with hardcoded password
const defaultCryptoManager = new CryptoManager(HARDCODED_PASSWORD);
const asyncronousStateManager = new AsyncronousStateManager(
  defaultCryptoManager
);
const storageManager = new StorageManager(defaultCryptoManager);

// Map to store different crypto managers for different passwords
const cryptoManagerMap = new Map();
cryptoManagerMap.set(HARDCODED_PASSWORD, defaultCryptoManager);

const stateManagerMap = new Map();
stateManagerMap.set(HARDCODED_PASSWORD, asyncronousStateManager);

const storageManagerMap = new Map();
storageManagerMap.set(HARDCODED_PASSWORD, storageManager);

export const useStore = (store: any, password = HARDCODED_PASSWORD) => {
  const [randomId] = useState(crypto.getRandomValues(new Uint8Array(8)));

  // Get or create crypto manager for this password
  let cryptoManager = cryptoManagerMap.get(password);
  let stateManager = stateManagerMap.get(password);
  let storeManager = storageManagerMap.get(password);

  if (!cryptoManager) {
    cryptoManager = new CryptoManager(password);
    cryptoManagerMap.set(password, cryptoManager);

    stateManager = new AsyncronousStateManager(cryptoManager);
    stateManagerMap.set(password, stateManager);

    storeManager = new StorageManager(cryptoManager);
    storageManagerMap.set(password, storeManager);
  }

  // Add loading state for each store property
  const enhanceStoreWithLoading = (obj: any, path = "") => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && obj[key].length === undefined) {
        enhanceStoreWithLoading(obj[key], `${path}${key}.`);
      } else if (Array.isArray(obj[key]) && obj[key].length === 2) {
        const [value, setValue] = obj[key];
        const [isLoading, setIsLoading] = useState(true);

        // Replace the store entry with enhanced version that includes loading state
        obj[key] = [value, setValue, isLoading, setIsLoading];

        // Store the loading setter for the async manager
        const fullKey = `${path}${key}`;
        stateManager.loadingSetters = stateManager.loadingSetters || {};
        stateManager.loadingSetters[fullKey] = setIsLoading;
      }
    });
  };

  enhanceStoreWithLoading(store);
  stateManager.createListeners(store, randomId);

  useEffect(() => {
    storeManager.loadFromDatabase(store, randomId);
    return () => {
      stateManager.removeListeners(randomId);
    };
  }, []);

  return store;
};

// Import custom hooks
import { useFS as _useFS } from "../hooks/useFS.js";

// Re-export utilities from mini-lit
export { css, unsafeCSS } from "./mini-lit";

// Re-export hooks
export { useFS } from "../hooks/useFS.js";
// Re-export view transitions
export { useViewTransition, viewTransitionStyles } from "./view-transitions.js";

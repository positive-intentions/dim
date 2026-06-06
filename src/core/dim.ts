import { LitElement, html as litHtml } from "../vendor/lit/index.js";
import { unsafeHTML } from "../vendor/lit/directives/unsafe-html.js";
import { keyed } from "../vendor/lit/directives/keyed.js";
import AsyncronousStateManager from "./async-manager";
import { css, unsafeCSS } from "./mini-lit";
import StorageManager from "./storage-manager";
import CryptoManager from "./crypto-manager";
import {
  useViewTransition,
  viewTransitionStyles,
  setCurrentInstance as setViewTransitionInstance,
} from "./view-transitions.js";
import { AutoTransitionHost } from "./auto-transition-host.js";

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

    // Parse the object literal as JSON instead of evaluating arbitrary code.
    // This avoids the security/perf cost of `new Function`. Object attributes
    // that are not valid JSON (e.g. containing function references) should be
    // passed via the `.props` property instead.
    try {
      const objValue = JSON.parse("{" + attrValue + "}");
      const jsonString = JSON.stringify(objValue);

      // Replace with JSON string
      replacements.push({
        from: fullMatch,
        to: `${attrName}='${jsonString}'`,
      });
      hasReplacements = true;
    } catch (e) {
      console.warn(
        "Failed to parse object attribute as JSON (use .props for functions/non-JSON values):",
        attrValue
      );
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
      this._attributeObserver = null;
      this._attributeUpdateScheduled = false;
      this._transitionHost = new AutoTransitionHost(this);
    }

    connectedCallback() {
      super.connectedCallback();
      // Capture child nodes before they're moved to shadow DOM
      if (!this._childNodesCaptured) {
        this._childNodes = Array.from(this.childNodes);
        this._slotContent = this.innerHTML;
        this._childNodesCaptured = true;
      }

      // dim renders from the host's attributes (see render()), but LitElement
      // only re-renders on reactive property changes. Watch attribute mutations
      // so plain-attribute APIs (e.g. transitionId="${id}") trigger a re-render.
      // Safe from loops: render() writes only to the shadow root and we never
      // reflect props back to host attributes, so this only fires for external
      // (parent-driven) attribute changes.
      if (!this._attributeObserver) {
        this._attributeObserver = new MutationObserver(() => {
          if (!this._attributeUpdateScheduled) {
            this._attributeUpdateScheduled = true;
            requestAnimationFrame(() => {
              this._attributeUpdateScheduled = false;
              this.requestUpdate();
            });
          }
        });
      }
      this._attributeObserver.observe(this, { attributes: true });
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._attributeObserver) {
        this._attributeObserver.disconnect();
      }
      this._attributeUpdateScheduled = false;
      this._transitionHost.disconnect();
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

      // HTML lowercases attribute names (e.g. `transitionId` is stored as
      // `transitionid`), so camelCase lookups must be case-insensitive.
      const readProp = (obj, name) => {
        if (obj[name] !== undefined) return obj[name];
        const lower = name.toLowerCase();
        const key = Object.keys(obj).find((k) => k.toLowerCase() === lower);
        return key !== undefined ? obj[key] : undefined;
      };

      // Auto-detect transitionId prop and set up view transitions
      let autoTransition = null;
      const transitionId =
        readProp(attributes, "transitionId") ??
        readProp(this.props, "transitionId");
      if (transitionId !== undefined && transitionId !== null) {
        autoTransition = useViewTransition(transitionId.toString(), {
          duration: parseInt(readProp(attributes, "transitionDuration")) || 500,
          autoDirection:
            readProp(attributes, "transitionAutoDirection") !== "false",
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
        keyed,
      };

      // Process children to make them available
      const children = this._slotContent || "";
      const childElements = this._childNodes.filter(
        (node) =>
          node.nodeType === Node.ELEMENT_NODE ||
          (node.nodeType === Node.TEXT_NODE && node.textContent.trim())
      );

      // Wrap props in a case-insensitive proxy so components can read camelCase
      // attributes (e.g. `props.pageData`) even though the DOM stores attribute
      // names lowercased (`pagedata`).
      const rawProps = {
        ...attributes,
        ...this.props,
        children,
        childElements,
      };
      const componentProps = new Proxy(rawProps, {
        get(target, key) {
          if (typeof key === "string" && !(key in target)) {
            const lower = key.toLowerCase();
            const match = Object.keys(target).find(
              (k) => k.toLowerCase() === lower
            );
            if (match !== undefined) return target[match];
          }
          return target[key];
        },
      });

      // Call the functional component
      const result = CustomFunctionalComponent(
        componentProps,
        sharedDependencies
      );

      // Clear the current instance context
      setCurrentInstance(null);

      // Auto-wrap result with view transitions if transitionId is present
      if (autoTransition) {
        return this._transitionHost.wrapRender(
          autoTransition,
          result,
          litHtml
        );
      }

      // Cache the latest render so a future transitionId can animate from it.
      this._transitionHost.cacheRenderResult(result);
      return result;
    }

    updated(changedProperties) {
      super.updated(changedProperties);
      this._transitionHost.onUpdated();
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
    // Bail out of re-rendering when the value is unchanged (matches React).
    if (Object.is(component.hooks[hookName], value)) {
      return;
    }
    component.hooks[hookName] = value;
    component.requestUpdate();
  };

  return [component.hooks[hookName], setState];
}

export function useEffect(effect, dependencies) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  const prev = component.hooks[hookName];
  const prevDeps = prev?.dependencies;
  const hasChanged =
    !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    if (prev?.cleanup) {
      prev.cleanup();
    }
    const cleanup = effect();
    component.hooks[hookName] = {
      dependencies,
      cleanup,
      controllerRegistered: prev?.controllerRegistered || false,
    };
  }

  // Register the disconnect-cleanup controller only ONCE per hook slot.
  // Previously this ran on every render, accumulating a new controller each
  // time and causing cleanups to run multiple times / leak.
  if (!component.hooks[hookName].controllerRegistered) {
    component.hooks[hookName].controllerRegistered = true;
    component.addController({
      hostDisconnected() {
        const hook = component.hooks[hookName];
        if (hook?.cleanup) {
          hook.cleanup();
          // Guard against double invocation if disconnected more than once.
          hook.cleanup = undefined;
        }
      },
    });
  }
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

// SECURITY / EXPERIMENTAL: this evaluates a code string resolved from `promise`
// via `new Function`, which executes arbitrary JavaScript. Only use it with
// fully trusted sources. It exists as a proof-of-concept for module federation
// and is NOT safe for untrusted/remote input.
export const useLazyScope = (tag: string, promise: Promise<any>) => {
  promise.then((module: any) => {
    const elementClass = new Function(`return ${module}`)();

    if (!customElements.get(tag)) {
      define({ tag, component: elementClass });
    }
  });
};

export function useRef(initialValue?: any) {
  const component = getCurrentInstance() as any;
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  if (!component.hooks[hookName]) {
    // When an initial value is supplied, use it (React-like behaviour).
    // Otherwise default `current` to the component instance to preserve the
    // existing `getRef` lookup behaviour.
    component.hooks[hookName] = {
      current: initialValue !== undefined ? initialValue : component,
    };
  }

  return component.hooks[hookName];
}

// State managers keyed by encryption key. Encryption is opt-in: when no key is
// provided the store operates on plaintext. There is intentionally no default
// password baked into the framework.
const stateManagerMap = new Map<string, any>();
const cryptoManagerMap = new Map<string, any>();

// Shared singleton manager used when encryption is not enabled.
const plaintextStateManager = new AsyncronousStateManager(null);

/**
 * Bottom-up reactive store.
 *
 * @param store - schema object of `useState` tuples
 * @param options - optional config. Pass `{ encryptionKey }` (or a string key)
 *   to enable encrypted persistence. Encryption is OFF by default and there is
 *   no hardcoded fallback password.
 */
export const useStore = (
  store: any,
  options: { encryptionKey?: string } | string = {}
) => {
  const encryptionKey =
    typeof options === "string" ? options : options?.encryptionKey;

  const [randomId] = useState(crypto.getRandomValues(new Uint8Array(8)));

  let stateManager;
  if (encryptionKey) {
    let cryptoManager = cryptoManagerMap.get(encryptionKey);
    stateManager = stateManagerMap.get(encryptionKey);

    if (!cryptoManager) {
      cryptoManager = new CryptoManager(encryptionKey);
      cryptoManagerMap.set(encryptionKey, cryptoManager);

      stateManager = new AsyncronousStateManager(cryptoManager);
      stateManagerMap.set(encryptionKey, stateManager);
    }
  } else {
    stateManager = plaintextStateManager;
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
    // The async manager owns its StorageManager instance (stateManager.db).
    stateManager.db.loadFromDatabase(store, randomId);
    return () => {
      stateManager.removeListeners(randomId);
    };
  }, []);

  return store;
};

// Import custom hooks
import { useFS as _useFS } from "../hooks/useFS.js";

// Re-export utilities from mini-lit (already imported above for internal use)
export { css, unsafeCSS };

// Re-export hooks
export { useFS } from "../hooks/useFS.js";
export { useDimStore } from "../hooks/useDimStore.ts";

// Re-export view transitions (already imported above for internal use)
export { useViewTransition, viewTransitionStyles };

// Re-export the keyed directive (already imported above for internal use)
export { keyed };

// Re-export core managers for external use (already imported above for internal use)
export { default as CryptoManager } from "./crypto-manager";
export { default as StorageManager } from "./storage-manager";
export { default as AsyncronousStateManager } from "./async-manager";

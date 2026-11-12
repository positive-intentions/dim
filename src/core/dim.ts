import AsyncronousStateManager from "./async-manager";
import {
  css,
  unsafeCSS,
  html,
  keyed,
  renderChildren,
  DimElement,
} from "./mini-lit";
import StorageManager from "./storage-manager";
import CryptoManager from "./crypto-manager";
import {
  useViewTransition,
  viewTransitionStyles,
  setCurrentInstance as setViewTransitionInstance,
} from "./view-transitions.js";
import { AutoTransitionHost } from "./auto-transition-host.js";

// Re-export the public template / style API from mini-lit (single source of truth)
export { html, css, unsafeCSS, keyed, renderChildren, DimElement };

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

/**
 * Register a functional component as a custom element.
 * Stamps `component.tag = tag` and returns the component for useScope({ Comp }).
 */
export function define({ tag, component: CustomFunctionalComponent }) {
  class DimComponent extends DimElement {
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
      // Capture child nodes before light-DOM composition is consumed
      if (!this._childNodesCaptured) {
        this._childNodes = Array.from(this.childNodes);
        this._slotContent = this.innerHTML;
        this._childNodesCaptured = true;
      }

      // dim renders from the host's attributes (see render()). Watch attribute
      // mutations so plain-attribute APIs (e.g. transitionId="${id}") re-render.
      // Safe from loops: render() writes only to the shadow root and we never
      // reflect props back to host attributes.
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

      // Ensure props object exists without going through the reactive setter
      // (which would schedule another update mid-render).
      if (!this._props) this._props = {};
      const hostProps = this._props;

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
        readProp(hostProps, "transitionId");
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

      // Injected deps match named exports (same html, keyed, renderChildren, …)
      const sharedDependencies = {
        useState,
        useEffect,
        useMemo,
        useScope,
        useStyle,
        useStore,
        useFS,
        useViewTransition,
        html,
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
        ...hostProps,
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
          html
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

  if (!customElements.get(tag)) {
    window.customElements.define(tag, DimComponent);
  }

  // Stamp tag on the functional component for useScope({ Comp }) DX
  CustomFunctionalComponent.tag = tag;
  return CustomFunctionalComponent;
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

/**
 * Register child components in scope.
 * Supports:
 *   useScope({ "child-tag": ChildFn })
 *   useScope({ ChildFn })  // uses ChildFn.tag stamped by define()
 */
export function useScope(elements) {
  Object.keys(elements).forEach((key) => {
    const component = elements[key];
    const tag =
      (typeof component === "function" && component.tag) ||
      (key.includes("-") ? key : null);

    if (!tag) {
      console.warn(
        `useScope: cannot resolve tag for "${key}". Use a hyphenated tag key or call define() on the component first.`
      );
      return;
    }

    if (!customElements.get(tag)) {
      define({ tag, component });
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

  // Check if styles have changed — queue for flush after render commit
  // so the first render's container clear does not wipe style nodes.
  const prevStyles = component.hooks[hookName];
  if (prevStyles !== cssText) {
    component.hooks[hookName] = cssText;
    component.__styleQueue = component.__styleQueue || [];
    component.__styleQueue.push({
      hookName,
      cssText,
      cssResult,
      preferAdopted: !prevStyles,
    });
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

// Re-export hooks
export { useFS } from "../hooks/useFS.js";
export { useDimStore } from "../hooks/useDimStore.ts";

// Re-export view transitions (already imported above for internal use)
export { useViewTransition, viewTransitionStyles };

// Re-export core managers for external use (already imported above for internal use)
export { default as CryptoManager } from "./crypto-manager";
export { default as StorageManager } from "./storage-manager";
export { default as AsyncronousStateManager } from "./async-manager";

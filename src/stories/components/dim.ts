import { LitElement } from "lit";
import { html, css, unsafeCSS } from "./mini-lit";

let currentInstance = null;

function setCurrentInstance(instance) {
  currentInstance = instance;
}

function getCurrentInstance() {
  if (!currentInstance) {
    throw new Error("Hooks can only be called inside a component.");
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
    }

    render() {
      // Reset hook index on every render
      this.hookIndex = 0;

      // Set the current instance context
      setCurrentInstance(this);

      // Get all attributes as props
      const attributes = Array.from(this.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {});

      this.props = this.props || {};

      const sharedDependencies = {
        useState,
        useEffect,
        useMemo,
        useScope,
        useStyle,
        useStore,
        html,
        css,
      };

      // Call the functional component
      const result = CustomFunctionalComponent(
        {
          ...attributes,
          ...this.props,
          children: this.innerHTML,
        },
        sharedDependencies
      );

      // Clear the current instance context
      setCurrentInstance(null);

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

export function useStyle(styles) {
  const component = getCurrentInstance();

  if (!component._stylesApplied) {
    component._stylesApplied = true;

    // Apply the styles to the component
    const styleElement = document.createElement("style");
    styleElement.textContent = unsafeCSS(styles).cssText;
    component.shadowRoot.appendChild(styleElement);
  }
}

export const useLazyScope = (tag, promise) => {
  promise.then((module) => {
    const elementClass = new Function(`return ${module}`)();

    if (!customElements.get(tag)) {
      define({ tag, component: elementClass });
    }
  });
};

class AsyncronousStateManager {
  private store: any = {};
  private eventListener: any[] = [];

  // constructor() {
  //   // this.store = {};
  //   // this.eventListener = [];
  // }

  registerListener(listener) {
    this.generateListener(listener);
  }

  generateListener(listener) {
    const { listenerId, key, value } = listener;

    // Remove existing event listeners if they exist
    const existingListender = this.eventListener.find(
      (listener) => listener.listenerId === listenerId
    );

    const listenerName = `${key}`;

    if (existingListender) {
      window.removeEventListener(listenerName, existingListender.listener);

      this.eventListener = this.eventListener.filter(
        (listener) => listener.listenerId !== listenerId
      );
    }

    // Create a new event listener
    const newListener = (event) => {
      value[1](event.detail);

      this.store = {
        ...this.store,
        [key]: event.detail,
      };
    };

    window.addEventListener(listenerName, newListener);

    this.eventListener.push({
      listenerId,
      listener: newListener,
    });

    const newSetter = (newValue) => {
      window.dispatchEvent(
        new CustomEvent(listenerName, {
          detail: newValue,
        })
      );
    };

    const newState = this.store[key] || value[0];

    console.log("created listener", this.eventListener);

    return [newState, newSetter];
  }

  removeListeners(listenerId) {
    const existingListender = this.eventListener.find(
      (listener) => listener.listenerId === listenerId
    );

    if (existingListender) {
      window.removeEventListener(
        `${existingListender.key}-$}`,
        existingListender.listener
      );

      this.eventListener = this.eventListener.filter(
        (listener) => listener.listenerId !== listenerId
      );
    }
  }
}

const asyncronousStateManager = new AsyncronousStateManager();

const getStateKeys = (state, listenerId) => {
  const keys = [];
  const traverse = (obj, path) => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && obj[key].length === undefined) {
        traverse(obj[key], `${path}${key}.`);
      } else {
        const [asyncState, asyncSetState] =
          asyncronousStateManager.generateListener({
            listenerId,
            key: `${path}${key}`,
            value: obj[key],
          });

        obj[key] = [asyncState, asyncSetState].concat(obj[key]);
        console.log("setting listeners");

        keys.push<any>({
          [`${listenerId}`]: {
            key: `${path}${key}`,
            value: obj[key],
          },
        });
      }
    });
  };

  traverse(state, "");
  return keys;
};

export const useStore = (store) => {
  const [randomId] = useState(Math.random().toString(36).substring(7));

  const keys = getStateKeys(store, randomId);
  console.log("keys", keys);

  useEffect(() => {
    return () => {
      console.log("removing listeners");
      asyncronousStateManager.removeListeners(randomId);
    };
  }, []);

  return store;
};

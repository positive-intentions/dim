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

export function define({
  tag,
  component: CustomFunctionalComponent,
  sharedDependencies,
}) {
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

const getStateKeys = (state) => {
  const keys = [];
  const traverse = (obj, path) => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && obj[key].length === undefined) {
        traverse(obj[key], `${path}${key}.`);
      } else {
        keys.push(`${path}${key}`);
      }
    });
  };

  traverse(state, "");
  return keys;
};

class CustomEventManager {
  private eventListeners: {
    [key: string]: { mutation: EventListener; query: EventListener };
  } = {};

  addEventListener(key: string, value: any, setState: (value: any) => void) {
    // Remove existing event listeners if they exist
    if (this.eventListeners[key]) {
      window.removeEventListener(
        `mutation-${key}`,
        this.eventListeners[key].mutation
      );
      window.removeEventListener(
        `query-${key}`,
        this.eventListeners[key].query
      );
    }

    // Define new event listeners
    const mutationListener = (event: Event) => {
      console.log(">>> mutation called", event.detail);
      if (event.detail?.callback && !!value) {
        return window.dispatchEvent(
          new CustomEvent(`${event.detail.callback}`, {
            detail: value,
            bubbles: true,
          })
        );
      }

      setState(event.detail);
    };

    const queryListener = (event: Event) => {
      console.log(
        ">>> query called",
        value,
        (event as CustomEvent).detail.callback
      );

      window.dispatchEvent(
        new CustomEvent(`${(event as CustomEvent).detail.callback}`, {
          detail: value,
          bubbles: true,
        })
      );
    };

    // Add new event listeners
    // this.setInitialValue(key);
    window.addEventListener(`query-${key}`, queryListener);
    window.addEventListener(`mutation-${key}`, mutationListener);

    // Store references to the new event listeners
    this.eventListeners[key] = {
      mutation: mutationListener,
      query: queryListener,
    };
  }

  dispatchEvent(key: string, newValue: any) {
    window.dispatchEvent(
      new CustomEvent(`mutation-${key}`, {
        detail: newValue,
        bubbles: true,
      })
    );
  }

  getInitialValue(key: string) {
    console.log(">>>> getInitialValue", key);
    const randomhash = Math.random().toString(36).substring(7);
    const eventName = `query-${key}-${randomhash}`;

    const initStateHandler = (event) => {
      console.log(">>>> getInitialValue callback", event);

      window.dispatchEvent(
        new CustomEvent(`mutation-${key}`, {
          detail: event.detail,
          bubbles: true,
        })
      );
      setTimeout(() => {}, 0);
    };

    const removeInitStateHandler = () => {
      console.log(">>>> removeInitStateHandler", eventName);
      window.removeEventListener(eventName, initStateHandler);
    };

    window.addEventListener(eventName, (e) => {
      initStateHandler(e);
      removeInitStateHandler();
    });
    window.dispatchEvent(
      new CustomEvent(`mutation-${key}`, {
        detail: { callback: eventName },
        bubbles: true,
      })
    );
  }
}

// givent the keys and store, update the setters to console log when there is a change
// the keys are . separated
const updateSetters = (keys, store, customEventManager) => {
  keys.forEach((key) => {
    const keyParts = key.split(".");

    const stateHook = keyParts.reduce((acc, part) => acc && acc[part], store);

    const stateValue = stateHook[0];
    const stateSetter = stateHook[1];

    customEventManager.addEventListener(key, stateValue, stateSetter);
    // if (!stateValue) customEventManager.getInitialValue(key);

    const newStateSetter = (value) => {
      // stateSetter(value);

      customEventManager.dispatchEvent(key, value);
    };

    // update the store to replace the setter
    keyParts.reduce((acc, part, i) => {
      if (i === keyParts.length - 1) {
        acc[part][1] = newStateSetter;
      }
      return acc[part];
    }, store);
  });
  useEffect(() => {
    keys.forEach((key) => {
      customEventManager.getInitialValue(key);
    });
  }, []);
};

export const useStore = (store) => {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  const keys = getStateKeys(store);

  if (!component.hooks[hookName]) {
    component.hooks[hookName] = new CustomEventManager();
  }

  updateSetters(keys, store, component.hooks[hookName]);

  return store;
};

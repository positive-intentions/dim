import { LitElement, unsafeCSS, html, css } from "lit";

export const customHtml = (strings: TemplateStringsArray, ...values: any[]) => {
    let result = "";
    strings.forEach((string, i) => {
        let value = values[i];
        if (Array.isArray(value)) {
            value = value.join("");
        } else if (typeof value === "object" && value !== null && value.strings) {
            value = customHtml(value.strings, ...value.values);
        }
        result += string + (value || "");
    });

    // Convert result into HTML elements
    const template = document.createElement("template");
    template.innerHTML = result;
    const fragment = template.content;

    if (fragment.children.length === 1) {
        return fragment.children[0];
    }

    // Attach event listeners
    const eventAttributes = ['@click', '@input', '@change', '@submit']; // Add more as needed
    eventAttributes.forEach(attr => {
        fragment.querySelectorAll(`[${attr}]`).forEach(element => {
            const eventHandler = element.getAttribute(attr);
            if (eventHandler) {
                const eventName = attr.slice(1); // Remove '@' from attribute name
                element.addEventListener(eventName, new Function('event', eventHandler));
                element.removeAttribute(attr); // Clean up the attribute
            }
        });
    });

    return fragment;
};

// export const customHtml = html;

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
    class CustomComponent extends LitElement {
        constructor() {
            super();
            this.hookIndex = 0;
            this.hooks = {};
            
            // this.attachShadow({ mode: 'open' });
            // this.render();
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

            const sharedDependencies = {
                useState,
                useEffect,
                useMemo,
                useScope,
                useStyle,
                html: customHtml,
                css,
            };

            // Call the functional component
            const result = CustomFunctionalComponent({
                ...attributes,
                children: this.innerHTML,
            }, sharedDependencies);

            // Clear the current instance context
            setCurrentInstance(null);

            return result;
            // this.shadowRoot.innerHTML = '';
            // this.shadowRoot.appendChild(result);

        }
    }

    window.customElements.define(tag, CustomComponent);
}

export function useState(initialState) {
    const component = getCurrentInstance();
    const hookIndex = component.hookIndex++;
    const hookName = `hook-${hookIndex}`;

    if (!component.hooks[hookName]) {
        component.hooks[hookName] = initialState;
    }

    const setState = (newState) => {
        const value = typeof newState === 'function' ? newState(component.hooks[hookName]) : newState;
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
    const hasChanged = !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

    if (hasChanged) {
        if (component.hooks[hookName]?.cleanup) {
            component.hooks[hookName].cleanup();
        }
        const cleanup = effect();
        component.hooks[hookName] = { dependencies, cleanup };
    }

    component.addController({
        hostDisconnected() {
            if (component.hooks[hookName]?.cleanup) {
                component.hooks[hookName].cleanup();
            }
        }
    });
}

export function useMemo(calculation, dependencies) {
    const component = getCurrentInstance();
    const hookIndex = component.hookIndex++;
    const hookName = `hook-${hookIndex}`;

    const prevDeps = component.hooks[hookName]?.dependencies;
    const hasChanged = !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

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
        const styleElement = document.createElement('style');
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
}

import { LitElement, unsafeCSS, html, css } from "lit";

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
                html,
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

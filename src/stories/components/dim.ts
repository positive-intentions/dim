import { LitElement } from "lit";

import { html, css, unsafeCSS } from "./mini-lit";

// export const customHtml = (strings: TemplateStringsArray, ...values: any[]) => {
//     let result = "";
//     let index = 0; // Initialize index for values tracking

//     strings.forEach((string, i) => {
//         let value = values[i]; // Use index to access the value directly

//         // Handle array and nested customHtml cases
//         if (Array.isArray(value)) {
//             value = value.join("");
//         } else if (typeof value === "object" && value !== null && value.strings) {
//             debugger;
//             value = customHtml(value.strings, ...value.values);
//         }

//         result += string + (value || "");
//         // index++; // Increment index for next value
//     });

//     // Convert result into HTML elements
//     const template = document.createElement("template");
//     template.innerHTML = result;
//     const fragment = template.content;

//     // Set up event listeners and properties
//     fragment.querySelectorAll('*').forEach((element) => {
//         const attributes = Array.from(element.attributes);

//         // Handle properties prefixed with '.'
//         attributes.forEach(attr => {
//             if (attr.name.startsWith('.')) {
//                 const valuePropName = attr.name.slice(1); // Remove '.' prefix

//                 console.log({ valuePropName, values });
//                 debugger;
//                 const boundValue = values[index]; // Get the corresponding value

//                 if (typeof boundValue !== 'undefined') {
//                     // Set initial value for the property
//                     element[valuePropName] = boundValue;

//                     // Watch for changes in the state to update the element's property
//                     const observer = new MutationObserver(() => {
//                         if (element[valuePropName] !== boundValue) {
//                             element[valuePropName] = boundValue; // Update the property
//                         }
//                     });

//                     observer.observe(element, {
//                         attributes: true,
//                         attributeFilter: [attr.name]
//                     });

//                     // Clean up observer on disconnect
//                     element.addEventListener('disconnect', () => observer.disconnect());
//                 }
//                 index++; // Increment index after processing property
//             }

//             // Handle properties prefixed with '@'
//             if (attr.name.startsWith('@')) {
//                 const eventPropName = attr.name.slice(1); // Remove '@' prefix
//                 console.log({ eventPropName, values });
//                 const boundValue = values[index]; // Get the corresponding value

//                 if (typeof boundValue === 'function') {
//                     // Set event listener for the property
//                     element.addEventListener(eventPropName, boundValue);
//                 } else {
//                     console.warn(`Expected a function for ${eventPropName}, but got:`, boundValue);
//                 }
//                 index++; // Increment index after processing property
//             }
//         });
//     });

//     return fragment;
// };

// function attachListeners(elements) {
//     elements.forEach((element) => {
//         if (!element?.attributes) return;
//         const attributes = Array.from(element.attributes);

//         attributes.forEach(attr => {
//             if (attr.name.startsWith('@')) {
//                 // Handle event listeners (e.g., @click)
//                 const eventPropName = attr.name.slice(1); // Remove '@' prefix
//                 const boundValue = values[valueIndex]; // Get the corresponding value for this event

//                 if (typeof boundValue === 'function') {
//                     element.addEventListener(eventPropName, boundValue);
//                 } else {
//                     console.warn(`Expected a function for ${eventPropName}, but got:`, boundValue);
//                 }
//                 element.removeAttribute(attr.name); // Prevent attribute from rendering
//                 valueIndex++;
//             } else if (attr.name.startsWith('.')) {
//                 // Handle property bindings (e.g., .value)
//                 const propName = attr.name.slice(1); // Remove '.' prefix
//                 const boundValue = values[valueIndex]; // Get the corresponding value for this property

//                 if (boundValue !== undefined && boundValue !== null) {
//                     element[propName] = boundValue;
//                 } else {
//                     console.warn(`Expected a value for ${propName}, but got:`, boundValue);
//                 }
//                 element.removeAttribute(attr.name); // Prevent attribute from rendering
//                 valueIndex++;
//             }
//         });
//     });
// }

// export function customHtml(strings, ...values) {
//     const template = document.createElement('template');
//     const rawHTML = strings.reduce((acc, string, index) => acc + string + (values[index] !== undefined ? values[index] : ''), '');
//     template.innerHTML = rawHTML.trim();
//     const fragment = template.content;

//     // get all arrays in values
//     const arrays = values.filter((value) => Array.isArray(value));

//     attachListeners(arrays);

//     console.log({ strings, values, arrays });

//     let valueIndex = 0;

//     fragment.querySelectorAll('*').forEach((element) => {
//         const attributes = Array.from(element.attributes);

//         attributes.forEach(attr => {
//             if (attr.name.startsWith('@')) {
//                 // Handle event listeners (e.g., @click)
//                 const eventPropName = attr.name.slice(1); // Remove '@' prefix
//                 const boundValue = values[valueIndex]; // Get the corresponding value for this event

//                 if (typeof boundValue === 'function') {
//                     element.addEventListener(eventPropName, boundValue);
//                 } else {
//                     console.warn(`Expected a function for ${eventPropName}, but got:`, boundValue);
//                 }
//                 element.removeAttribute(attr.name); // Prevent attribute from rendering
//                 valueIndex++;
//             } else if (attr.name.startsWith('.')) {
//                 // Handle property bindings (e.g., .value)
//                 const propName = attr.name.slice(1); // Remove '.' prefix
//                 const boundValue = values[valueIndex]; // Get the corresponding value for this property

//                 if (boundValue !== undefined && boundValue !== null) {
//                     element[propName] = boundValue;
//                 } else {
//                     console.warn(`Expected a value for ${propName}, but got:`, boundValue);
//                 }
//                 element.removeAttribute(attr.name); // Prevent attribute from rendering
//                 valueIndex++;
//             }
//         });
//     });

//     return fragment;
// }

// export function customHtml(strings, ...values) {
//   // Create a template element for parsing and detaching later
//   const template = document.createElement("template");
//   const rawHTML = strings.reduce((acc, string, index) => {
//     // Check if the current value is an array

//     const value = Array.isArray(values[index])
//       ? values[index]
//           .map((v) => {
//             const div = document.createElement("div");
//             div.appendChild(v);
//             return div.innerHTML;
//           })
//           .join("")
//       : values[index];

//     return acc + string + (values[index] !== undefined ? value : "");
//   }, "");
//   template.innerHTML = rawHTML.trim();

//   // Extract the content fragment from the template
//   const fragment = template.content.cloneNode(true); // Clone to avoid affecting the original template

//   // Keep track of the current value index
//   let valueIndex = 0;

//   fragment.querySelectorAll("*").forEach((element) => {
//     // Process element attributes
//     const attributes = Array.from(element.attributes);
//     attributes.forEach((attr) => {
//       if (attr.name.startsWith("@")) {
//         // Handle event listeners (e.g., @click)
//         const eventPropName = attr.name.slice(1); // Remove '@' prefix
//         const boundValue = values[valueIndex]; // Get the corresponding value

//         if (typeof boundValue === "function") {
//           element.addEventListener(eventPropName, boundValue);
//         } else {
//           console.warn(
//             `Expected a function for ${eventPropName}, but got:`,
//             boundValue
//           );
//         }

//         element.removeAttribute(attr.name); // Prevent attribute rendering
//         //set focus on the element
//         element.focus();

//         valueIndex++;
//       } else if (attr.name.startsWith(".")) {
//         // Handle property bindings (e.g., .value)
//         const propName = attr.name.slice(1); // Remove '.' prefix
//         const boundValue = values[valueIndex]; // Get the corresponding value

//         if (boundValue !== undefined && boundValue !== null) {
//           element[propName] = boundValue;
//         } else {
//           console.warn(
//             `Expected a value for ${propName}, but got:`,
//             boundValue
//           );
//         }

//         element.removeAttribute(attr.name); // Prevent attribute rendering
//         valueIndex++;
//       }
//     });
//   });

//   // Detach the template to avoid unnecessary DOM manipulation
//   template.remove();

//   return fragment;
// }

// export const customHtml = html;

// export const customHtml = litHtml;

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

// export function define({ tag, component: CustomFunctionalComponent }) {
//   class CustomComponent extends LitElement {
//     constructor() {
//       super();
//       this.hookIndex = 0;
//       this.hooks = {};
//     }

//     render() {
//       // Reset hook index on every render
//       this.hookIndex = 0;

//       // Set the current instance context
//       setCurrentInstance(this);

//       // Get all attributes as props
//       const attributes = Array.from(this.attributes).reduce((acc, attr) => {
//         acc[attr.name] = attr.value;
//         return acc;
//       }, {});

//       const sharedDependencies = {
//         useState,
//         useEffect,
//         useMemo,
//         useScope,
//         useStyle,
//         html,
//         css,
//       };

//       // Call the functional component
//       const result = CustomFunctionalComponent(
//         {
//           ...attributes,
//           children: this.innerHTML,
//         },
//         sharedDependencies
//       );

//       // Clear the current instance context
//       setCurrentInstance(null);

//       return result;
//     }
//   }

//   window.customElements.define(tag, CustomComponent);
// }

export function define({ tag, component: CustomFunctionalComponent }) {
  class CustomComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.hookIndex = 0;
      this.hooks = {};
    }

    connectedCallback() {
      const template = this.render();
      // this.shadowRoot.appendChild(template);
    }

    render() {
      // Reset hook index on every render
      this.hookIndex = 0;

      // Set the current instance context
      setCurrentInstance(this);

      try {
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
        const result = CustomFunctionalComponent(
          {
            ...attributes,
            children: Array.from(this.childNodes).map((child) =>
              child.cloneNode(true)
            ),
          },
          sharedDependencies
        );

        const resultToAppend = document.createElement("template");
        resultToAppend.innerHTML = html`${result}`.trim();

        // append the result to the shadow root
        console.log({ resultToAppend, result });
        this.shadowRoot.appendChild(resultToAppend);
      } finally {
        // Clear the current instance context (even if errors occur)
        setCurrentInstance(null);
      }
    }
  }

  // Define the custom element with the created class
  customElements.define(tag, CustomComponent);
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

  // Add event listener to handle unmount
  component.addEventListener("disconnectedCallback", () => {
    if (component.hooks[hookName]?.cleanup) {
      component.hooks[hookName].cleanup();
    }
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

import { LitElement, html, css } from "../mini-lit.js";
import { setCurrentInstance } from "../utils/instance.js";
import * as hooks from "../hooks/index.js";

export class DimComponent extends LitElement {
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

    const querySelector = this.shadowRoot?.querySelector.bind(this.shadowRoot);
    const getRef = (ref) => {
      const component = querySelector(ref);
      const refHookName =
        Object.keys(component.hooks).find(
          (o) => !!component.hooks[o].current,
        ) || "";
      return component.hooks[refHookName].current;
    };

    const sharedDependencies = {
      ...hooks,
      html,
      css,
      querySelector,
      getRef,
    };

    // Call the functional component
    const result = this.constructor.functionalComponent(
      {
        ...attributes,
        ...this.props,
        children: this.innerHTML,
      },
      sharedDependencies,
    );

    // Clear the current instance context
    setCurrentInstance(null);

    return result;
  }
}

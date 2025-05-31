import { DimComponent } from "./DimComponent.js";

export function define({ tag, component: CustomFunctionalComponent }) {
  class CustomDimComponent extends DimComponent {
    static functionalComponent = CustomFunctionalComponent;
  }

  window.customElements.define(tag, CustomDimComponent);
}

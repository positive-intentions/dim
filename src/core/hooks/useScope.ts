import { define } from "../element/define";

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

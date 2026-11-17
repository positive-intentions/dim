/**
 * WASM-backed replacement for `src/core/hooks/*`. Hook slot bookkeeping,
 * dependency comparison, effect cleanup and update scheduling run in Rust.
 */
import "./load";
import * as wasm from "./generated/pkg/dim_core.js";
import { unsafeCSS } from "./renderer";
import { define } from "./element";

export function useState(initialState?: any) {
  const [value, host, name] = wasm.useState(initialState);
  const setState = (newState) => wasm.setState(host, name, newState);
  return [value, setState];
}

export function useEffect(effect, dependencies?: any[]) {
  wasm.useEffect(effect, dependencies);
}

export function useMemo(calculation, dependencies?: any[]) {
  return wasm.useMemo(calculation, dependencies);
}

export function useRef(initialValue?: any) {
  return wasm.useRef(initialValue);
}

export function useStyle(styles: any) {
  wasm.useStyle(typeof styles === "string" ? unsafeCSS(styles) : styles);
}

/**
 * Register child components in scope.
 *   useScope({ "child-tag": ChildFn })
 *   useScope({ ChildFn })  // uses ChildFn.tag stamped by define()
 */
export function useScope(elements) {
  wasm.useScope(elements);
}

// SECURITY / EXPERIMENTAL: evaluates a code string via `new Function`. Only
// use with fully trusted sources (module-federation proof of concept).
export const useLazyScope = (tag: string, promise: Promise<any>) => {
  promise.then((module: any) => {
    const elementClass = new Function(`return ${module}`)();
    if (!customElements.get(tag)) {
      define({ tag, component: elementClass });
    }
  });
};

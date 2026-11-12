import { getCurrentInstance } from "../element/instance";

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

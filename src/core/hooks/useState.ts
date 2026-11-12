import { getCurrentInstance } from "../element/instance";

export function useState(initialState) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  // Use `in` — falsy values (false, 0, "", null) are valid state and must
  // not be treated as "uninitialized" on the next render.
  if (!(hookName in component.hooks)) {
    component.hooks[hookName] = initialState;
  }

  const setState = (newState) => {
    const value =
      typeof newState === "function"
        ? newState(component.hooks[hookName])
        : newState;
    // Bail out of re-rendering when the value is unchanged (matches React).
    if (Object.is(component.hooks[hookName], value)) {
      return;
    }
    component.hooks[hookName] = value;
    component.requestUpdate();
  };

  return [component.hooks[hookName], setState];
}

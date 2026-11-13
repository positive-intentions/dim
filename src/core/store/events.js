/**
 * Debounced window CustomEvent dispatcher used by the store.
 */

function createDebouncedEventDispatcher(delay) {
  const timeoutIds = {};

  return (eventName, value) => {
    if (timeoutIds[eventName] !== undefined) {
      clearTimeout(timeoutIds[eventName]);
    }

    timeoutIds[eventName] = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: value,
        }),
      );
      timeoutIds[eventName] = undefined;
    }, delay);
  };
}

export const debouncedDispatcher = createDebouncedEventDispatcher(200);

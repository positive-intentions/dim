/**
 * Per-render current-instance context. Hooks (including useViewTransition)
 * read the host that is currently rendering.
 */

let currentInstance = null;

export function setCurrentInstance(instance) {
  currentInstance = instance;
}

export function getCurrentInstance() {
  if (!currentInstance) {
    console.error("Hooks should only be called inside a component.");
  }
  return currentInstance;
}

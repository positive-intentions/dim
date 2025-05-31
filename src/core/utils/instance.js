let currentInstance = null;

export function setCurrentInstance(instance) {
  currentInstance = instance;
}

export function getCurrentInstance() {
  if (!currentInstance) {
    throw new Error("Hooks can only be called inside a component.");
  }
  return currentInstance;
}
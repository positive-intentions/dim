import { getCurrentInstance } from "../element/instance";

export function useEffect(effect, dependencies) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;

  const prev = component.hooks[hookName];
  const prevDeps = prev?.dependencies;
  const hasChanged =
    !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);

  if (hasChanged) {
    if (prev?.cleanup) {
      prev.cleanup();
    }
    const cleanup = effect();
    component.hooks[hookName] = {
      dependencies,
      cleanup,
      controllerRegistered: prev?.controllerRegistered || false,
    };
  }

  // Register the disconnect-cleanup controller only ONCE per hook slot.
  if (!component.hooks[hookName].controllerRegistered) {
    component.hooks[hookName].controllerRegistered = true;
    component.addController({
      hostDisconnected() {
        const hook = component.hooks[hookName];
        if (hook?.cleanup) {
          hook.cleanup();
          // Guard against double invocation if disconnected more than once.
          hook.cleanup = undefined;
        }
      },
    });
  }
}

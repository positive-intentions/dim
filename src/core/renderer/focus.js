/**
 * Focus / selection helpers used during parts commits.
 * skipFocusRestore is set during view-transition two-layer commits.
 */

/** Flag set during view-transition two-layer commits to skip focus restore. */
export let skipFocusRestore = false;
export function setSkipFocusRestore(value) {
  skipFocusRestore = !!value;
}

export function isFormControl(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

export function captureFocus(container) {
  if (skipFocusRestore) return null;
  const root =
    container instanceof ShadowRoot
      ? container
      : container.getRootNode?.() || container;
  let active = null;
  try {
    active =
      root.activeElement ||
      (typeof document !== "undefined" ? document.activeElement : null);
  } catch (_) {
    active = typeof document !== "undefined" ? document.activeElement : null;
  }
  if (!active || !isFormControl(active)) return null;
  if (!container.contains(active) && container !== active) {
    // Shadow root: activeElement may be inside
    if (container instanceof ShadowRoot) {
      if (!container.contains(active)) return null;
    } else {
      return null;
    }
  }
  const snapshot = { el: active };
  try {
    if (typeof active.selectionStart === "number") {
      snapshot.selectionStart = active.selectionStart;
      snapshot.selectionEnd = active.selectionEnd;
    }
  } catch (_) {
    /* some input types disallow selection */
  }
  return snapshot;
}

export function restoreFocus(snapshot) {
  if (!snapshot || skipFocusRestore) return;
  const { el, selectionStart, selectionEnd } = snapshot;
  if (!el.isConnected) return;
  try {
    if (document.activeElement !== el) {
      el.focus({ preventScroll: true });
    }
    if (
      typeof selectionStart === "number" &&
      typeof el.setSelectionRange === "function"
    ) {
      el.setSelectionRange(selectionStart, selectionEnd);
    }
  } catch (_) {
    /* ignore */
  }
}

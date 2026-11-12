/**
 * Commit values into parts and render a TemplateResult into a container.
 */

import { isTemplateResult, isKeyed, isUnsafeHTML } from "./template.js";
import {
  CHILD_PART,
  ATTR_PART,
  PROP_PART,
  EVENT_PART,
  BOOL_PART,
  REF_PART,
  templateCache,
  prepareTemplate,
  createInstance,
} from "./prepare.js";
import {
  captureFocus,
  restoreFocus,
  isFormControl,
} from "./focus.js";

const containerState = new WeakMap();

function formatAttrMid(value) {
  if (value == null || value === false) return "";
  if (value === true) return "";
  return String(value);
}

function commitAttrGroup(part) {
  const group = part.attrGroup;
  if (!group || group.length <= 1) {
    const prefix = part.valuePrefix || "";
    const suffix = part.valueSuffix || "";
    const mid = formatAttrMid(part.committed);
    if (
      (part.committed == null || part.committed === false) &&
      !prefix &&
      !suffix
    ) {
      part.element.removeAttribute(part.name);
    } else {
      part.element.setAttribute(part.name, prefix + mid + suffix);
    }
    return;
  }

  // Only the last part in the group writes — by then all siblings have
  // this cycle's committed values.
  if (part !== group[group.length - 1]) return;

  let result = "";
  for (const g of group) {
    result += g.valuePrefix || "";
    result += formatAttrMid(g.committed);
  }
  result += group[group.length - 1].valueSuffix || "";
  part.element.setAttribute(part.name, result);
}

function clearNodesBetween(start, end) {
  let node = start.nextSibling;
  while (node && node !== end) {
    const next = node.nextSibling;
    node.parentNode?.removeChild(node);
    node = next;
  }
}

function setChildValue(part, value, container) {
  // Handle keyed: remount when key changes
  if (isKeyed(value)) {
    const prev = part.committed;
    const keyChanged =
      !prev ||
      !isKeyed(prev) ||
      prev.key !== value.key;
    if (keyChanged) {
      clearNodesBetween(part.start, part.end);
      part.childState = undefined;
      part.committed = value;
      setChildValue(part, value.result, container);
      // Keep keyed wrapper as committed for next comparison
      part.committed = value;
      return;
    }
    // Same key — update inner result in place
    part.committed = value;
    setChildValue(part, value.result, container);
    part.committed = value;
    return;
  }

  if (isUnsafeHTML(value)) {
    const htmlString = value.value == null ? "" : String(value.value);
    if (part.committed && isUnsafeHTML(part.committed) && part.committed.value === htmlString) {
      return;
    }
    clearNodesBetween(part.start, part.end);
    if (htmlString) {
      const tpl = document.createElement("template");
      tpl.innerHTML = htmlString;
      part.end.parentNode.insertBefore(tpl.content, part.end);
    }
    part.committed = value;
    part.childState = undefined;
    return;
  }

  if (isTemplateResult(value)) {
    if (!part.childState) {
      part.childState = { type: "template" };
    }
    commitTemplateResult(value, part, part.childState);
    part.committed = value;
    return;
  }

  if (Array.isArray(value)) {
    commitArray(value, part);
    part.committed = value;
    return;
  }

  if (value == null || value === false) {
    clearNodesBetween(part.start, part.end);
    part.committed = value;
    part.childState = undefined;
    return;
  }

  // Node / DocumentFragment
  if (value instanceof Node) {
    clearNodesBetween(part.start, part.end);
    part.end.parentNode.insertBefore(value, part.end);
    part.committed = value;
    part.childState = undefined;
    return;
  }

  // Primitive text
  const text = String(value);
  const next = part.start.nextSibling;
  if (
    next &&
    next !== part.end &&
    next.nodeType === Node.TEXT_NODE &&
    next.nextSibling === part.end
  ) {
    if (next.data !== text) next.data = text;
  } else {
    clearNodesBetween(part.start, part.end);
    part.end.parentNode.insertBefore(document.createTextNode(text), part.end);
  }
  part.committed = value;
  part.childState = undefined;
}

function commitArray(values, part) {
  if (!part.arrayState) {
    clearNodesBetween(part.start, part.end);
    part.arrayState = [];
    part.childState = undefined;
  }
  const state = part.arrayState;
  // Ensure marker slots for each item
  while (state.length < values.length) {
    const start = document.createTextNode("");
    const end = document.createTextNode("");
    part.end.parentNode.insertBefore(start, part.end);
    part.end.parentNode.insertBefore(end, part.end);
    state.push({ start, end, committed: undefined, childState: undefined });
  }
  while (state.length > values.length) {
    const removed = state.pop();
    clearNodesBetween(removed.start, removed.end);
    removed.start.parentNode?.removeChild(removed.start);
    removed.end.parentNode?.removeChild(removed.end);
  }
  for (let i = 0; i < values.length; i++) {
    setChildValue(state[i], values[i], null);
  }
}

function commitTemplateResult(result, parentPart, state) {
  const strings = result.strings;
  let prepared = templateCache.get(strings);
  if (!prepared) {
    prepared = prepareTemplate(strings);
    templateCache.set(strings, prepared);
  }

  if (state.strings !== strings) {
    // New template — replace content
    clearNodesBetween(parentPart.start, parentPart.end);
    const instance = createInstance(prepared);
    parentPart.end.parentNode.insertBefore(instance.fragment, parentPart.end);
    state.strings = strings;
    state.parts = instance.parts;
  }

  const values = result.values;
  for (let i = 0; i < state.parts.length; i++) {
    commitPart(state.parts[i], values[i]);
  }
}

function commitPart(part, value) {
  switch (part.kind) {
    case CHILD_PART:
      setChildValue(part, value, null);
      break;
    case ATTR_PART: {
      part.committed = value;
      if (!part.element) break;
      commitAttrGroup(part);
      break;
    }
    case PROP_PART: {
      if (!part.element) break;
      // Controlled .value / .checked: skip write when focused and equal
      if (
        (part.name === "value" || part.name === "checked") &&
        isFormControl(part.element) &&
        typeof document !== "undefined" &&
        document.activeElement === part.element
      ) {
        if (part.element[part.name] === value) {
          part.committed = value;
          break;
        }
      }
      part.element[part.name] = value;
      part.committed = value;
      break;
    }
    case BOOL_PART: {
      if (!part.element) break;
      if (value) {
        part.element.setAttribute(part.name, "");
      } else {
        part.element.removeAttribute(part.name);
      }
      part.committed = value;
      break;
    }
    case EVENT_PART: {
      if (!part.element) break;
      if (part.listener) {
        part.element.removeEventListener(part.name, part.listener);
        part.listener = null;
      }
      if (typeof value === "function") {
        part.listener = value;
        part.element.addEventListener(part.name, part.listener);
      }
      part.committed = value;
      break;
    }
    case REF_PART: {
      if (!part.element) break;
      if (value && typeof value === "object") {
        value.current = part.element;
      }
      part.committed = value;
      break;
    }
    default:
      break;
  }
}

/**
 * Render a TemplateResult (or null) into a container (Element or ShadowRoot).
 * Commit state is stored on the container, not on the result — so the same
 * result can be rendered into a second container (view-transition outgoing).
 */
export function render(result, container, options = {}) {
  const preserveFocus = options.preserveFocus !== false;
  const snapshot = preserveFocus ? captureFocus(container) : null;

  let state = containerState.get(container);
  if (!state) {
    state = { strings: null, parts: null };
    containerState.set(container, state);
  }

  if (result == null) {
    container.textContent = "";
    state.strings = null;
    state.parts = null;
    if (preserveFocus) restoreFocus(snapshot);
    return;
  }

  // Unwrap keyed at top level
  let top = result;
  if (isKeyed(top)) {
    if (state.key !== top.key) {
      container.textContent = "";
      state.strings = null;
      state.parts = null;
      state.key = top.key;
    }
    top = top.result;
  }

  if (!isTemplateResult(top)) {
    container.textContent = "";
    if (typeof top === "string" || typeof top === "number") {
      container.textContent = String(top);
    }
    state.strings = null;
    state.parts = null;
    if (preserveFocus) restoreFocus(snapshot);
    return;
  }

  const strings = top.strings;
  let prepared = templateCache.get(strings);
  if (!prepared) {
    prepared = prepareTemplate(strings);
    templateCache.set(strings, prepared);
  }

  if (state.strings !== strings) {
    container.textContent = "";
    const instance = createInstance(prepared);
    container.appendChild(instance.fragment);
    state.strings = strings;
    state.parts = instance.parts;
  }

  const values = top.values;
  for (let i = 0; i < state.parts.length; i++) {
    commitPart(state.parts[i], values[i]);
  }

  if (preserveFocus) restoreFocus(snapshot);
}

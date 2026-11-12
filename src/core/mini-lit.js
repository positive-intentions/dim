/**
 * Dim's owned template runtime (replacing Lit for rendering).
 * Parts-based: updates values in place so focus, selection, and child
 * custom-element state survive re-renders.
 */

const global = globalThis;

export const supportsAdoptingStyleSheets =
  global.ShadowRoot &&
  (global.ShadyCSS === undefined || global.ShadyCSS.nativeShadow) &&
  "adoptedStyleSheets" in Document.prototype &&
  "replace" in CSSStyleSheet.prototype;

const constructionToken = Symbol();
const cssTagCache = new WeakMap();

export class CSSResult {
  constructor(cssText, strings, safeToken) {
    this["_$cssResult$"] = true;
    if (safeToken !== constructionToken) {
      throw new Error(
        "CSSResult is not constructable. Use `unsafeCSS` or `css` instead."
      );
    }
    this.cssText = cssText;
    this._strings = strings;
  }
  get styleSheet() {
    let styleSheet = this._styleSheet;
    const strings = this._strings;
    if (supportsAdoptingStyleSheets && styleSheet === undefined) {
      const cacheable = strings !== undefined && strings.length === 1;
      if (cacheable) {
        styleSheet = cssTagCache.get(strings);
      }
      if (styleSheet === undefined) {
        (this._styleSheet = styleSheet = new CSSStyleSheet()).replaceSync(
          this.cssText
        );
        if (cacheable) {
          cssTagCache.set(strings, styleSheet);
        }
      }
    }
    return styleSheet;
  }
  toString() {
    return this.cssText;
  }
}

const textFromCSSResult = (value) => {
  if (value["_$cssResult$"] === true) {
    return value.cssText;
  } else if (typeof value === "number") {
    return value;
  } else {
    throw new Error(
      `Value passed to 'css' function must be a 'css' function result: ` +
        `${value}. Use 'unsafeCSS' to pass non-literal values, but take care ` +
        `to ensure page security.`
    );
  }
};

export const unsafeCSS = (value) =>
  new CSSResult(
    typeof value === "string" ? value : String(value),
    undefined,
    constructionToken
  );

export const css = (strings, ...values) => {
  const cssText =
    strings.length === 1
      ? strings[0]
      : values.reduce(
          (acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1],
          strings[0]
        );
  return new CSSResult(cssText, strings, constructionToken);
};

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

/** @type {1} TemplateResult */
export const HTML_RESULT = 1;
/** @type {2} Keyed wrapper */
export const KEYED_RESULT = 2;
/** @type {3} Unsafe HTML */
export const UNSAFE_HTML_RESULT = 3;

const CHILD_PART = 0;
const ATTR_PART = 1;
const PROP_PART = 2;
const EVENT_PART = 3;
const BOOL_PART = 4;
const REF_PART = 5;

const templateCache = new WeakMap();
const containerState = new WeakMap();

/** Flag set during view-transition two-layer commits to skip focus restore. */
export let skipFocusRestore = false;
export function setSkipFocusRestore(value) {
  skipFocusRestore = !!value;
}

function isTemplateResult(value) {
  return (
    value != null &&
    typeof value === "object" &&
    (value._$dimType$ === HTML_RESULT || value._$litType$ === HTML_RESULT)
  );
}

function isKeyed(value) {
  return value != null && typeof value === "object" && value._$dimType$ === KEYED_RESULT;
}

function isUnsafeHTML(value) {
  return (
    value != null &&
    typeof value === "object" &&
    value._$dimType$ === UNSAFE_HTML_RESULT
  );
}

// ---------------------------------------------------------------------------
// React-like preprocess (JSON-only attr={{}}; self-closing custom elements)
// Cached per template-literal site so strings identity stays stable across
// re-renders (required for parts reuse / focus preservation).
// ---------------------------------------------------------------------------

const processedStringsCache = new WeakMap();

function processStaticStrings(strings) {
  const valueCount = strings.length - 1;
  let fullTemplate = strings[0];
  for (let i = 0; i < valueCount; i++) {
    fullTemplate += `__VALUE_${i}__` + strings[i + 1];
  }

  const original = fullTemplate;

  // Self-closing custom elements: <foo-bar /> → <foo-bar></foo-bar>
  fullTemplate = fullTemplate.replace(
    /<([a-z][a-z0-9]*-[a-z0-9-]*)([^>]*?)\s*\/>/gi,
    "<$1$2></$1>"
  );

  const objectAttrRegex = /(\w+)=\{\{([^}]+)\}\}/g;
  let replacements = [];
  let match;
  while ((match = objectAttrRegex.exec(fullTemplate)) !== null) {
    const [fullMatch, attrName, attrValue] = match;
    try {
      const objValue = JSON.parse("{" + attrValue + "}");
      const jsonString = JSON.stringify(objValue);
      replacements.push({
        from: fullMatch,
        to: `${attrName}='${jsonString}'`,
      });
    } catch (e) {
      console.warn(
        "Failed to parse object attribute as JSON (use .props for functions/non-JSON values):",
        attrValue
      );
    }
  }

  replacements.forEach((replacement) => {
    fullTemplate = fullTemplate.replace(replacement.from, replacement.to);
  });

  if (fullTemplate === original) {
    return strings;
  }

  const parts = fullTemplate.split(/__VALUE_(\d+)__/);
  const newStrings = [];
  newStrings.push(parts[0]);
  for (let i = 1; i < parts.length; i += 2) {
    newStrings.push(parts[i + 1] || "");
  }
  while (newStrings.length < valueCount + 1) {
    newStrings.push("");
  }
  newStrings.raw = [...newStrings];
  return newStrings;
}

/**
 * Enhanced html tagged template — Dim's public template API.
 */
export const html = (strings, ...values) => {
  if (!strings || !strings.raw) {
    if (typeof strings === "string") {
      const templateStrings = [strings];
      templateStrings.raw = [strings];
      return {
        _$dimType$: HTML_RESULT,
        strings: templateStrings,
        values: values,
      };
    }
    return {
      _$dimType$: HTML_RESULT,
      strings,
      values,
    };
  }

  let processedStrings = processedStringsCache.get(strings);
  if (!processedStrings) {
    processedStrings = processStaticStrings(strings);
    processedStringsCache.set(strings, processedStrings);
  }

  return {
    _$dimType$: HTML_RESULT,
    strings: processedStrings,
    values,
  };
};

/**
 * Force fresh DOM when key changes (view transitions).
 */
export function keyed(key, result) {
  return { _$dimType$: KEYED_RESULT, key, result };
}

/**
 * Render a string as HTML (trusted content only).
 */
export function unsafeHTML(value) {
  return { _$dimType$: UNSAFE_HTML_RESULT, value };
}

/**
 * Helper to render children content into a template.
 */
export const renderChildren = (children) => {
  if (!children) return html``;

  if (typeof children === "string") {
    if (
      children.includes("-") &&
      children.includes("<") &&
      children.includes(">")
    ) {
      return html`<slot></slot>`;
    }
    return html`${unsafeHTML(children)}`;
  }

  if (Array.isArray(children)) {
    return html`<slot></slot>`;
  }

  return html`<slot></slot>`;
};

// ---------------------------------------------------------------------------
// Template preparation — marker-based parts
// ---------------------------------------------------------------------------

const COMMENT_MARKER = `<!--{{dim}}-->`;
/** Text sentinel for bindings inside <style>/<script>/<textarea>/<title> */
const TEXT_MARKER = `\uFFF0dim\uFFF1`;
const RAW_TEXT_TAGS = new Set(["style", "script", "textarea", "title"]);

function getBindingKind(stringBefore) {
  // Full binding at end: attr=, .prop=, @event=, ?bool=, ref=
  // e.g. ` @click=`, ` .props=`, ` ?disabled=`, ` class=`, ` ref=`
  const m = stringBefore.match(
    /([.?@])?([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(["']?)$/
  );
  if (m) {
    const prefix = m[1];
    const name = m[2];
    const quote = m[3] || "";
    if (!prefix && name === "ref") {
      return { kind: REF_PART, name: "ref", quote, matchLength: m[0].length };
    }
    if (prefix === ".") {
      return { kind: PROP_PART, name, quote, matchLength: m[0].length };
    }
    if (prefix === "@") {
      return { kind: EVENT_PART, name, quote, matchLength: m[0].length };
    }
    if (prefix === "?") {
      return { kind: BOOL_PART, name, quote, matchLength: m[0].length };
    }
    return { kind: ATTR_PART, name, quote, matchLength: m[0].length, valuePrefix: "", valueSuffix: "" };
  }

  // Partial attribute value: style="background:${x}" or class="a ${b} c"
  // stringBefore ends inside an open quoted attribute value (no closing quote yet).
  const partial = stringBefore.match(
    /([.?@])?([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(["'])([^"']*)$/
  );
  if (partial) {
    const prefix = partial[1];
    const name = partial[2];
    const quote = partial[3];
    const valuePrefix = partial[4];
    // Property/event/boolean shouldn't appear as partial quoted attrs in practice
    if (prefix === "." || prefix === "@" || prefix === "?") {
      return { kind: CHILD_PART };
    }
    return {
      kind: ATTR_PART,
      name,
      quote,
      matchLength: partial[0].length,
      valuePrefix,
      valueSuffix: "", // filled in prepareTemplate from the next string
      partial: true,
    };
  }

  return { kind: CHILD_PART };
}

/**
 * Track whether the end of `htmlSoFar` is inside a raw-text element
 * (style/script/textarea/title) where comment markers become text.
 */
function isInsideRawText(htmlSoFar) {
  const lower = htmlSoFar.toLowerCase();
  let inRaw = null;
  const tagRe = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(lower)) !== null) {
    const name = m[1];
    const isClose = m[0][1] === "/";
    if (RAW_TEXT_TAGS.has(name)) {
      if (isClose) {
        if (inRaw === name) inRaw = null;
      } else if (!inRaw) {
        inRaw = name;
      }
    }
  }
  return inRaw != null;
}

function prepareTemplate(strings) {
  const element = document.createElement("template");
  const segs = [...strings];
  const parts = [];
  let out = "";
  /** @type {{ name: string, quote: string } | null} */
  let openAttr = null;

  for (let i = 0; i < segs.length - 1; i++) {
    const s = segs[i];

    // Continuation of a quoted attribute that still has more interpolations
    // e.g. class="${a} ${b}" — second value sees preceding string " ".
    if (openAttr) {
      const attrName = openAttr.name;
      const quote = openAttr.quote;
      out += ` data-dim-${i}=""`;
      let valueSuffix = "";
      const valuePrefix = s;
      const next = segs[i + 1];
      if (next != null) {
        const closeIdx = next.indexOf(quote);
        if (closeIdx >= 0) {
          valueSuffix = next.slice(0, closeIdx);
          segs[i + 1] = next.slice(closeIdx + 1);
          openAttr = null;
        }
      }
      parts.push({
        kind: ATTR_PART,
        name: attrName,
        valuePrefix,
        valueSuffix,
      });
      continue;
    }

    const binding = getBindingKind(s);
    if (binding.kind === CHILD_PART) {
      const rawText = isInsideRawText(out + s);
      out += s + (rawText ? TEXT_MARKER : COMMENT_MARKER);
      parts.push({ kind: CHILD_PART, rawText });
    } else {
      out += s.slice(0, s.length - binding.matchLength) + ` data-dim-${i}=""`;
      let valueSuffix = binding.valueSuffix || "";
      const valuePrefix = binding.valuePrefix || "";
      // Consume closing quote / remainder of attribute value from next string.
      // Handles class="${x}", class="${x} extra", and class="${a} ${b}".
      if (segs[i + 1] && (binding.kind === ATTR_PART || binding.kind === BOOL_PART)) {
        const quote = binding.quote || (binding.partial ? '"' : "");
        if (quote) {
          const next = segs[i + 1];
          const closeIdx = next.indexOf(quote);
          if (closeIdx > 0) {
            valueSuffix = next.slice(0, closeIdx);
            segs[i + 1] = next.slice(closeIdx + 1);
          } else if (closeIdx === 0) {
            segs[i + 1] = next.slice(1);
          } else if (binding.kind === ATTR_PART) {
            // Closing quote not in this segment — more values follow in the same attr.
            openAttr = { name: binding.name, quote };
          }
        } else if (segs[i + 1][0] === '"' || segs[i + 1][0] === "'") {
          segs[i + 1] = segs[i + 1].slice(1);
        }
      } else if (segs[i + 1] && (segs[i + 1][0] === '"' || segs[i + 1][0] === "'")) {
        segs[i + 1] = segs[i + 1].slice(1);
      }
      parts.push({
        kind: binding.kind,
        name: binding.name,
        valuePrefix,
        valueSuffix,
      });
    }
  }
  out += segs[segs.length - 1];
  element.innerHTML = out;
  return { element, partInfo: parts };
}

function createInstance(template) {
  const { element, partInfo } = template;
  const fragment = element.content.cloneNode(true);
  const parts = [];

  // Walk and collect markers (comments + text sentinels + attr markers)
  const walker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT,
    null
  );

  const attrNodes = [];
  const childMarkers = [];

  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.COMMENT_NODE && node.data === "{{dim}}") {
      childMarkers.push({ type: "comment", node });
    } else if (
      node.nodeType === Node.TEXT_NODE &&
      node.data &&
      node.data.includes(TEXT_MARKER)
    ) {
      childMarkers.push({ type: "text", node });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const attrs = Array.from(node.attributes || []);
      for (const attr of attrs) {
        if (attr.name.startsWith("data-dim-")) {
          const index = parseInt(attr.name.slice("data-dim-".length), 10);
          attrNodes.push({ node, index, attrName: attr.name });
        }
      }
    }
  }

  attrNodes.sort((a, b) => a.index - b.index);

  let childMarkerIndex = 0;
  for (let i = 0; i < partInfo.length; i++) {
    const info = partInfo[i];
    if (info.kind === CHILD_PART) {
      const marker = childMarkers[childMarkerIndex++];
      if (!marker) {
        // Fallback empty range at fragment end
        const start = document.createTextNode("");
        const end = document.createTextNode("");
        fragment.appendChild(start);
        fragment.appendChild(end);
        parts.push({ kind: CHILD_PART, start, end, committed: undefined });
        continue;
      }

      const start = document.createTextNode("");
      const end = document.createTextNode("");

      if (marker.type === "comment") {
        const comment = marker.node;
        comment.parentNode.insertBefore(start, comment);
        comment.parentNode.insertBefore(end, comment);
        comment.parentNode.removeChild(comment);
      } else {
        // Text sentinel may be surrounded by other text in raw-text elements
        const textNode = marker.node;
        const parent = textNode.parentNode;
        const idx = textNode.data.indexOf(TEXT_MARKER);
        const before = textNode.data.slice(0, idx);
        const after = textNode.data.slice(idx + TEXT_MARKER.length);
        if (before) {
          parent.insertBefore(document.createTextNode(before), textNode);
        }
        parent.insertBefore(start, textNode);
        parent.insertBefore(end, textNode);
        if (after) {
          parent.insertBefore(document.createTextNode(after), textNode);
        }
        parent.removeChild(textNode);
      }

      parts.push({
        kind: CHILD_PART,
        start,
        end,
        committed: undefined,
      });
    } else {
      const found = attrNodes.find((a) => a.index === i);
      if (!found) {
        parts.push({ kind: info.kind, name: info.name, element: null });
        continue;
      }
      found.node.removeAttribute(found.attrName);
      parts.push({
        kind: info.kind,
        name: info.name,
        element: found.node,
        listener: null,
        committed: undefined,
        valuePrefix: info.valuePrefix || "",
        valueSuffix: info.valueSuffix || "",
      });
    }
  }

  // Link ATTR parts that share the same element+name so multi-binding
  // attributes (class="${a} ${b}") are committed as one joined string.
  linkAttrGroups(parts);

  return { fragment, parts };
}

function linkAttrGroups(parts) {
  /** @type {Map<Element, Map<string, object[]>>} */
  const byElement = new Map();
  for (const p of parts) {
    if (p.kind !== ATTR_PART || !p.element) continue;
    let byName = byElement.get(p.element);
    if (!byName) {
      byName = new Map();
      byElement.set(p.element, byName);
    }
    let group = byName.get(p.name);
    if (!group) {
      group = [];
      byName.set(p.name, group);
    }
    group.push(p);
  }
  for (const byName of byElement.values()) {
    for (const group of byName.values()) {
      for (const p of group) {
        p.attrGroup = group;
      }
    }
  }
}

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

// ---------------------------------------------------------------------------
// Focus / selection helpers
// ---------------------------------------------------------------------------

function isFormControl(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}

function captureFocus(container) {
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

function restoreFocus(snapshot) {
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

// ---------------------------------------------------------------------------
// Commit values into parts
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// DimElement — LitElement stand-in
// ---------------------------------------------------------------------------

export class DimElement extends HTMLElement {
  constructor() {
    super();
    this.__controllers = [];
    this.__updatePromise = null;
    this.__hasRequestedUpdate = false;
    this.__isConnected = false;
    this.__hasRendered = false;
    this._props = undefined;
    /** @type {ShadowRoot|null} */
    this.renderRoot = null;
  }

  /**
   * Reactive `.props` property (Lit-compatible). Assigning triggers update.
   */
  get props() {
    return this._props;
  }
  set props(value) {
    const prev = this._props;
    this._props = value;
    if (!Object.is(prev, value)) {
      this.requestUpdate();
    }
  }

  createRenderRoot() {
    return this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.__isConnected = true;
    if (!this.renderRoot) {
      this.renderRoot = this.createRenderRoot();
    }
    this.requestUpdate();
    for (const c of this.__controllers) {
      c.hostConnected?.();
    }
  }

  disconnectedCallback() {
    this.__isConnected = false;
    for (const c of this.__controllers) {
      c.hostDisconnected?.();
    }
  }

  addController(controller) {
    this.__controllers.push(controller);
    if (this.__isConnected) {
      controller.hostConnected?.();
    }
  }

  removeController(controller) {
    const i = this.__controllers.indexOf(controller);
    if (i >= 0) this.__controllers.splice(i, 1);
  }

  requestUpdate() {
    if (this.__hasRequestedUpdate) {
      return this.__updatePromise;
    }
    this.__hasRequestedUpdate = true;
    this.__updatePromise = Promise.resolve().then(() => this.__doUpdate());
    return this.__updatePromise;
  }

  get updateComplete() {
    return this.__updatePromise || Promise.resolve(true);
  }

  async __doUpdate() {
    this.__hasRequestedUpdate = false;
    if (!this.renderRoot) {
      this.renderRoot = this.createRenderRoot();
    }
    for (const c of this.__controllers) {
      c.hostUpdate?.();
    }
    // Reset style queue; useStyle pushes entries during render()
    this.__styleQueue = [];
    try {
      const result = this.render();
      render(result, this.renderRoot, { preserveFocus: true });
      // Apply styles after commit so they aren't wiped by the first render clear
      this.__flushStyles();
      this.__hasRendered = true;
      for (const c of this.__controllers) {
        c.hostUpdated?.();
      }
      this.updated();
    } finally {
      // Clear transition-time focus skip after each commit
      setSkipFocusRestore(false);
    }
    return true;
  }

  __flushStyles() {
    const queue = this.__styleQueue;
    if (!queue || !queue.length) return;
    const root = this.shadowRoot || this.renderRoot;
    if (!root) return;
    for (const entry of queue) {
      const { hookName, cssText, cssResult, preferAdopted } = entry;
      let styleElement = root.querySelector(
        `[data-style-hook="${hookName}"]`
      );
      if (!styleElement) {
        if (
          preferAdopted &&
          root.adoptedStyleSheets !== undefined &&
          cssResult?.styleSheet
        ) {
          root.adoptedStyleSheets = [
            ...root.adoptedStyleSheets,
            cssResult.styleSheet,
          ];
          continue;
        }
        styleElement = document.createElement("style");
        styleElement.setAttribute("data-style-hook", hookName);
        root.appendChild(styleElement);
      }
      if (styleElement) {
        styleElement.textContent = cssText;
      }
    }
    this.__styleQueue = [];
  }

  /** Override in subclass / DimComponent */
  render() {
    return html``;
  }

  /** Override — called after render commits */
  updated(_changedProperties) {}
}

// ---------------------------------------------------------------------------
// Debounced dispatcher (store events)
// ---------------------------------------------------------------------------

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
        })
      );
      timeoutIds[eventName] = undefined;
    }, delay);
  };
}

export const debouncedDispatcher = createDebouncedEventDispatcher(200);

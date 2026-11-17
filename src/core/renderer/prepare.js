/**
 * Template preparation — marker-based parts.
 * Pure classification lives in `./pure/`; this module builds the DOM template
 * and live part records.
 */

import {
  CHILD_PART,
  ATTR_PART,
  PROP_PART,
  EVENT_PART,
  BOOL_PART,
  REF_PART,
  COMMENT_MARKER,
  TEXT_MARKER,
  prepare as preparePure,
} from "./pure/index.js";

export {
  CHILD_PART,
  ATTR_PART,
  PROP_PART,
  EVENT_PART,
  BOOL_PART,
  REF_PART,
};

export const templateCache = new WeakMap();

/**
 * Prepare strings into a `<template>` element plus part-info list.
 * @param {TemplateStringsArray|string[]} strings
 */
let dimTrustedTypesPolicy = null;
function toTrustedHtml(htmlString) {
  if (dimTrustedTypesPolicy === null) {
    const tt = globalThis.trustedTypes;
    if (tt && typeof tt.createPolicy === "function") {
      try {
        dimTrustedTypesPolicy = tt.createPolicy("dim", {
          createHTML: (s) => s,
        });
      } catch {
        dimTrustedTypesPolicy =
          typeof tt.getPolicy === "function" ? tt.getPolicy("dim") : undefined;
      }
    } else {
      dimTrustedTypesPolicy = undefined;
    }
  }
  return dimTrustedTypesPolicy
    ? dimTrustedTypesPolicy.createHTML(htmlString)
    : htmlString;
}

export function prepareTemplate(strings) {
  const pure = preparePure(strings);
  const element = document.createElement("template");
  element.innerHTML = toTrustedHtml(pure.html);
  return {
    element,
    partInfo: pure.parts.map((p) => ({
      kind: p.kind,
      name: p.name,
      valuePrefix: p.valuePrefix,
      valueSuffix: p.valueSuffix,
      rawText: p.rawText,
    })),
  };
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

export function createInstance(template) {
  const { element, partInfo } = template;
  const fragment = element.content.cloneNode(true);
  const parts = [];

  const walker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT,
    null,
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

  linkAttrGroups(parts);

  return { fragment, parts };
}

// Re-export markers for tests / WASM parity
export { COMMENT_MARKER, TEXT_MARKER };

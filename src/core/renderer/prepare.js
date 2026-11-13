/**
 * Template preparation — marker-based parts.
 * Turns html strings into a <template> plus a part-info list, then
 * instantiates a fragment with live part records.
 */

export const CHILD_PART = 0;
export const ATTR_PART = 1;
export const PROP_PART = 2;
export const EVENT_PART = 3;
export const BOOL_PART = 4;
export const REF_PART = 5;

export const templateCache = new WeakMap();

const COMMENT_MARKER = `<!--{{dim}}-->`;
/** Text sentinel for bindings inside <style>/<script>/<textarea>/<title> */
const TEXT_MARKER = `\uFFF0dim\uFFF1`;
const RAW_TEXT_TAGS = new Set(["style", "script", "textarea", "title"]);

function getBindingKind(stringBefore) {
  // Full binding at end: attr=, .prop=, @event=, ?bool=, ref=
  // e.g. ` @click=`, ` .props=`, ` ?disabled=`, ` class=`, ` ref=`
  const m = stringBefore.match(
    /([.?@])?([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(["']?)$/,
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
    return {
      kind: ATTR_PART,
      name,
      quote,
      matchLength: m[0].length,
      valuePrefix: "",
      valueSuffix: "",
    };
  }

  // Partial attribute value: style="background:${x}" or class="a ${b} c"
  // stringBefore ends inside an open quoted attribute value (no closing quote yet).
  const partial = stringBefore.match(
    /([.?@])?([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(["'])([^"']*)$/,
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

export function prepareTemplate(strings) {
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
      if (
        segs[i + 1] &&
        (binding.kind === ATTR_PART || binding.kind === BOOL_PART)
      ) {
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
      } else if (
        segs[i + 1] &&
        (segs[i + 1][0] === '"' || segs[i + 1][0] === "'")
      ) {
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

  // Walk and collect markers (comments + text sentinels + attr markers)
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

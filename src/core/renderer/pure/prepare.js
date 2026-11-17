/**
 * DOM-free template preparation — mirrors rust/dim-spec-core.
 * Output shape (JSON-serializable):
 *   { html: string, parts: [{ kind, name, valuePrefix, valueSuffix, rawText }] }
 */

import {
  CHILD_PART,
  ATTR_PART,
  BOOL_PART,
  PROP_PART,
  EVENT_PART,
  REF_PART,
  checkBindingPolicy,
} from "./policy.js";

export { CHILD_PART, ATTR_PART, PROP_PART, EVENT_PART, BOOL_PART, REF_PART };

export const COMMENT_MARKER = `<!--{{dim}}-->`;
export const TEXT_MARKER = `\uFFF0dim\uFFF1`;
const RAW_TEXT_TAGS = new Set(["style", "script", "textarea", "title"]);

/**
 * @param {string} stringBefore
 */
export function getBindingKind(stringBefore) {
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

  const partial = stringBefore.match(
    /([.?@])?([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(["'])([^"']*)$/,
  );
  if (partial) {
    const prefix = partial[1];
    const name = partial[2];
    const quote = partial[3];
    const valuePrefix = partial[4];
    if (prefix === "." || prefix === "@" || prefix === "?") {
      return { kind: CHILD_PART };
    }
    return {
      kind: ATTR_PART,
      name,
      quote,
      matchLength: partial[0].length,
      valuePrefix,
      valueSuffix: "",
      partial: true,
    };
  }

  return { kind: CHILD_PART };
}

/**
 * @param {string} htmlSoFar
 */
export function isInsideRawText(htmlSoFar) {
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

/**
 * Pure prepare: strings → { html, parts }. Throws on policy violations.
 * @param {string[]|ArrayLike<string>} strings
 * @returns {{ html: string, parts: object[] }}
 */
export function prepare(strings) {
  const segs = Array.from(strings, (s) => String(s));
  const parts = [];
  let out = "";
  /** @type {{ name: string, quote: string } | null} */
  let openAttr = null;

  if (segs.length === 0) {
    return { html: out, parts };
  }

  for (let i = 0; i < segs.length - 1; i++) {
    const s = segs[i];

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
      const policy = checkBindingPolicy(ATTR_PART, attrName);
      if (!policy.ok) throw new Error(policy.reason);
      parts.push({
        kind: ATTR_PART,
        name: attrName,
        valuePrefix,
        valueSuffix,
        rawText: false,
      });
      continue;
    }

    const binding = getBindingKind(s);
    if (binding.kind === CHILD_PART) {
      const rawText = isInsideRawText(out + s);
      out += s + (rawText ? TEXT_MARKER : COMMENT_MARKER);
      parts.push({
        kind: CHILD_PART,
        name: "",
        valuePrefix: "",
        valueSuffix: "",
        rawText,
      });
    } else {
      const policy = checkBindingPolicy(binding.kind, binding.name);
      if (!policy.ok) throw new Error(policy.reason);

      out += s.slice(0, s.length - binding.matchLength) + ` data-dim-${i}=""`;
      let valueSuffix = binding.valueSuffix || "";
      const valuePrefix = binding.valuePrefix || "";
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
        rawText: false,
      });
    }
  }
  out += segs[segs.length - 1];
  return { html: out, parts };
}

/**
 * JSON-serializable prepare result for the Lean oracle / differential tests.
 * @param {string[]} strings
 */
export function prepareToJson(strings) {
  const { html, parts } = prepare(strings);
  return {
    html,
    parts: parts.map((p) => ({
      kind: p.kind,
      name: p.name || "",
      valuePrefix: p.valuePrefix || "",
      valueSuffix: p.valueSuffix || "",
      rawText: !!p.rawText,
    })),
  };
}

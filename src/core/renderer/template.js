/**
 * Template result types and the public `html` tagged template.
 * Parts-based: updates values in place so focus, selection, and child
 * custom-element state survive re-renders.
 */

/** @type {1} TemplateResult */
export const HTML_RESULT = 1;
/** @type {2} Keyed wrapper */
export const KEYED_RESULT = 2;
/** @type {3} Unsafe HTML */
export const UNSAFE_HTML_RESULT = 3;

export function isTemplateResult(value) {
  return (
    value != null &&
    typeof value === "object" &&
    value._$dimType$ === HTML_RESULT
  );
}

export function isKeyed(value) {
  return (
    value != null &&
    typeof value === "object" &&
    value._$dimType$ === KEYED_RESULT
  );
}

export function isUnsafeHTML(value) {
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
    "<$1$2></$1>",
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
        attrValue,
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

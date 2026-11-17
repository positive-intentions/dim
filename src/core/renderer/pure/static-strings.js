/**
 * React-like preprocess for static template strings (DOM-free).
 */

function isCustomTagChar(c) {
  return /[a-zA-Z0-9-]/.test(c);
}

/**
 * `<foo-bar ... />` → `<foo-bar ...></foo-bar>` (custom elements only).
 * @param {string} input
 */
export function expandSelfClosing(input) {
  return input.replace(
    /<([a-z][a-z0-9]*-[a-z0-9-]*)([^>]*?)\s*\/>/gi,
    "<$1$2></$1>",
  );
}

/**
 * @param {string[]} strings
 * @param {(body: string) => string|null|undefined} normalizeJson
 *   receives `{body}` and returns canonical JSON or null/undefined on failure
 * @returns {string[]|null} new strings, or null when unchanged
 */
export function processStaticStrings(strings, normalizeJson) {
  if (!strings || strings.length === 0) return null;
  const valueCount = strings.length - 1;
  let fullTemplate = strings[0];
  for (let i = 0; i < valueCount; i++) {
    fullTemplate += `__VALUE_${i}__` + strings[i + 1];
  }

  const original = fullTemplate;
  fullTemplate = expandSelfClosing(fullTemplate);

  const objectAttrRegex = /(\w+)=\{\{([^}]+)\}\}/g;
  const replacements = [];
  let match;
  while ((match = objectAttrRegex.exec(fullTemplate)) !== null) {
    const [fullMatch, attrName, attrValue] = match;
    const json = normalizeJson("{" + attrValue + "}");
    if (json != null) {
      replacements.push({
        from: fullMatch,
        to: `${attrName}='${json}'`,
      });
    }
  }

  for (const replacement of replacements) {
    fullTemplate = fullTemplate.replace(replacement.from, replacement.to);
  }

  if (fullTemplate === original) {
    return null;
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
  return newStrings;
}

export { isCustomTagChar };

/**
 * Attribute / props helpers for DimComponent.render().
 * HTML lowercases attribute names, so lookups are case-insensitive.
 */

export function parseAttributes(element) {
  return Array.from(element.attributes).reduce((acc, attr) => {
    let value = attr.value;

    // Try to parse JSON-like object attributes
    if (value && (value.startsWith("{") || value.startsWith("["))) {
      try {
        value = JSON.parse(value);
      } catch (e) {
        // If parsing fails, keep original string value
      }
    }

    acc[attr.name] = value;
    return acc;
  }, {});
}

export function readProp(obj, name) {
  if (obj[name] !== undefined) return obj[name];
  const lower = name.toLowerCase();
  const key = Object.keys(obj).find((k) => k.toLowerCase() === lower);
  return key !== undefined ? obj[key] : undefined;
}

/**
 * Wrap merged attributes + host props in a case-insensitive proxy so
 * components can read camelCase attributes even though the DOM stores
 * them lowercased.
 */
export function createComponentProps(
  attributes,
  hostProps,
  children,
  childElements
) {
  const rawProps = {
    ...attributes,
    ...hostProps,
    children,
    childElements,
  };
  return new Proxy(rawProps, {
    get(target, key) {
      if (typeof key === "string" && !(key in target)) {
        const lower = key.toLowerCase();
        const match = Object.keys(target).find(
          (k) => k.toLowerCase() === lower
        );
        if (match !== undefined) return target[match];
      }
      return target[key];
    },
  });
}

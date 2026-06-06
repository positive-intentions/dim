

const global = globalThis;

export const supportsAdoptingStyleSheets = global.ShadowRoot &&
    (global.ShadyCSS === undefined || global.ShadyCSS.nativeShadow) &&
    'adoptedStyleSheets' in Document.prototype &&
    'replace' in CSSStyleSheet.prototype;
const constructionToken = Symbol();
const cssTagCache = new WeakMap();

export class CSSResult {
    constructor(cssText, strings, safeToken) {
        // This property needs to remain unminified.
        this['_$cssResult$'] = true;
        if (safeToken !== constructionToken) {
            throw new Error('CSSResult is not constructable. Use `unsafeCSS` or `css` instead.');
        }
        this.cssText = cssText;
        this._strings = strings;
    }
    // This is a getter so that it's lazy. In practice, this means stylesheets
    // are not created until the first element instance is made.
    get styleSheet() {
        // If `supportsAdoptingStyleSheets` is true then we assume CSSStyleSheet is
        // constructable.
        let styleSheet = this._styleSheet;
        const strings = this._strings;
        if (supportsAdoptingStyleSheets && styleSheet === undefined) {
            const cacheable = strings !== undefined && strings.length === 1;
            if (cacheable) {
                styleSheet = cssTagCache.get(strings);
            }
            if (styleSheet === undefined) {
                (this._styleSheet = styleSheet = new CSSStyleSheet()).replaceSync(this.cssText);
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
    // This property needs to remain unminified.
    if (value['_$cssResult$'] === true) {
        return value.cssText;
    }
    else if (typeof value === 'number') {
        return value;
    }
    else {
        throw new Error(`Value passed to 'css' function must be a 'css' function result: ` +
            `${value}. Use 'unsafeCSS' to pass non-literal values, but take care ` +
            `to ensure page security.`);
    }
};

export const unsafeCSS = (value) => new CSSResult(typeof value === 'string' ? value : String(value), undefined, constructionToken);


export const css = (strings, ...values) => {
    const cssText = strings.length === 1
        ? strings[0]
        : values.reduce((acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1], strings[0]);
    return new CSSResult(cssText, strings, constructionToken);
};

// Helper to render children content
// Note: This is a placeholder - renderChildren should be passed as a dependency
export const renderChildren = (children) => {
    // This function should be called with html available in context
    // For now, return a basic template
    if (!children) return null;
    
    // If children is a string (innerHTML), return it directly
    if (typeof children === 'string') {
        return children;
    }
    
    // If children is an array of elements, join them
    if (Array.isArray(children)) {
        return children;
    }
    
    // Default
    return children;
};

// Helper to create unsafe HTML content
export const unsafeHTML = (htmlString) => {
    const template = document.createElement('template');
    template.innerHTML = htmlString;
    return template.content;
};

function createDebouncedEventDispatcher(
    delay
  ) {
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
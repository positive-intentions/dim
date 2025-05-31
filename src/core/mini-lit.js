

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

export const createHtmlElement = ({ strings, values }) => {
    console.log('createHtmlElement called with:', { strings, values });
    // Create a template element for parsing and detaching later
    const template = document.createElement("template");
    const rawHTML = strings.reduce((acc, string, index) => {
        let value = values[index];
        
        // Handle different types of values
        if (value !== undefined) {
            if (Array.isArray(value)) {
                // Handle arrays (like lists of components)
                value = value
                    .map((v) => {
                        console.log('Processing array value:', v, 'type:', typeof v);
                        if (v && v._$litType$ === 1) {
                            // It's a template result, process it recursively
                            const temp = document.createElement('div');
                            const processed = createHtmlElement({ strings: v.strings, values: v.values });
                            temp.appendChild(processed);
                            return temp.innerHTML;
                        } else if (v instanceof Node) {
                            const temp = document.createElement('div');
                            temp.appendChild(v);
                            return temp.innerHTML;
                        } else {
                            return String(v);
                        }
                    })
                    .join("");
            } else if (typeof value === 'object' && value !== null && !value._$litType$) {
                // It's a plain object (like props), convert to JSON for attribute binding
                value = JSON.stringify(value);
            } else if (value && value._$litType$ === 1) {
                // It's a nested template
                const temp = document.createElement('div');
                const processed = createHtmlElement({ strings: value.strings, values: value.values });
                temp.appendChild(processed);
                value = temp.innerHTML;
            }
            // For strings, numbers, booleans, just use them as-is
        }

        return acc + string + (value !== undefined ? value : "");
    }, "");
    template.innerHTML = rawHTML.trim();

    // Extract the content fragment from the template
    const fragment = template.content.cloneNode(true); // Clone to avoid affecting the original template

    // Keep track of the current value index
    let valueIndex = 0;

    fragment.querySelectorAll("*").forEach((element) => {
        // Process element attributes
        const attributes = Array.from(element.attributes);
        attributes.forEach((attr) => {
            if (attr.name.startsWith("@")) {
                // Handle event listeners (e.g., @click)
                const eventPropName = attr.name.slice(1); // Remove '@' prefix
                const boundValue = values[valueIndex]; // Get the corresponding value

                if (typeof boundValue === "function") {
                    element.addEventListener(eventPropName, boundValue);
                } else {
                    console.warn(
                        `Expected a function for ${eventPropName}, but got:`,
                        boundValue
                    );
                }

                element.removeAttribute(attr.name); // Prevent attribute rendering
                //set focus on the element
                element.focus();

                valueIndex++;
            } else if (attr.name.startsWith(".")) {
                // Handle property bindings (e.g., .value)
                const propName = attr.name.slice(1); // Remove '.' prefix
                const boundValue = values[valueIndex]; // Get the corresponding value

                if (boundValue !== undefined && boundValue !== null) {
                    element[propName] = boundValue;
                } else {
                    console.warn(
                        `Expected a value for ${propName}, but got:`,
                        boundValue
                    );
                }

                element.removeAttribute(attr.name); // Prevent attribute rendering
                valueIndex++;
            }
        });
    });

    // Detach the template to avoid unnecessary DOM manipulation
    template.remove();

    return fragment;
}

export function expandSelfClosingTags(inputStrings, ...values) {

    let strings = inputStrings.map(str => `${str}`);
    for (let i = 0; i < strings.length; i++) {
        const selfClosingTagPosition = strings[i].indexOf('/>');
        if (selfClosingTagPosition == -1) {
            continue;
        }

        // you needs to scan in reverse the strings array from the self closing tag to determine the nearest opening tag name
        let openingTagName = '';
        for (let j = i; j >= 0; j--) {
            if (strings[j].includes('<') && strings[j].includes('>')) {
                // scan in reverse order for the opening tag from the closing tag position
                let seekingposition = {
                    stringIndex: j,
                    charIndex: selfClosingTagPosition
                }

                while (seekingposition.charIndex >= 0 && seekingposition.stringIndex >= 0) {
                    if (strings[seekingposition.stringIndex][seekingposition.charIndex] === '<') {
                        break;
                    }
                    seekingposition.charIndex--;
                    if (seekingposition.charIndex < 0) {
                        if (seekingposition.stringIndex > 0) seekingposition.stringIndex--;
                        seekingposition.charIndex = strings[seekingposition.stringIndex].length - 1;
                    }
                }

                const openingTagString = strings[seekingposition.stringIndex].substring(seekingposition.charIndex + 1);
                const tagnameEndPosition = openingTagString.indexOf(' ');
                if (tagnameEndPosition >= 0) {
                    openingTagName = openingTagString.substring(0, tagnameEndPosition);
                }
                else {
                    openingTagName = openingTagString.substring(0, openingTagString.indexOf('>'));
                }
                console.log({ openingTagName })

                if (selfClosingTagPosition >= 0) {
                    strings[i] = strings[i].replace('/>', `></${openingTagName}>`);

                    console.log('string updated:', strings[i]);
                }

            }
        }
    }

    console.log({ inputStrings, strings, values });

    return html(inputStrings, ...values); // Return the modified strings and values
}

export const html = (strings, ...values) => {
    return ({
        // This property needs to remain unminified.
        ["_$litType$"]: 1,
        strings,
        values,
    });
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
  
  export const debouncedDispatcher = createDebouncedEventDispatcher(10);

// Basic LitElement implementation for browser compatibility
export class LitElement extends HTMLElement {
    static get properties() {
        return {};
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._updatePromise = null;
        this._hasRequestedUpdate = false;
        this._propertiesEnabled = false;
    }

    connectedCallback() {
        this._enableProperties();
        // Perform initial render
        this._performUpdate();
    }

    disconnectedCallback() {
        // Override in subclasses if needed
    }

    _enableProperties() {
        if (this._propertiesEnabled) {
            return;
        }
        this._propertiesEnabled = true;
        const props = this.constructor.properties;
        for (const prop in props) {
            this._createProperty(prop, props[prop]);
        }
    }

    _createProperty(name, options) {
        // Skip if property already exists
        if (this.hasOwnProperty(name)) {
            return;
        }
        
        const descriptor = {
            get() {
                return this[`_${name}`];
            },
            set(value) {
                const oldValue = this[`_${name}`];
                if (oldValue !== value) {
                    this[`_${name}`] = value;
                    this.requestUpdate(name, oldValue);
                }
            },
            enumerable: true,
            configurable: true,
        };
        Object.defineProperty(this, name, descriptor);
    }

    requestUpdate(name, oldValue) {
        if (!this._hasRequestedUpdate) {
            this._hasRequestedUpdate = true;
            this._enqueueUpdate();
        }
        return this.updateComplete;
    }

    async _enqueueUpdate() {
        await new Promise((resolve) => requestAnimationFrame(resolve));
        this._performUpdate();
    }

    _performUpdate() {
        this._hasRequestedUpdate = false;
        this.update();
    }

    update() {
        const result = this.render();
        if (result && result._$litType$ === 1) {
            this.shadowRoot.innerHTML = '';
            const template = createHtmlElement({ strings: result.strings, values: result.values });
            this.shadowRoot.appendChild(template);
        }
    }

    render() {
        // Override in subclasses
        return html``;
    }

    get updateComplete() {
        if (!this._updatePromise) {
            this._updatePromise = new Promise((resolve) => {
                requestAnimationFrame(() => {
                    this._updatePromise = null;
                    resolve(true);
                });
            });
        }
        return this._updatePromise;
    }

    addController(controller) {
        // Basic controller support
        if (controller.hostConnected) {
            controller.hostConnected();
        }
        // Store controller for disconnect handling
        this._controllers = this._controllers || [];
        this._controllers.push(controller);
    }
}
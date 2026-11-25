var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/core/store/crypto-manager.js
var crypto_manager_exports = {};
__export(crypto_manager_exports, {
  default: () => crypto_manager_default
});
var DEFAULT_ITERATIONS, PAYLOAD_VERSION, CryptoManager, crypto_manager_default;
var init_crypto_manager = __esm({
  "src/core/store/crypto-manager.js"() {
    DEFAULT_ITERATIONS = 1e6;
    PAYLOAD_VERSION = 2;
    CryptoManager = class {
      /**
       * @param {string} password
       * @param {{ iterations?: number }} [options]
       */
      constructor(password, options = {}) {
        this.password = password;
        this.iterations = options.iterations || DEFAULT_ITERATIONS;
        this._keyCache = /* @__PURE__ */ new Map();
        this.key = null;
        this.keyPromise = null;
      }
      arrayBufferToString(buffer) {
        const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
        let binaryString = "";
        const chunkSize = 8192;
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize);
          binaryString += String.fromCharCode.apply(null, chunk);
        }
        return btoa(binaryString);
      }
      stringToArrayBuffer(str) {
        const binaryString = atob(str);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
      }
      // Derive the deterministic fallback salt for a password (legacy decrypt only).
      async _fallbackSalt(password) {
        const encoder = new TextEncoder();
        const hash = await crypto.subtle.digest(
          "SHA-256",
          encoder.encode(password)
        );
        return new Uint8Array(hash);
      }
      /**
       * Derive an AES-GCM key from a password and salt using PBKDF2.
       * Keys are non-extractable.
       * @param {string} password
       * @param {Uint8Array|ArrayBuffer} [salt]
       * @param {number} [iterations]
       * @returns {Promise<CryptoKey>}
       */
      async getKeyFromPassword(password, salt, iterations) {
        const encoder = new TextEncoder();
        const iter = iterations || this.iterations;
        let saltBytes;
        if (salt === void 0 || salt === null) {
          saltBytes = await this._fallbackSalt(password);
        } else {
          saltBytes = salt instanceof Uint8Array ? salt : new Uint8Array(salt);
        }
        const cacheKey = `${iter}::${this.arrayBufferToString(saltBytes)}`;
        if (this._keyCache.has(cacheKey)) {
          return this._keyCache.get(cacheKey);
        }
        const keyPromise = (async () => {
          const passwordKey = await crypto.subtle.importKey(
            "raw",
            encoder.encode(password),
            "PBKDF2",
            false,
            ["deriveKey"]
          );
          return crypto.subtle.deriveKey(
            {
              name: "PBKDF2",
              salt: saltBytes,
              iterations: iter,
              hash: "SHA-256"
            },
            passwordKey,
            {
              name: "AES-GCM",
              length: 256
            },
            false,
            // non-extractable
            ["encrypt", "decrypt"]
          );
        })();
        this._keyCache.set(cacheKey, keyPromise);
        return keyPromise;
      }
      // Legacy wrapper — still derives with fallback salt (decrypt/compat only).
      async generateKey(password) {
        const key = await this.getKeyFromPassword(password);
        this.key = key;
        this.keyPromise = Promise.resolve(key);
        return key;
      }
      async encryptData(data) {
        const enc = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const key = await this.getKeyFromPassword(this.password, salt, this.iterations);
        const dataString = typeof data === "string" ? data : JSON.stringify(data);
        const encryptedData = await crypto.subtle.encrypt(
          {
            name: "AES-GCM",
            iv
          },
          key,
          enc.encode(dataString)
        );
        return JSON.stringify({
          v: PAYLOAD_VERSION,
          iter: this.iterations,
          salt: this.arrayBufferToString(salt),
          iv: this.arrayBufferToString(iv),
          encryptedData: this.arrayBufferToString(encryptedData)
        });
      }
      async decryptData(encryptedPayload) {
        let payload;
        if (typeof encryptedPayload === "string") {
          try {
            payload = JSON.parse(encryptedPayload);
          } catch {
            throw new Error("Invalid encrypted payload format");
          }
        } else {
          payload = encryptedPayload;
        }
        if (!payload || typeof payload !== "object") {
          throw new Error("Invalid encrypted payload format");
        }
        const encryptedData = payload.encryptedData || payload.data;
        const { iv, salt, iter } = payload;
        if (!encryptedData || !iv) {
          throw new Error("Invalid encrypted payload: missing encryptedData or iv");
        }
        if (typeof encryptedData === "object" || typeof iv === "object") {
          throw new Error(
            "Invalid encrypted payload: encryptedData and iv must be strings"
          );
        }
        const saltBytes = salt ? new Uint8Array(this.stringToArrayBuffer(salt)) : void 0;
        const iterations = typeof iter === "number" && iter > 0 ? iter : this.iterations;
        const key = await this.getKeyFromPassword(
          this.password,
          saltBytes,
          iterations
        );
        try {
          const decryptedData = await crypto.subtle.decrypt(
            {
              name: "AES-GCM",
              iv: this.stringToArrayBuffer(iv)
            },
            key,
            this.stringToArrayBuffer(encryptedData)
          );
          const dec = new TextDecoder();
          const decryptedString = dec.decode(decryptedData);
          try {
            const parsed = JSON.parse(decryptedString);
            if (parsed && typeof parsed === "object" && parsed.encryptedData && parsed.iv) {
              throw new Error(
                "Decryption returned encrypted payload structure - possible password mismatch or corruption"
              );
            }
            return parsed;
          } catch (parseError) {
            if (decryptedString.includes("encryptedData") && decryptedString.includes("iv")) {
              throw new Error(
                "Decryption returned encrypted payload structure - possible password mismatch"
              );
            }
            if (parseError instanceof Error && parseError.message.includes("encrypted payload structure")) {
              throw parseError;
            }
            return decryptedString;
          }
        } catch (error) {
          const errorMessage = error.message || String(error);
          if (errorMessage.includes("OperationError") || errorMessage.includes("decrypt") || errorMessage.includes("AES-GCM")) {
            throw new Error(
              "Decryption failed: Incorrect password or corrupted data"
            );
          }
          throw new Error("Decryption failed: " + errorMessage);
        }
      }
    };
    crypto_manager_default = CryptoManager;
  }
});

// src/core/renderer/css.js
var global = globalThis;
var supportsAdoptingStyleSheets = global.ShadowRoot && (global.ShadyCSS === void 0 || global.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var constructionToken = /* @__PURE__ */ Symbol();
var cssTagCache = /* @__PURE__ */ new WeakMap();
var CSSResult = class {
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
    if (supportsAdoptingStyleSheets && styleSheet === void 0) {
      const cacheable = strings !== void 0 && strings.length === 1;
      if (cacheable) {
        styleSheet = cssTagCache.get(strings);
      }
      if (styleSheet === void 0) {
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
};
var textFromCSSResult = (value) => {
  if (value["_$cssResult$"] === true) {
    return value.cssText;
  } else if (typeof value === "number") {
    return value;
  } else {
    throw new Error(
      `Value passed to 'css' function must be a 'css' function result: ${value}. Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.`
    );
  }
};
var unsafeCSS = (value) => new CSSResult(
  typeof value === "string" ? value : String(value),
  void 0,
  constructionToken
);
var css = (strings, ...values) => {
  const cssText = strings.length === 1 ? strings[0] : values.reduce(
    (acc, v, idx) => acc + textFromCSSResult(v) + strings[idx + 1],
    strings[0]
  );
  return new CSSResult(cssText, strings, constructionToken);
};

// src/core/renderer/pure/static-strings.js
function expandSelfClosing(input) {
  return input.replace(
    /<([a-z][a-z0-9]*-[a-z0-9-]*)([^>]*?)\s*\/>/gi,
    "<$1$2></$1>"
  );
}
function processStaticStrings(strings, normalizeJson) {
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
        to: `${attrName}='${json}'`
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

// src/core/renderer/template.js
var HTML_RESULT = 1;
var KEYED_RESULT = 2;
var UNSAFE_HTML_RESULT = 3;
function isTemplateResult(value) {
  return value != null && typeof value === "object" && value._$dimType$ === HTML_RESULT;
}
function isKeyed(value) {
  return value != null && typeof value === "object" && value._$dimType$ === KEYED_RESULT;
}
function isUnsafeHTML(value) {
  return value != null && typeof value === "object" && value._$dimType$ === UNSAFE_HTML_RESULT;
}
var processedStringsCache = /* @__PURE__ */ new WeakMap();
function normalizeJsonObjectLiteral(bodyWithBraces) {
  try {
    const objValue = JSON.parse(bodyWithBraces);
    return JSON.stringify(objValue);
  } catch {
    console.warn(
      "Failed to parse object attribute as JSON (use .props for functions/non-JSON values):",
      bodyWithBraces
    );
    return null;
  }
}
function processCached(strings) {
  const processed = processStaticStrings(strings, normalizeJsonObjectLiteral);
  if (!processed) return strings;
  processed.raw = [...processed];
  return processed;
}
var html = (strings, ...values) => {
  if (!strings || typeof strings !== "object" || !Array.isArray(strings.raw) || !Array.isArray(strings)) {
    throw new Error(
      "html`...` requires a template literal (TemplateStringsArray with .raw). Do not call html() with a plain string or crafted array."
    );
  }
  let processedStrings = processedStringsCache.get(strings);
  if (!processedStrings) {
    processedStrings = processCached(strings);
    processedStringsCache.set(strings, processedStrings);
  }
  return {
    _$dimType$: HTML_RESULT,
    strings: processedStrings,
    values
  };
};
function keyed(key, result) {
  return { _$dimType$: KEYED_RESULT, key, result };
}
function unsafeHTML(value) {
  return { _$dimType$: UNSAFE_HTML_RESULT, value };
}
var renderChildren = (children) => {
  if (!children) return html``;
  if (typeof children === "string") {
    return html`${children}`;
  }
  if (Array.isArray(children)) {
    return html`<slot></slot>`;
  }
  return html`<slot></slot>`;
};

// src/core/renderer/focus.js
var skipFocusRestore = false;
function setSkipFocusRestore(value) {
  skipFocusRestore = !!value;
}
function isFormControl(el) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
}
function captureFocus(container) {
  if (skipFocusRestore) return null;
  const root = container instanceof ShadowRoot ? container : container.getRootNode?.() || container;
  let active = null;
  try {
    active = root.activeElement || (typeof document !== "undefined" ? document.activeElement : null);
  } catch (_) {
    active = typeof document !== "undefined" ? document.activeElement : null;
  }
  if (!active || !isFormControl(active)) return null;
  if (!container.contains(active) && container !== active) {
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
    if (typeof selectionStart === "number" && typeof el.setSelectionRange === "function") {
      el.setSelectionRange(selectionStart, selectionEnd);
    }
  } catch (_) {
  }
}

// src/core/renderer/pure/policy.js
var CHILD_PART = 0;
var ATTR_PART = 1;
var PROP_PART = 2;
var EVENT_PART = 3;
var BOOL_PART = 4;
var REF_PART = 5;
var FORBIDDEN_ATTR_NAMES = /* @__PURE__ */ new Set(["srcdoc"]);
var FORBIDDEN_PROP_NAMES = /* @__PURE__ */ new Set(["innerHTML", "outerHTML"]);
var URL_ATTR_NAMES = /* @__PURE__ */ new Set([
  "href",
  "src",
  "action",
  "formaction",
  "xlink:href",
  "poster",
  "ping"
]);
var ALLOWED_SCHEMES = /* @__PURE__ */ new Set(["http:", "https:", "mailto:", "tel:"]);
function isEventHandlerAttr(name) {
  if (!name || name.length < 3) return false;
  const lower2 = name.toLowerCase();
  return lower2.startsWith("on") && /^[a-z]+$/.test(lower2.slice(2));
}
function checkBindingPolicy(kind, name) {
  if (kind === ATTR_PART) {
    const lower2 = String(name || "").toLowerCase();
    if (isEventHandlerAttr(lower2)) {
      return {
        ok: false,
        reason: `Attribute binding "${name}" is forbidden; use @${lower2.slice(2)} instead of on* attributes`
      };
    }
    if (FORBIDDEN_ATTR_NAMES.has(lower2)) {
      return {
        ok: false,
        reason: `Attribute binding "${name}" is forbidden`
      };
    }
  }
  if (kind === PROP_PART) {
    if (FORBIDDEN_PROP_NAMES.has(String(name || ""))) {
      return {
        ok: false,
        reason: `Property binding ".${name}" is forbidden; use text children or unsafeHTML for trusted HTML`
      };
    }
  }
  return { ok: true };
}
function sanitizeUrl(name, value) {
  if (value == null || value === false) return "";
  const raw = String(value).trim();
  if (!raw) return "";
  const lowerName = String(name || "").toLowerCase();
  const lower2 = raw.toLowerCase();
  if (raw.startsWith("//")) {
    return "about:invalid#dim";
  }
  const colon = raw.indexOf(":");
  if (colon > 0) {
    const scheme = lower2.slice(0, colon + 1);
    if (ALLOWED_SCHEMES.has(scheme)) {
      return raw;
    }
    if (lowerName === "src" && scheme === "data:" && /^data:image\/[a-z0-9.+-]+/i.test(raw)) {
      return raw;
    }
    if (scheme === "about:" && lower2.startsWith("about:invalid")) {
      return "about:invalid#dim";
    }
    return "about:invalid#dim";
  }
  return raw;
}
function isUrlAttr(name) {
  return URL_ATTR_NAMES.has(String(name || "").toLowerCase());
}
function escapeText(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// src/core/renderer/pure/prepare.js
var COMMENT_MARKER = `<!--{{dim}}-->`;
var TEXT_MARKER = `\uFFF0dim\uFFF1`;
var RAW_TEXT_TAGS = /* @__PURE__ */ new Set(["style", "script", "textarea", "title"]);
function getBindingKind(stringBefore) {
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
    return {
      kind: ATTR_PART,
      name,
      quote,
      matchLength: m[0].length,
      valuePrefix: "",
      valueSuffix: ""
    };
  }
  const partial = stringBefore.match(
    /([.?@])?([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(["'])([^"']*)$/
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
      partial: true
    };
  }
  return { kind: CHILD_PART };
}
function isInsideRawText(htmlSoFar) {
  const lower2 = htmlSoFar.toLowerCase();
  let inRaw = null;
  const tagRe = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  let m;
  while ((m = tagRe.exec(lower2)) !== null) {
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
function prepare(strings) {
  const segs = Array.from(strings, (s) => String(s));
  const parts = [];
  let out = "";
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
      const policy2 = checkBindingPolicy(ATTR_PART, attrName);
      if (!policy2.ok) throw new Error(policy2.reason);
      parts.push({
        kind: ATTR_PART,
        name: attrName,
        valuePrefix,
        valueSuffix,
        rawText: false
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
        rawText
      });
    } else {
      const policy2 = checkBindingPolicy(binding.kind, binding.name);
      if (!policy2.ok) throw new Error(policy2.reason);
      out += s.slice(0, s.length - binding.matchLength) + ` data-dim-${i}=""`;
      let valueSuffix = binding.valueSuffix || "";
      const valuePrefix = binding.valuePrefix || "";
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
        rawText: false
      });
    }
  }
  out += segs[segs.length - 1];
  return { html: out, parts };
}

// src/core/renderer/prepare.js
var templateCache = /* @__PURE__ */ new WeakMap();
var dimTrustedTypesPolicy = null;
function toTrustedHtml(htmlString) {
  if (dimTrustedTypesPolicy === null) {
    const tt = globalThis.trustedTypes;
    if (tt && typeof tt.createPolicy === "function") {
      try {
        dimTrustedTypesPolicy = tt.createPolicy("dim", {
          createHTML: (s) => s
        });
      } catch {
        dimTrustedTypesPolicy = typeof tt.getPolicy === "function" ? tt.getPolicy("dim") : void 0;
      }
    } else {
      dimTrustedTypesPolicy = void 0;
    }
  }
  return dimTrustedTypesPolicy ? dimTrustedTypesPolicy.createHTML(htmlString) : htmlString;
}
function prepareTemplate(strings) {
  const pure = prepare(strings);
  const element = document.createElement("template");
  element.innerHTML = toTrustedHtml(pure.html);
  return {
    element,
    partInfo: pure.parts.map((p) => ({
      kind: p.kind,
      name: p.name,
      valuePrefix: p.valuePrefix,
      valueSuffix: p.valueSuffix,
      rawText: p.rawText
    }))
  };
}
function linkAttrGroups(parts) {
  const byElement = /* @__PURE__ */ new Map();
  for (const p of parts) {
    if (p.kind !== ATTR_PART || !p.element) continue;
    let byName = byElement.get(p.element);
    if (!byName) {
      byName = /* @__PURE__ */ new Map();
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
function createInstance(template) {
  const { element, partInfo } = template;
  const fragment = element.content.cloneNode(true);
  const parts = [];
  const walker = document.createTreeWalker(
    fragment,
    NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT,
    null
  );
  const attrNodes = [];
  const childMarkers = [];
  let node;
  while (node = walker.nextNode()) {
    if (node.nodeType === Node.COMMENT_NODE && node.data === "{{dim}}") {
      childMarkers.push({ type: "comment", node });
    } else if (node.nodeType === Node.TEXT_NODE && node.data && node.data.includes(TEXT_MARKER)) {
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
        const start2 = document.createTextNode("");
        const end2 = document.createTextNode("");
        fragment.appendChild(start2);
        fragment.appendChild(end2);
        parts.push({ kind: CHILD_PART, start: start2, end: end2, committed: void 0 });
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
        committed: void 0
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
        committed: void 0,
        valuePrefix: info.valuePrefix || "",
        valueSuffix: info.valueSuffix || ""
      });
    }
  }
  linkAttrGroups(parts);
  return { fragment, parts };
}

// src/core/renderer/commit.js
var containerState = /* @__PURE__ */ new WeakMap();
var dimTrustedTypesPolicy2 = null;
function getDimPolicy() {
  if (dimTrustedTypesPolicy2 !== null) return dimTrustedTypesPolicy2;
  const tt = globalThis.trustedTypes;
  if (tt && typeof tt.createPolicy === "function") {
    try {
      dimTrustedTypesPolicy2 = tt.createPolicy("dim", {
        createHTML: (s) => s
      });
    } catch {
      dimTrustedTypesPolicy2 = typeof tt.getPolicy === "function" ? tt.getPolicy("dim") : void 0;
    }
  } else {
    dimTrustedTypesPolicy2 = void 0;
  }
  return dimTrustedTypesPolicy2;
}
function toTrustedHtml2(htmlString) {
  const policy2 = getDimPolicy();
  if (policy2) return policy2.createHTML(htmlString);
  return htmlString;
}
function formatAttrMid(value) {
  if (value == null || value === false) return "";
  if (value === true) return "";
  return String(value);
}
function finalizeAttrValue(name, value) {
  if (isUrlAttr(name)) {
    return sanitizeUrl(name, value);
  }
  return value;
}
function commitAttrGroup(part) {
  const group = part.attrGroup;
  if (!group || group.length <= 1) {
    const prefix = part.valuePrefix || "";
    const suffix = part.valueSuffix || "";
    const mid = formatAttrMid(part.committed);
    if ((part.committed == null || part.committed === false) && !prefix && !suffix) {
      part.element.removeAttribute(part.name);
    } else {
      const raw = prefix + mid + suffix;
      part.element.setAttribute(
        part.name,
        finalizeAttrValue(part.name, raw)
      );
    }
    return;
  }
  if (part !== group[group.length - 1]) return;
  let result = "";
  for (const g of group) {
    result += g.valuePrefix || "";
    result += formatAttrMid(g.committed);
  }
  result += group[group.length - 1].valueSuffix || "";
  part.element.setAttribute(
    part.name,
    finalizeAttrValue(part.name, result)
  );
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
  if (isKeyed(value)) {
    const prev = part.committed;
    const keyChanged = !prev || !isKeyed(prev) || prev.key !== value.key;
    if (keyChanged) {
      clearNodesBetween(part.start, part.end);
      part.childState = void 0;
      part.committed = value;
      setChildValue(part, value.result);
      part.committed = value;
      return;
    }
    part.committed = value;
    setChildValue(part, value.result);
    part.committed = value;
    return;
  }
  if (isUnsafeHTML(value)) {
    const raw = value.value;
    const htmlString = raw == null ? "" : typeof raw === "object" && raw !== null && "toString" in raw ? String(raw) : String(raw);
    if (part.committed && isUnsafeHTML(part.committed) && part.committed.value === value.value) {
      return;
    }
    clearNodesBetween(part.start, part.end);
    if (htmlString) {
      const tpl = document.createElement("template");
      tpl.innerHTML = toTrustedHtml2(htmlString);
      part.end.parentNode.insertBefore(tpl.content, part.end);
    }
    part.committed = value;
    part.childState = void 0;
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
    part.childState = void 0;
    return;
  }
  if (value instanceof Node) {
    clearNodesBetween(part.start, part.end);
    part.end.parentNode.insertBefore(value, part.end);
    part.committed = value;
    part.childState = void 0;
    return;
  }
  const text = String(value);
  const next = part.start.nextSibling;
  if (next && next !== part.end && next.nodeType === Node.TEXT_NODE && next.nextSibling === part.end) {
    if (next.data !== text) next.data = text;
  } else {
    clearNodesBetween(part.start, part.end);
    part.end.parentNode.insertBefore(document.createTextNode(text), part.end);
  }
  part.committed = value;
  part.childState = void 0;
}
function commitArray(values, part) {
  if (!part.arrayState) {
    clearNodesBetween(part.start, part.end);
    part.arrayState = [];
    part.childState = void 0;
  }
  const state = part.arrayState;
  while (state.length < values.length) {
    const start = document.createTextNode("");
    const end = document.createTextNode("");
    part.end.parentNode.insertBefore(start, part.end);
    part.end.parentNode.insertBefore(end, part.end);
    state.push({ start, end, committed: void 0, childState: void 0 });
  }
  while (state.length > values.length) {
    const removed = state.pop();
    clearNodesBetween(removed.start, removed.end);
    removed.start.parentNode?.removeChild(removed.start);
    removed.end.parentNode?.removeChild(removed.end);
  }
  for (let i = 0; i < values.length; i++) {
    setChildValue(state[i], values[i]);
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
      setChildValue(part, value);
      break;
    case ATTR_PART: {
      part.committed = value;
      if (!part.element) break;
      commitAttrGroup(part);
      break;
    }
    case PROP_PART: {
      if (!part.element) break;
      if ((part.name === "value" || part.name === "checked") && isFormControl(part.element) && typeof document !== "undefined" && document.activeElement === part.element) {
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
  }
}
function render(result, container, options = {}) {
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

// src/core/element/dim-element.js
var DimElement = class extends HTMLElement {
  constructor() {
    super();
    this.__controllers = [];
    this.__updatePromise = null;
    this.__hasRequestedUpdate = false;
    this.__isConnected = false;
    this.__hasRendered = false;
    this._props = void 0;
    this.renderRoot = null;
  }
  /**
   * Reactive `.props` property. Assigning triggers update.
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
    this.__styleQueue = [];
    try {
      const result = this.render();
      render(result, this.renderRoot, { preserveFocus: true });
      this.__flushStyles();
      this.__hasRendered = true;
      for (const c of this.__controllers) {
        c.hostUpdated?.();
      }
      this.updated();
    } finally {
      setSkipFocusRestore(false);
    }
    return true;
  }
  __flushStyles() {
    const queue = this.__styleQueue;
    if (!queue || !queue.length) return;
    const root = this.shadowRoot || this.renderRoot;
    if (!root) return;
    this.__adoptedSheets = this.__adoptedSheets || {};
    for (const entry of queue) {
      const { hookName, cssText, cssResult, preferAdopted } = entry;
      const existingAdopted = this.__adoptedSheets[hookName];
      if (existingAdopted) {
        try {
          existingAdopted.replaceSync(cssText);
        } catch {
          let styleElement2 = root.querySelector(
            `[data-style-hook="${hookName}"]`
          );
          if (!styleElement2) {
            styleElement2 = document.createElement("style");
            styleElement2.setAttribute("data-style-hook", hookName);
            root.appendChild(styleElement2);
          }
          styleElement2.textContent = cssText;
        }
        continue;
      }
      let styleElement = root.querySelector(`[data-style-hook="${hookName}"]`);
      if (!styleElement) {
        if (preferAdopted && root.adoptedStyleSheets !== void 0 && cssResult?.styleSheet) {
          root.adoptedStyleSheets = [
            ...root.adoptedStyleSheets,
            cssResult.styleSheet
          ];
          this.__adoptedSheets[hookName] = cssResult.styleSheet;
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
  updated() {
  }
};

// src/core/element/instance.ts
var currentInstance = null;
function setCurrentInstance(instance) {
  currentInstance = instance;
}
function getCurrentInstance() {
  if (!currentInstance) {
    console.error("Hooks should only be called inside a component.");
  }
  return currentInstance;
}

// src/core/element/props.ts
function parseAttributes(element) {
  return Array.from(element.attributes).reduce((acc, attr) => {
    let value = attr.value;
    if (value && (value.startsWith("{") || value.startsWith("["))) {
      try {
        value = JSON.parse(value);
      } catch (e) {
      }
    }
    acc[attr.name] = value;
    return acc;
  }, {});
}
function readProp(obj, name) {
  if (obj[name] !== void 0) return obj[name];
  const lower2 = name.toLowerCase();
  const key = Object.keys(obj).find((k) => k.toLowerCase() === lower2);
  return key !== void 0 ? obj[key] : void 0;
}
function createComponentProps(attributes, hostProps, children, childElements) {
  const rawProps = {
    ...attributes,
    ...hostProps,
    children,
    childElements
  };
  return new Proxy(rawProps, {
    get(target, key) {
      if (typeof key === "string" && !(key in target)) {
        const lower2 = key.toLowerCase();
        const match = Object.keys(target).find(
          (k) => k.toLowerCase() === lower2
        );
        if (match !== void 0) return target[match];
      }
      return target[key];
    }
  });
}

// src/core/hooks/useState.ts
function useState(initialState) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;
  if (!(hookName in component.hooks)) {
    component.hooks[hookName] = initialState;
  }
  const setState = (newState) => {
    const value = typeof newState === "function" ? newState(component.hooks[hookName]) : newState;
    if (Object.is(component.hooks[hookName], value)) {
      return;
    }
    component.hooks[hookName] = value;
    component.requestUpdate();
  };
  return [component.hooks[hookName], setState];
}

// src/core/hooks/useEffect.ts
function useEffect(effect, dependencies) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;
  const prev = component.hooks[hookName];
  const prevDeps = prev?.dependencies;
  const hasChanged = !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);
  if (hasChanged) {
    if (prev?.cleanup) {
      prev.cleanup();
    }
    const cleanup = effect();
    component.hooks[hookName] = {
      dependencies,
      cleanup,
      controllerRegistered: prev?.controllerRegistered || false
    };
  }
  if (!component.hooks[hookName].controllerRegistered) {
    component.hooks[hookName].controllerRegistered = true;
    component.addController({
      hostDisconnected() {
        const hook = component.hooks[hookName];
        if (hook?.cleanup) {
          hook.cleanup();
          hook.cleanup = void 0;
        }
      }
    });
  }
}

// src/core/hooks/useMemo.ts
function useMemo(calculation, dependencies) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;
  const prevDeps = component.hooks[hookName]?.dependencies;
  const hasChanged = !prevDeps || dependencies.some((dep, i) => dep !== prevDeps[i]);
  if (hasChanged) {
    component.hooks[hookName] = {
      value: calculation(),
      dependencies
    };
  }
  return component.hooks[hookName].value;
}

// src/core/hooks/useRef.ts
function useRef(initialValue) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `hook-${hookIndex}`;
  if (!component.hooks[hookName]) {
    component.hooks[hookName] = {
      current: initialValue !== void 0 ? initialValue : component
    };
  }
  return component.hooks[hookName];
}

// src/core/hooks/useStyle.ts
function useStyle(styles) {
  const component = getCurrentInstance();
  const hookIndex = component.hookIndex++;
  const hookName = `style-hook-${hookIndex}`;
  const cssResult = typeof styles === "string" ? unsafeCSS(styles) : styles;
  const cssText = cssResult.cssText;
  const prevStyles = component.hooks[hookName];
  if (prevStyles !== cssText) {
    component.hooks[hookName] = cssText;
    component.__styleQueue = component.__styleQueue || [];
    component.__styleQueue.push({
      hookName,
      cssText,
      cssResult,
      preferAdopted: !prevStyles
    });
  }
}

// src/core/hooks/useScope.ts
function useScope(elements) {
  Object.keys(elements).forEach((key) => {
    const component = elements[key];
    const tag = typeof component === "function" && component.tag || (key.includes("-") ? key : null);
    if (!tag) {
      console.warn(
        `useScope: cannot resolve tag for "${key}". Use a hyphenated tag key or call define() on the component first.`
      );
      return;
    }
    if (!customElements.get(tag)) {
      define({ tag, component });
    }
  });
}
var useLazyScope = (tag, promise) => {
  promise.then((module) => {
    const elementClass = new Function(`return ${module}`)();
    if (!customElements.get(tag)) {
      define({ tag, component: elementClass });
    }
  });
};

// src/core/store/events.js
function createDebouncedEventDispatcher(delay) {
  const timeoutIds = {};
  return (eventName, value) => {
    if (timeoutIds[eventName] !== void 0) {
      clearTimeout(timeoutIds[eventName]);
    }
    timeoutIds[eventName] = window.setTimeout(() => {
      window.dispatchEvent(
        new CustomEvent(eventName, {
          detail: value
        })
      );
      timeoutIds[eventName] = void 0;
    }, delay);
  };
}
var debouncedDispatcher = createDebouncedEventDispatcher(200);

// src/core/store/storage-manager.js
var databaseName = "DimDatabase";
var objectStoreName = "DimStore";
var StorageManager = class {
  constructor(crypto2 = null) {
    this.crypto = crypto2;
    this.asyncManager = null;
    this.db = null;
    this._dbPromise = this.openDatabase();
  }
  async openDatabase() {
    if (this.db) {
      return this.db;
    }
    return new Promise((resolve, reject) => {
      let request = indexedDB.open(databaseName, 1);
      request.onupgradeneeded = (event) => {
        const database = event.target.result;
        if (!database.objectStoreNames.contains(objectStoreName)) {
          database.createObjectStore(objectStoreName, { keyPath: "id" });
        }
      };
      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };
      request.onerror = function(event) {
        reject("Error opening database: " + event.target.error);
      };
    });
  }
  async _ready() {
    if (!this.db) {
      await this._dbPromise;
    }
    return this.db;
  }
  async writeValue(id, value) {
    const db = await this._ready();
    return new Promise((resolve, reject) => {
      if (!db) {
        reject("Database not available");
        return;
      }
      let transaction = db.transaction([objectStoreName], "readwrite");
      let objectStore = transaction.objectStore(objectStoreName);
      let request = objectStore.put({ id, value });
      request.onsuccess = function() {
        resolve("Value written successfully");
      };
      request.onerror = function(event) {
        reject("Error writing value: " + event.target.error);
      };
    });
  }
  async readValue(id, newState) {
    const db = await this._ready();
    return new Promise((resolve, reject) => {
      if (!db) {
        resolve(null);
        return;
      }
      let transaction = db.transaction([objectStoreName], "readonly");
      let objectStore = transaction.objectStore(objectStoreName);
      let request = objectStore.get(id);
      request.onsuccess = async () => {
        if (request.result) {
          try {
            const storedValue = request.result.value;
            if (this.crypto && typeof storedValue === "string") {
              try {
                const parsed = JSON.parse(storedValue);
                if (parsed.encryptedData && parsed.iv) {
                  try {
                    const decryptedValue = await this.crypto.decryptData(storedValue);
                    if (decryptedValue && typeof decryptedValue === "object" && decryptedValue.encryptedData && decryptedValue.iv) {
                      reject(
                        new Error(
                          "Decryption failed: Incorrect password - returned encrypted payload structure"
                        )
                      );
                      return;
                    }
                    resolve({ value: decryptedValue, newState });
                    return;
                  } catch (decryptError) {
                    const errorMessage = decryptError.message || String(decryptError);
                    if (errorMessage.includes("Incorrect password") || errorMessage.includes("Decryption failed")) {
                      reject(
                        new Error("Decryption failed: Incorrect password")
                      );
                      return;
                    }
                    reject(decryptError);
                    return;
                  }
                }
              } catch (parseError) {
              }
            }
            resolve({ value: storedValue, newState });
          } catch (error) {
            console.error("Failed to decrypt stored value:", error);
            const errorMessage = error.message || String(error);
            if (errorMessage.includes("Incorrect password") || errorMessage.includes("Decryption failed")) {
              reject(error);
            } else {
              resolve(null);
            }
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = function(event) {
        reject("Error reading value: " + event.target.error);
      };
    });
  }
  loadFromDatabase = (store, listenerId) => {
    const traverse = (obj, path) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && obj[key].length === void 0) {
          traverse(obj[key], `${path}${key}.`);
        } else {
          this.readValue(`${path}${key}`, obj[key]).then(async (response) => {
            if (response) {
              try {
                debouncedDispatcher(
                  `${path}${key}-initialLoad-${listenerId}`,
                  {
                    value: response.value,
                    _isInitialLoad: true
                  }
                );
              } catch (error) {
                console.error("Failed to encrypt for dispatch:", error);
              }
            } else {
              const k = `${path}${key}`;
              if (this.asyncManager?.clearLoading) {
                this.asyncManager.clearLoading(k);
              } else if (typeof this.asyncManager?.loadingSetters?.[k] === "function") {
                this.asyncManager.loadingSetters[k](false);
              }
            }
          }).catch((error) => {
            console.error(error);
            const k = `${path}${key}`;
            if (this.asyncManager?.clearLoading) {
              this.asyncManager.clearLoading(k);
            } else if (typeof this.asyncManager?.loadingSetters?.[k] === "function") {
              this.asyncManager.loadingSetters[k](false);
            }
          });
        }
      });
    };
    traverse(store, "");
  };
};
var storage_manager_default = StorageManager;

// src/core/store/async-manager.js
var PERSIST_DEBOUNCE_MS = 300;
var AsyncronousStateManager = class {
  constructor(crypto2 = null) {
    this.store = {};
    this.loadingSetters = {};
    this.savingSetters = {};
    this.eventListener = [];
    this.writeGen = {};
    this.persistedGen = {};
    this.persistTimers = {};
    this.crypto = crypto2;
    this.db = new storage_manager_default(crypto2);
    this.db.asyncManager = this;
  }
  /**
   * Notify every loading subscriber for `key` (or a legacy single function).
   */
  clearLoading(key) {
    const entry = this.loadingSetters?.[key];
    if (!entry) return;
    if (typeof entry === "function") {
      entry(false);
      return;
    }
    if (Array.isArray(entry)) {
      entry.forEach((item) => {
        const setter = typeof item === "function" ? item : item?.setIsLoading;
        if (typeof setter === "function") setter(false);
      });
    }
  }
  /**
   * Notify every saving subscriber for `key`.
   */
  setSaving(key, isSaving) {
    const entry = this.savingSetters?.[key];
    if (!entry) return;
    if (Array.isArray(entry)) {
      entry.forEach((item) => {
        if (typeof item?.setIsSaving === "function") {
          item.setIsSaving(isSaving);
        }
      });
    }
  }
  /**
   * Register (or replace) a loading setter for a subscriber id on `key`.
   */
  addLoadingSetter(key, id, setIsLoading) {
    this.loadingSetters = this.loadingSetters || {};
    const existing = this.loadingSetters[key];
    if (typeof existing === "function") {
      this.loadingSetters[key] = [{ id: "__legacy", setIsLoading: existing }];
    } else if (!Array.isArray(this.loadingSetters[key])) {
      this.loadingSetters[key] = [];
    }
    this.loadingSetters[key] = this.loadingSetters[key].filter(
      (item) => item?.id !== id
    );
    this.loadingSetters[key].push({ id, setIsLoading });
  }
  /**
   * Register (or replace) a saving setter for a subscriber id on `key`.
   */
  addSavingSetter(key, id, setIsSaving) {
    this.savingSetters = this.savingSetters || {};
    if (!Array.isArray(this.savingSetters[key])) {
      this.savingSetters[key] = [];
    }
    this.savingSetters[key] = this.savingSetters[key].filter(
      (item) => item?.id !== id
    );
    this.savingSetters[key].push({ id, setIsSaving });
    const pending = (this.writeGen[key] || 0) > (this.persistedGen[key] || 0);
    setIsSaving(pending);
  }
  /**
   * Drop loading setters registered under `listenerId`.
   */
  removeLoadingSetters(listenerId) {
    if (!this.loadingSetters) return;
    Object.keys(this.loadingSetters).forEach((key) => {
      const entry = this.loadingSetters[key];
      if (!Array.isArray(entry)) return;
      this.loadingSetters[key] = entry.filter(
        (item) => item?.id !== listenerId
      );
      if (this.loadingSetters[key].length === 0) {
        delete this.loadingSetters[key];
      }
    });
  }
  /**
   * Drop saving setters registered under `listenerId`.
   */
  removeSavingSetters(listenerId) {
    if (!this.savingSetters) return;
    Object.keys(this.savingSetters).forEach((key) => {
      const entry = this.savingSetters[key];
      if (!Array.isArray(entry)) return;
      this.savingSetters[key] = entry.filter((item) => item?.id !== listenerId);
      if (this.savingSetters[key].length === 0) {
        delete this.savingSetters[key];
      }
    });
  }
  /**
   * Persist the latest value for `key` (encrypt once, write DB, broadcast).
   */
  async flushPersist(key, eventName) {
    const gen = this.writeGen[key] || 0;
    const value = this.store[key];
    try {
      let dispatchDetail;
      if (this.crypto) {
        const encryptedValue = await this.crypto.encryptData(value);
        if (this.writeGen[key] !== gen) return;
        await this.db.writeValue(key, encryptedValue);
        if (this.writeGen[key] !== gen) return;
        const encryptedObject = JSON.parse(encryptedValue);
        dispatchDetail = {
          ...encryptedObject,
          _dimWriteGen: gen
        };
      } else {
        if (this.writeGen[key] !== gen) return;
        await this.db.writeValue(key, value);
        if (this.writeGen[key] !== gen) return;
        dispatchDetail = {
          _dimValue: value,
          _dimWriteGen: gen
        };
      }
      this.persistedGen[key] = gen;
      debouncedDispatcher(eventName, dispatchDetail);
      if (this.writeGen[key] === gen) {
        this.setSaving(key, false);
      }
    } catch (error) {
      console.error("Failed to persist value:", error);
    }
  }
  schedulePersist(key, eventName) {
    if (this.persistTimers[key] !== void 0) {
      clearTimeout(this.persistTimers[key]);
    }
    this.persistTimers[key] = setTimeout(() => {
      this.persistTimers[key] = void 0;
      this.flushPersist(key, eventName);
    }, PERSIST_DEBOUNCE_MS);
  }
  generateListener(listener) {
    const { listenerId, key, value } = listener;
    const originalSetter = value[1];
    const existingListeners = this.eventListener.filter(
      (listener2) => listener2.listenerId === listenerId && listener2.key === key
    );
    existingListeners.forEach((existingListener) => {
      window.removeEventListener(
        existingListener.eventName,
        existingListener.listener
      );
    });
    this.eventListener = this.eventListener.filter(
      (listener2) => !(listener2.listenerId === listenerId && listener2.key === key)
    );
    const listenerName = `${key}`;
    const initialLoadListenerName = `${key}-initialLoad-${listenerId}`;
    const createListener = (isInitialLoadEvent) => async (event) => {
      try {
        const isInitialLoad = isInitialLoadEvent || event.detail?._isInitialLoad;
        const eventGen = event.detail && typeof event.detail === "object" ? event.detail._dimWriteGen : void 0;
        let finalValue;
        if (isInitialLoad) {
          finalValue = event.detail.value;
        } else if (this.crypto) {
          finalValue = await this.crypto.decryptData({
            ...event.detail,
            crypto: this.crypto
          });
        } else if (event.detail && typeof event.detail === "object" && Object.prototype.hasOwnProperty.call(event.detail, "_dimValue")) {
          finalValue = event.detail._dimValue;
        } else {
          finalValue = event.detail;
        }
        if (!isInitialLoad && eventGen != null && eventGen < (this.writeGen[key] || 0)) {
          this.clearLoading(key);
          return;
        }
        this.store = {
          ...this.store,
          [key]: finalValue
        };
        if (eventGen != null) {
          this.writeGen[key] = Math.max(this.writeGen[key] || 0, eventGen);
          this.persistedGen[key] = Math.max(
            this.persistedGen[key] || 0,
            eventGen
          );
          if ((this.writeGen[key] || 0) === (this.persistedGen[key] || 0)) {
            this.setSaving(key, false);
          }
        }
        const currentState = value[0];
        if (JSON.stringify(currentState) !== JSON.stringify(finalValue)) {
          originalSetter(finalValue);
        }
        this.clearLoading(key);
      } catch (error) {
        console.error("Failed to process event data:", error);
        this.clearLoading(key);
      }
    };
    const regularListener = createListener(false);
    window.addEventListener(listenerName, regularListener);
    this.eventListener.push({
      listenerId,
      key,
      eventName: listenerName,
      listener: regularListener
    });
    const initialLoadListener = createListener(true);
    window.addEventListener(initialLoadListenerName, initialLoadListener);
    this.eventListener.push({
      listenerId,
      key,
      eventName: initialLoadListenerName,
      listener: initialLoadListener
    });
    const newSetter = (newValue, isInternalUpdate = false) => {
      if (isInternalUpdate) {
        originalSetter(newValue);
        return;
      }
      this.writeGen[key] = (this.writeGen[key] || 0) + 1;
      this.store = {
        ...this.store,
        [key]: newValue
      };
      originalSetter(newValue);
      this.setSaving(key, true);
      this.schedulePersist(key, listenerName);
    };
    const newState = this.store[key] !== void 0 ? this.store[key] : value[0];
    return [newState, newSetter];
  }
  removeListeners(listenerId) {
    const existingListeners = this.eventListener.filter(
      (listener) => listener.listenerId === listenerId
    );
    existingListeners.forEach((existingListener) => {
      window.removeEventListener(
        existingListener.eventName,
        existingListener.listener
      );
    });
    this.eventListener = this.eventListener.filter(
      (listener) => listener.listenerId !== listenerId
    );
    this.removeLoadingSetters(listenerId);
    this.removeSavingSetters(listenerId);
  }
  createListeners = (store, listenerId) => {
    const traverse = (obj, path) => {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === "object" && obj[key].length === void 0) {
          traverse(obj[key], `${path}${key}.`);
        } else {
          const fullKey = `${path}${key}`;
          const [asyncState, asyncSetState] = this.generateListener({
            listenerId,
            key: fullKey,
            value: obj[key]
          });
          obj[key][0] = asyncState;
          obj[key][1] = asyncSetState;
        }
      });
    };
    traverse(store, "");
  };
};
var async_manager_default = AsyncronousStateManager;

// src/core/store/useStore.ts
init_crypto_manager();
var stateManagerMap = /* @__PURE__ */ new Map();
var cryptoManagerMap = /* @__PURE__ */ new Map();
var plaintextStateManager = new async_manager_default(null);
function listenerIdKey(randomId) {
  if (randomId instanceof Uint8Array) {
    return Array.from(randomId).join(",");
  }
  return String(randomId);
}
var useStore = (store, options = {}) => {
  const encryptionKey = typeof options === "string" ? options : options?.encryptionKey;
  const [randomId] = useState(crypto.getRandomValues(new Uint8Array(8)));
  const subscriberId = listenerIdKey(randomId);
  let stateManager;
  if (encryptionKey) {
    let cryptoManager = cryptoManagerMap.get(encryptionKey);
    stateManager = stateManagerMap.get(encryptionKey);
    if (!cryptoManager) {
      cryptoManager = new crypto_manager_default(encryptionKey);
      cryptoManagerMap.set(encryptionKey, cryptoManager);
      stateManager = new async_manager_default(cryptoManager);
      stateManagerMap.set(encryptionKey, stateManager);
    }
  } else {
    stateManager = plaintextStateManager;
  }
  const enhanceStoreWithLoading = (obj, path = "") => {
    Object.keys(obj).forEach((key) => {
      if (typeof obj[key] === "object" && obj[key].length === void 0) {
        enhanceStoreWithLoading(obj[key], `${path}${key}.`);
      } else if (Array.isArray(obj[key]) && obj[key].length === 2) {
        const [value, setValue] = obj[key];
        const [isLoading, setIsLoading] = useState(true);
        const [isSaving, setIsSaving] = useState(false);
        obj[key] = [value, setValue, isLoading, setIsLoading, isSaving];
        const fullKey = `${path}${key}`;
        stateManager.addLoadingSetter(fullKey, subscriberId, setIsLoading);
        stateManager.addSavingSetter(fullKey, subscriberId, setIsSaving);
      }
    });
  };
  enhanceStoreWithLoading(store);
  stateManager.createListeners(store, subscriberId);
  useEffect(() => {
    stateManager.db.loadFromDatabase(store, subscriberId);
    return () => {
      stateManager.removeListeners(subscriberId);
    };
  }, []);
  return store;
};

// src/core/transitions/useViewTransition.js
function useViewTransition(transitionId, options = {}) {
  const component = getCurrentInstance();
  if (!component) {
    throw new Error("useViewTransition can only be called inside a component.");
  }
  const hookIndex = component.hookIndex++;
  const hookName = `view-transition-${hookIndex}`;
  const defaultOptions = {
    duration: 500,
    direction: "auto",
    // 'auto', 'left', 'right', 'up', 'down'
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    autoDirection: true,
    // Automatically determine direction based on state change
    ...options
  };
  if (!component.hooks[hookName]) {
    component.hooks[hookName] = {
      isTransitioning: false,
      direction: "right",
      currentTransitionId: transitionId,
      previousTransitionId: null,
      transitionCount: 0,
      options: defaultOptions
    };
  }
  const state = component.hooks[hookName];
  state.options = { ...state.options, ...options };
  const startTransition = (newTransitionId, direction = null) => {
    if (state.isTransitioning) return false;
    const prevId = state.currentTransitionId;
    state.previousTransitionId = prevId;
    state.currentTransitionId = newTransitionId;
    state.isTransitioning = true;
    state.transitionCount++;
    if (direction) {
      state.direction = direction;
    } else if (state.options.autoDirection && prevId !== null && newTransitionId !== null) {
      const prevNum = parseFloat(prevId);
      const newNum = parseFloat(newTransitionId);
      if (!isNaN(prevNum) && !isNaN(newNum)) {
        state.direction = newNum > prevNum ? "right" : "left";
      } else {
        state.direction = newTransitionId > prevId ? "right" : "left";
      }
    } else {
      state.direction = state.options.direction === "auto" ? "right" : state.options.direction;
    }
    setTimeout(() => {
      if (component.isConnected === false) {
        state.isTransitioning = false;
        return;
      }
      endTransition();
    }, state.options.duration);
    component.requestUpdate();
    return true;
  };
  const endTransition = () => {
    if (!state.isTransitioning) return;
    state.isTransitioning = false;
    component.requestUpdate();
  };
  if (transitionId !== state.currentTransitionId && !state.isTransitioning) {
    startTransition(transitionId);
  }
  return {
    // State
    isTransitioning: state.isTransitioning,
    direction: state.direction,
    currentId: state.currentTransitionId,
    previousId: state.previousTransitionId,
    // Controls
    startTransition,
    endTransition,
    // CSS class helpers (legacy single-layer helper, kept for back-compat)
    getTransitionClasses: (baseClass = "") => {
      const classes = [baseClass].filter(Boolean);
      if (state.isTransitioning) {
        classes.push("transitioning");
        classes.push(`slide-${state.direction}`);
        classes.push(`transition-${state.direction}`);
      }
      return classes.join(" ");
    },
    // Two-layer slide helpers. The incoming (current) content slides IN and is
    // never placed in a hidden exit state; the outgoing (previous) content
    // slides OUT in the opposite direction.
    getIncomingClass: (baseClass = "vt-layer") => {
      const classes = [baseClass].filter(Boolean);
      if (state.isTransitioning) {
        classes.push(`slide-in-${state.direction}`);
      }
      return classes.join(" ");
    },
    getOutgoingClass: (baseClass = "vt-layer") => {
      const classes = [baseClass].filter(Boolean);
      classes.push(
        state.direction === "right" ? "slide-out-left" : "slide-out-right"
      );
      return classes.join(" ");
    },
    // Style helpers
    getTransitionStyles: () => ({
      transition: state.isTransitioning ? `all ${state.options.duration}ms ${state.options.easing}` : "none",
      "--transition-duration": `${state.options.duration}ms`,
      "--transition-easing": state.options.easing,
      "--transition-direction": state.direction
    }),
    // Configuration
    options: state.options
  };
}

// src/core/transitions/styles.js
var viewTransitionStyles = unsafeCSS(`
  /* Auto-transition hosts must be block-level so the wrapper and its layers can
     establish a height. Custom elements default to display:inline, which would
     collapse the absolutely-positioned layers to zero height (the slide would
     be invisible). */
  :host {
    display: block;
  }

  /* Base transition styles */
  .view-transition-container {
    position: relative;
    overflow: hidden;
  }

  /* While the wrapper height is animating between old and new content sizes */
  .auto-transition-wrapper.vt-resizing {
    overflow: hidden;
  }

  .view-transition-item {
    transition: all var(--transition-duration, 500ms) var(--transition-easing, cubic-bezier(0.4, 0, 0.2, 1));
  }

  /* Two-layer slide: layers are stacked and animate independently */
  .vt-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  /* The incoming layer stays in normal document flow so it gives the wrapper a
     real height; the outgoing layer is the absolute overlay that slides off on
     top of it. Without this both layers are absolute and the wrapper collapses
     to zero height, hiding the animation entirely. Transforms used by the
     slide animations don't affect layout, so height stays stable. */
  .vt-layer.vt-incoming {
    position: relative;
  }

  /* Shared-element (FLIP) transitions. A node marked data-vt-shared="key" that
     exists in both the outgoing and incoming content is lifted into this
     overlay and animated from its old position to its new one, independently of
     the page slide. The in-layer copies are hidden so only the overlay travels. */
  .vt-shared-overlays {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    z-index: 10;
  }

  .vt-shared-overlay {
    position: absolute;
    margin: 0;
    box-sizing: border-box;
    overflow: hidden;
    will-change: transform;
    backface-visibility: hidden;
  }

  .vt-shared-hidden {
    visibility: hidden;
  }

  /* Outgoing layer slides off-screen */
  .slide-out-left {
    animation: slideOutToLeft var(--transition-duration, 500ms) var(--transition-easing, cubic-bezier(0.4, 0, 0.2, 1)) forwards;
  }

  .slide-out-right {
    animation: slideOutToRight var(--transition-duration, 500ms) var(--transition-easing, cubic-bezier(0.4, 0, 0.2, 1)) forwards;
  }

  @keyframes slideOutToLeft {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(-100%);
      opacity: 0;
    }
  }

  @keyframes slideOutToRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  /* Sliding transitions */
  .transitioning.slide-left,
  .transitioning.transition-left {
    transform: translateX(-100%);
    opacity: 0;
  }

  .transitioning.slide-right,
  .transitioning.transition-right {
    transform: translateX(100%);
    opacity: 0;
  }

  .transitioning.slide-up,
  .transitioning.transition-up {
    transform: translateY(-100%);
    opacity: 0;
  }

  .transitioning.slide-down,
  .transitioning.transition-down {
    transform: translateY(100%);
    opacity: 0;
  }

  /* Slide-in animations */
  .slide-in-left {
    animation: slideInFromLeft var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  .slide-in-right {
    animation: slideInFromRight var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  .slide-in-up {
    animation: slideInFromTop var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  .slide-in-down {
    animation: slideInFromBottom var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  /* Keyframe animations */
  @keyframes slideInFromLeft {
    from {
      transform: translateX(-100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInFromRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideInFromTop {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideInFromBottom {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  /* Fade transitions */
  .transitioning.fade {
    opacity: 0;
  }

  .fade-in {
    animation: fadeIn var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Scale transitions */
  .transitioning.scale {
    transform: scale(0.8);
    opacity: 0;
  }

  .scale-in {
    animation: scaleIn var(--transition-duration, 500ms) var(--transition-easing, ease-out) forwards;
  }

  @keyframes scaleIn {
    from {
      transform: scale(0.8);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }
`);

// src/core/transitions/auto-transition-host.js
function queryDeep(root, selector) {
  const found = [];
  const visit = (node) => {
    if (!node?.querySelectorAll) return;
    node.querySelectorAll(selector).forEach((el) => found.push(el));
    node.querySelectorAll("*").forEach((el) => {
      if (el.shadowRoot) visit(el.shadowRoot);
    });
  };
  visit(root);
  return found;
}
var AutoTransitionHost = class {
  constructor(host) {
    this.host = host;
    this._previousRenderResult = null;
    this._sharedRects = null;
    this._flipTransitionKey = null;
    this._flipPlayed = false;
    this._isTransitioningNow = false;
    this._flipDuration = 500;
    this._flipEasing = "cubic-bezier(0.4, 0, 0.2, 1)";
    this._sharedOverlayContainer = null;
    this._wrapperHeights = null;
    this._containerResizePlayed = false;
    this._wrapperHeightAnimation = null;
  }
  /**
   * Build the template for an auto-transition component render.
   * @param {object} autoTransition
   * @param {*} result
   * @param {Function} html - Dim html tagged template (same as public export)
   */
  wrapRender(autoTransition, result, html2) {
    const transitionStyles = autoTransition.getTransitionStyles();
    const styleString = Object.entries(transitionStyles).map(([key, value]) => `${key}: ${value}`).join("; ");
    const styleText = `${viewTransitionStyles}
        .auto-transition-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }`;
    const wrapperStyles = html2`
      <style>
        ${styleText}
      </style>
    `;
    const hasPrevious = this._previousRenderResult !== null && this._previousRenderResult !== void 0;
    if (autoTransition.isTransitioning && hasPrevious) {
      const incomingClass = autoTransition.getIncomingClass("vt-layer");
      const outgoingClass = autoTransition.getOutgoingClass("vt-layer");
      const previousResult = this._previousRenderResult;
      setSkipFocusRestore(true);
      this._isTransitioningNow = true;
      this._flipDuration = autoTransition.options?.duration ?? 500;
      this._flipEasing = autoTransition.options?.easing ?? "cubic-bezier(0.4, 0, 0.2, 1)";
      const flipKey = `${autoTransition.previousId}=>${autoTransition.currentId}`;
      if (this._flipTransitionKey !== flipKey) {
        this._flipTransitionKey = flipKey;
        this._sharedRects = this._captureSharedRects();
        this._flipPlayed = false;
        const wrapperEl = this.host.shadowRoot?.querySelector(
          ".auto-transition-wrapper"
        );
        this._wrapperHeights = {
          old: wrapperEl ? wrapperEl.offsetHeight : 0
        };
        this._containerResizePlayed = false;
      }
      return html2`
        ${wrapperStyles}
        <div class="auto-transition-wrapper view-transition-container">
          <div class="${incomingClass} vt-incoming" style="${styleString}">
            ${keyed(autoTransition.currentId, result)}
          </div>
          <div class="${outgoingClass}" style="${styleString}">
            ${keyed(autoTransition.previousId, previousResult)}
          </div>
        </div>
      `;
    }
    setSkipFocusRestore(false);
    this._isTransitioningNow = false;
    this.cleanupTransitionEffects();
    this._previousRenderResult = result;
    return html2`
      ${wrapperStyles}
      <div class="auto-transition-wrapper view-transition-container">
        <div class="view-transition-item" style="${styleString}">${result}</div>
      </div>
    `;
  }
  cacheRenderResult(result) {
    this._isTransitioningNow = false;
    this._previousRenderResult = result;
  }
  onUpdated() {
    if (this._isTransitioningNow && this._wrapperHeights && !this._containerResizePlayed) {
      this._containerResizePlayed = true;
      this._runContainerHeightTransition(this._flipDuration, this._flipEasing);
    }
    if (this._isTransitioningNow && this._sharedRects && Object.keys(this._sharedRects).length > 0 && !this._flipPlayed) {
      const runFlip = () => {
        if (!this._isTransitioningNow || this._flipPlayed) return false;
        const incomingLayer = this.host.shadowRoot?.querySelector(
          ".vt-layer.vt-incoming"
        );
        if (!incomingLayer) return false;
        const hasTargets = queryDeep(incomingLayer, "[data-vt-shared]").some(
          (el) => this._sharedRects[el.getAttribute("data-vt-shared")]
        );
        if (!hasTargets) return false;
        this._flipPlayed = true;
        this._runSharedElementFlip(this._flipDuration, this._flipEasing);
        return true;
      };
      if (!runFlip()) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => runFlip());
        });
      }
    }
  }
  cleanupTransitionEffects() {
    if (this._wrapperHeightAnimation?.cancel) {
      this._wrapperHeightAnimation.cancel();
    }
    this._wrapperHeightAnimation = null;
    const root = this.host.shadowRoot;
    if (root) {
      const wrapper = root.querySelector(".auto-transition-wrapper");
      if (wrapper) {
        wrapper.classList.remove("vt-resizing");
        wrapper.style.height = "";
      }
      queryDeep(root, ".vt-shared-hidden").forEach((el) => {
        el.classList.remove("vt-shared-hidden");
        el.style.visibility = "";
      });
    }
    if (this._sharedOverlayContainer) {
      this._sharedOverlayContainer.innerHTML = "";
    }
    this._sharedRects = null;
    this._flipTransitionKey = null;
    this._flipPlayed = false;
    this._wrapperHeights = null;
    this._containerResizePlayed = false;
  }
  disconnect() {
    this.cleanupTransitionEffects();
    if (this._sharedOverlayContainer) {
      this._sharedOverlayContainer.remove();
      this._sharedOverlayContainer = null;
    }
  }
  _applyFlipVisualStyles(source, clone) {
    const cs = getComputedStyle(source);
    clone.style.textAlign = cs.textAlign;
    clone.style.boxSizing = cs.boxSizing;
    clone.style.font = cs.font;
    clone.style.lineHeight = cs.lineHeight;
    clone.style.letterSpacing = cs.letterSpacing;
    clone.style.padding = cs.padding;
    clone.style.border = cs.border;
    clone.style.borderRadius = cs.borderRadius;
    clone.style.background = cs.background;
    clone.style.boxShadow = cs.boxShadow;
    clone.style.color = cs.color;
    clone.style.fontSize = cs.fontSize;
    clone.style.fontWeight = cs.fontWeight;
    clone.style.whiteSpace = cs.whiteSpace;
    clone.style.overflow = cs.overflow;
    clone.style.textOverflow = cs.textOverflow;
    clone.style.display = cs.display;
    clone.style.alignItems = cs.alignItems;
    clone.style.justifyContent = cs.justifyContent;
    clone.style.alignContent = cs.alignContent;
    clone.style.flexDirection = cs.flexDirection;
    clone.style.flexWrap = cs.flexWrap;
    clone.style.gap = cs.gap;
    if (cs.rowGap) clone.style.rowGap = cs.rowGap;
    if (cs.columnGap) clone.style.columnGap = cs.columnGap;
    if (source instanceof HTMLImageElement) {
      clone.style.objectFit = cs.objectFit || "cover";
      clone.style.objectPosition = cs.objectPosition || "center";
    }
  }
  _captureSharedRects() {
    const root = this.host.shadowRoot;
    if (!root) return {};
    const wrapper = root.querySelector(".auto-transition-wrapper");
    const wrapperRect = wrapper ? wrapper.getBoundingClientRect() : { left: 0, top: 0 };
    const rects = {};
    queryDeep(root, "[data-vt-shared]").forEach((el) => {
      const key = el.getAttribute("data-vt-shared");
      const r = el.getBoundingClientRect();
      rects[key] = {
        left: r.left - wrapperRect.left,
        top: r.top - wrapperRect.top,
        width: r.width,
        height: r.height
      };
    });
    return rects;
  }
  _runContainerHeightTransition(duration, easing) {
    const root = this.host.shadowRoot;
    if (!root) return;
    const wrapper = root.querySelector(".auto-transition-wrapper");
    const incomingLayer = root.querySelector(".vt-layer.vt-incoming");
    if (!wrapper || !incomingLayer || !this._wrapperHeights) return;
    const oldHeight = this._wrapperHeights.old;
    const prevAnim = incomingLayer.style.animation;
    const prevTransform = incomingLayer.style.transform;
    incomingLayer.style.animation = "none";
    incomingLayer.style.transform = "none";
    const newHeight = incomingLayer.offsetHeight;
    incomingLayer.style.animation = prevAnim;
    incomingLayer.style.transform = prevTransform;
    this._wrapperHeights.new = newHeight;
    if (oldHeight === newHeight) return;
    wrapper.classList.add("vt-resizing");
    wrapper.style.height = `${oldHeight}px`;
    void wrapper.offsetHeight;
    if (typeof wrapper.animate === "function") {
      this._wrapperHeightAnimation = wrapper.animate(
        [{ height: `${oldHeight}px` }, { height: `${newHeight}px` }],
        { duration, easing, fill: "both" }
      );
    }
  }
  _runSharedElementFlip(duration, easing) {
    const root = this.host.shadowRoot;
    if (!root) return;
    if (typeof document === "undefined" || !document.createElement) return;
    const wrapper = root.querySelector(".auto-transition-wrapper");
    const incomingLayer = root.querySelector(".vt-layer.vt-incoming");
    if (!wrapper || !incomingLayer) return;
    const outgoingLayer = root.querySelector(".vt-layer:not(.vt-incoming)");
    if (!this._sharedOverlayContainer || !this._sharedOverlayContainer.isConnected) {
      this._sharedOverlayContainer = document.createElement("div");
      this._sharedOverlayContainer.className = "vt-shared-overlays";
      wrapper.appendChild(this._sharedOverlayContainer);
    }
    const container = this._sharedOverlayContainer;
    container.innerHTML = "";
    const oldRects = this._sharedRects || {};
    const prevAnim = incomingLayer.style.animation;
    const prevTransform = incomingLayer.style.transform;
    incomingLayer.style.animation = "none";
    incomingLayer.style.transform = "none";
    const wrapperRect = wrapper.getBoundingClientRect();
    queryDeep(incomingLayer, "[data-vt-shared]").forEach((el) => {
      const key = el.getAttribute("data-vt-shared");
      const oldRect = oldRects[key];
      if (!oldRect) return;
      const r = el.getBoundingClientRect();
      const newRect = {
        left: r.left - wrapperRect.left,
        top: r.top - wrapperRect.top,
        width: r.width,
        height: r.height
      };
      const clone = el.cloneNode(true);
      clone.classList.add("vt-shared-overlay");
      clone.classList.remove("vt-shared-hidden");
      clone.removeAttribute("data-vt-shared-internal");
      this._applyFlipVisualStyles(el, clone);
      clone.style.left = `${newRect.left}px`;
      clone.style.top = `${newRect.top}px`;
      clone.style.width = `${newRect.width}px`;
      clone.style.height = `${newRect.height}px`;
      clone.style.transformOrigin = "center center";
      const dx = oldRect.left + oldRect.width / 2 - (newRect.left + newRect.width / 2);
      const dy = oldRect.top + oldRect.height / 2 - (newRect.top + newRect.height / 2);
      const sx = newRect.width > 0 ? oldRect.width / newRect.width : 1;
      const sy = newRect.height > 0 ? oldRect.height / newRect.height : 1;
      const s = newRect.height > 0 ? sy : sx;
      const initialTransform = `translate(${dx}px, ${dy}px) scale(${s})`;
      clone.style.transform = initialTransform;
      container.appendChild(clone);
      void clone.offsetWidth;
      el.classList.add("vt-shared-hidden");
      el.style.visibility = "hidden";
      const outCopy = outgoingLayer && queryDeep(outgoingLayer, `[data-vt-shared="${key}"]`)[0];
      if (outCopy) {
        outCopy.classList.add("vt-shared-hidden");
        outCopy.style.visibility = "hidden";
      }
      if (typeof clone.animate === "function") {
        clone.animate(
          [
            { transform: initialTransform },
            { transform: "translate(0px, 0px) scale(1)" }
          ],
          { duration, easing, fill: "both" }
        );
      }
    });
    incomingLayer.style.animation = prevAnim;
    incomingLayer.style.transform = prevTransform;
  }
};

// src/core/fs/handle-persistence.js
var DB_NAME = "pi-files-native-fs";
var DB_VERSION = 1;
var STORE_NAME = "root";
var KEY_ROOT = "root";
function idbAvailable() {
  return typeof indexedDB !== "undefined" && typeof indexedDB.open === "function";
}
function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}
function reqToPromise(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB request failed"));
  });
}
async function saveRootDirectoryHandle(handle) {
  if (!idbAvailable()) return;
  let db;
  try {
    db = await openDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(handle, KEY_ROOT);
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB write failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB write aborted"));
    });
  } catch (e) {
    console.warn("[pi-files] Could not persist directory handle:", e);
  } finally {
    db?.close();
  }
}
async function loadRootDirectoryHandle() {
  if (!idbAvailable()) return null;
  let db;
  try {
    db = await openDb();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const handle = await reqToPromise(store.get(KEY_ROOT));
    return handle ?? null;
  } catch (e) {
    console.warn("[pi-files] Could not load directory handle:", e);
    return null;
  } finally {
    db?.close();
  }
}
async function clearRootDirectoryHandle() {
  if (!idbAvailable()) return;
  let db;
  try {
    db = await openDb();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.delete(KEY_ROOT);
    await new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB delete failed"));
      tx.onabort = () => reject(tx.error ?? new Error("IndexedDB delete aborted"));
    });
  } catch (e) {
    console.warn("[pi-files] Could not clear directory handle:", e);
  } finally {
    db?.close();
  }
}

// src/core/fs/useFS.js
function pathSegments(path) {
  const parts = String(path || "").split("/").filter(Boolean);
  for (const part of parts) {
    if (part === "." || part === "..") {
      throw new Error(`useFS: invalid path segment "${part}"`);
    }
  }
  return parts;
}
function useFS(options = {}, hooks) {
  const { opfs = false, encrypt = false, encryptionPassword } = options;
  const { useState: useState2, useEffect: useEffect2, useStore: useStore2 } = hooks;
  const [cryptoManager, setCryptoManager] = useState2(null);
  useEffect2(() => {
    if (encrypt) {
      if (!encryptionPassword) {
        console.error(
          "useFS: encryption enabled but no `encryptionPassword` was provided. Files will NOT be encrypted. Provide an explicit key to enable encryption."
        );
        return;
      }
      Promise.resolve().then(() => (init_crypto_manager(), crypto_manager_exports)).then(
        ({ default: CryptoManager2 }) => {
          const crypto2 = new CryptoManager2(encryptionPassword);
          setCryptoManager(crypto2);
        }
      );
    }
  }, [encrypt, encryptionPassword]);
  const [isInitialized, setIsInitialized] = useState2(false);
  const [fsMode, setFsMode] = useState2(null);
  const [directoryHandle, setDirectoryHandle] = useState2(null);
  const [error, setError] = useState2(null);
  const [pendingFolderReconnect, setPendingFolderReconnect] = useState2(null);
  const store = useStore2({
    selectedDirectoryName: useState2(""),
    hasPermission: useState2(false),
    preferredMode: useState2(opfs ? "opfs" : "fsa")
  });
  const [selectedDirectoryName, setSelectedDirectoryName] = store.selectedDirectoryName;
  const [hasPermission, setHasPermission] = store.hasPermission;
  const [preferredMode, setPreferredMode] = store.preferredMode;
  const isFileSystemAccessSupported = () => {
    return "showDirectoryPicker" in window;
  };
  useEffect2(() => {
    if (isInitialized) return;
    let cancelled = false;
    const applyFsaRestore = (handle) => {
      setPendingFolderReconnect(null);
      setPreferredMode("fsa");
      setFsMode("fsa");
      setDirectoryHandle(handle);
      setSelectedDirectoryName(handle.name);
      setHasPermission(true);
      setError(null);
      setIsInitialized(true);
      console.log(
        "useFS: Restored directory with write permissions:",
        handle.name
      );
    };
    const applyPendingReconnect = (handle) => {
      setPendingFolderReconnect({ name: handle.name });
      setPreferredMode("fsa");
      setFsMode("fsa");
      setDirectoryHandle(null);
      setSelectedDirectoryName(handle.name);
      setHasPermission(false);
      setError(null);
      setIsInitialized(true);
      console.log("useFS: Persisted folder requires reconnect:", handle.name);
    };
    const applyDefaultMode = () => {
      if (opfs || preferredMode === "opfs" || !isFileSystemAccessSupported()) {
        setFsMode("opfs");
        console.log("useFS: Initialized with OPFS");
      } else {
        if (hasPermission && selectedDirectoryName) {
          setHasPermission(false);
          setSelectedDirectoryName("");
        }
        setFsMode("fsa");
        console.log("useFS: Initialized with File System Access API");
      }
      setIsInitialized(true);
    };
    void (async () => {
      try {
        setError(null);
        if (isFileSystemAccessSupported()) {
          try {
            const h = await loadRootDirectoryHandle();
            if (h && !cancelled) {
              const perm = await h.queryPermission({ mode: "readwrite" });
              if (!cancelled && perm === "granted") {
                applyFsaRestore(h);
                return;
              }
              if (!cancelled && (perm === "prompt" || perm === "denied")) {
                applyPendingReconnect(h);
                return;
              }
            }
          } catch {
          }
        }
        if (!cancelled) applyDefaultMode();
      } catch (err) {
        if (!cancelled) {
          console.error("useFS: Initialization failed:", err);
          setError(err);
          setFsMode("opfs");
          setIsInitialized(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isInitialized, opfs, preferredMode]);
  const reconnectLocalDirectory = async () => {
    try {
      if (!isFileSystemAccessSupported()) {
        throw new Error("File System Access API not supported");
      }
      const handle = await loadRootDirectoryHandle();
      if (!handle) {
        setPendingFolderReconnect(null);
        return false;
      }
      const permissionStatus = await handle.requestPermission({
        mode: "readwrite"
      });
      if (permissionStatus !== "granted") {
        return false;
      }
      setPendingFolderReconnect(null);
      setPreferredMode("fsa");
      setFsMode("fsa");
      setDirectoryHandle(handle);
      setSelectedDirectoryName(handle.name);
      setHasPermission(true);
      setError(null);
      setIsInitialized(true);
      console.log("useFS: Reconnected to directory:", handle.name);
      return true;
    } catch (err) {
      console.error("useFS: Folder reconnect failed:", err);
      setError(err);
      return false;
    }
  };
  const clearPendingFolderReconnect = () => {
    setPendingFolderReconnect(null);
  };
  const requestPermission = async () => {
    if (fsMode === "opfs") {
      return true;
    }
    try {
      if (!isFileSystemAccessSupported()) {
        throw new Error("File System Access API not supported");
      }
      return hasPermission;
    } catch (err) {
      console.error("useFS: Permission request failed:", err);
      setError(err);
      return false;
    }
  };
  const selectDirectory = async () => {
    if (fsMode === "opfs") {
      const root = await navigator.storage.getDirectory();
      setDirectoryHandle(root);
      setSelectedDirectoryName("OPFS Root");
      setHasPermission(true);
      return true;
    }
    try {
      if (!isFileSystemAccessSupported()) {
        throw new Error("File System Access API not supported");
      }
      const handle = await window.showDirectoryPicker({
        mode: "readwrite"
      });
      const permissionStatus = await handle.requestPermission({
        mode: "readwrite"
      });
      if (permissionStatus !== "granted") {
        throw new Error("Write permission denied");
      }
      setDirectoryHandle(handle);
      setSelectedDirectoryName(handle.name);
      setHasPermission(true);
      setError(null);
      void saveRootDirectoryHandle(handle);
      console.log(
        "useFS: Directory selected with write permissions:",
        handle.name
      );
      return true;
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("useFS: Directory selection cancelled");
        return false;
      }
      console.error("useFS: Directory selection failed:", err);
      setError(err);
      return false;
    }
  };
  const pickLocalDirectory = async () => {
    try {
      if (!isFileSystemAccessSupported()) {
        throw new Error("File System Access API not supported");
      }
      const handle = await window.showDirectoryPicker({ mode: "readwrite" });
      const permissionStatus = await handle.requestPermission({
        mode: "readwrite"
      });
      if (permissionStatus !== "granted") {
        throw new Error("Write permission denied");
      }
      setPendingFolderReconnect(null);
      setPreferredMode("fsa");
      setFsMode("fsa");
      setIsInitialized(true);
      setDirectoryHandle(handle);
      setSelectedDirectoryName(handle.name);
      setHasPermission(true);
      setError(null);
      void saveRootDirectoryHandle(handle);
      console.log(
        "useFS: Local directory mounted with write permissions:",
        handle.name
      );
      return true;
    } catch (err) {
      if (err.name === "AbortError") {
        console.log("useFS: Local directory selection cancelled");
        return false;
      }
      console.error("useFS: Local directory selection failed:", err);
      setError(err);
      return false;
    }
  };
  const getCurrentDirectoryHandle = async () => {
    if (directoryHandle) {
      return directoryHandle;
    }
    if (fsMode === "opfs") {
      const root = await navigator.storage.getDirectory();
      setDirectoryHandle(root);
      return root;
    }
    throw new Error("No directory selected. Call selectDirectory() first.");
  };
  const listDirectory = async (path = "") => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      let targetHandle = dirHandle;
      if (path) {
        const pathParts = pathSegments(path);
        for (const part of pathParts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }
      const entries = [];
      for await (const [name, handle] of targetHandle.entries()) {
        entries.push({
          name,
          kind: handle.kind,
          // 'file' or 'directory'
          handle
        });
      }
      return entries.sort((a, b) => {
        if (a.kind !== b.kind) {
          return a.kind === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } catch (err) {
      console.error("useFS: Failed to list directory:", err);
      setError(err);
      throw err;
    }
  };
  const readFile = async (fileName, path = "") => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      let targetHandle = dirHandle;
      if (path) {
        const pathParts = pathSegments(path);
        for (const part of pathParts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }
      const fileHandle = await targetHandle.getFileHandle(fileName);
      const file = await fileHandle.getFile();
      let content = await file.text();
      if (encrypt && cryptoManager && content) {
        try {
          const parsed = JSON.parse(content);
          if (parsed.encryptedData && parsed.iv) {
            content = await cryptoManager.decryptData(content);
          }
        } catch (decryptErr) {
          console.warn(
            "useFS: Failed to decrypt file content, returning as plain text:",
            decryptErr.message
          );
        }
      }
      try {
        const parsed = JSON.parse(content);
        if (parsed.type === "binary" && parsed.data && parsed.mimeType) {
          return {
            type: "binary",
            mimeType: parsed.mimeType,
            size: Math.ceil(parsed.data.length * 3 / 4),
            // Approximate original size
            data: parsed.data,
            // Base64 data
            preview: `Binary file (${parsed.mimeType})`
          };
        }
      } catch (e) {
      }
      return content;
    } catch (err) {
      console.error("useFS: Failed to read file:", err);
      setError(err);
      throw err;
    }
  };
  const writeFile = async (fileName, content, path = "") => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      if (fsMode === "fsa") {
        const permissionStatus = await dirHandle.requestPermission({
          mode: "readwrite"
        });
        if (permissionStatus !== "granted") {
          throw new Error(
            "Write permission required. Please re-select the directory and grant write access."
          );
        }
      }
      let targetHandle = dirHandle;
      if (path) {
        const pathParts = pathSegments(path);
        for (const part of pathParts) {
          try {
            targetHandle = await targetHandle.getDirectoryHandle(part);
          } catch (err) {
            if (err.name === "NotFoundError") {
              targetHandle = await targetHandle.getDirectoryHandle(part, {
                create: true
              });
            } else {
              throw err;
            }
          }
        }
      }
      let finalContent = content;
      if (encrypt && cryptoManager) {
        try {
          finalContent = await cryptoManager.encryptData(content);
        } catch (encryptErr) {
          console.error("useFS: Failed to encrypt file content:", encryptErr);
          throw new Error(`Encryption failed: ${encryptErr.message}`);
        }
      }
      const fileHandle = await targetHandle.getFileHandle(fileName, {
        create: true
      });
      const writable = await fileHandle.createWritable();
      await writable.write(finalContent);
      await writable.close();
      console.log(
        "useFS: File written successfully" + (encrypt ? " (encrypted)" : "") + ":",
        fileName
      );
    } catch (err) {
      console.error("useFS: Failed to write file:", err);
      setError(err);
      throw err;
    }
  };
  const resolveTargetDirectoryForWrite = async (path = "") => {
    const dirHandle = await getCurrentDirectoryHandle();
    if (fsMode === "fsa") {
      const permissionStatus = await dirHandle.requestPermission({
        mode: "readwrite"
      });
      if (permissionStatus !== "granted") {
        throw new Error(
          "Write permission required. Please re-select the directory and grant write access."
        );
      }
    }
    let targetHandle = dirHandle;
    if (path) {
      const pathParts = pathSegments(path);
      for (const part of pathParts) {
        try {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        } catch (err) {
          if (err.name === "NotFoundError") {
            targetHandle = await targetHandle.getDirectoryHandle(part, {
              create: true
            });
          } else {
            throw err;
          }
        }
      }
    }
    return targetHandle;
  };
  const removeFile = async (fileName, path = "") => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      let targetHandle = dirHandle;
      if (path) {
        const pathParts = pathSegments(path);
        for (const part of pathParts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }
      await targetHandle.removeEntry(fileName);
      console.log("useFS: File removed successfully:", fileName);
    } catch (err) {
      console.error("useFS: Failed to remove file:", err);
      setError(err);
      throw err;
    }
  };
  const removeDirectory = async (dirName, path = "") => {
    try {
      const dirHandle = await getCurrentDirectoryHandle();
      let targetHandle = dirHandle;
      if (path) {
        const pathParts = pathSegments(path);
        for (const part of pathParts) {
          targetHandle = await targetHandle.getDirectoryHandle(part);
        }
      }
      await targetHandle.removeEntry(dirName, { recursive: true });
      console.log("useFS: Directory removed successfully:", dirName);
    } catch (err) {
      console.error("useFS: Failed to remove directory:", err);
      setError(err);
      throw err;
    }
  };
  const uploadFile = async (file, targetFileName = null, path = "") => {
    try {
      if (!file || !(file instanceof File)) {
        throw new Error("Invalid file provided. Expected a File object.");
      }
      const fileName = targetFileName || file.name;
      if (file.type.startsWith("text/") || file.type === "application/json" || file.type === "application/javascript" || file.name.match(/\.(txt|md|json|js|ts|css|html|xml|csv)$/i)) {
        const content = await file.text();
        await writeFile(fileName, content, path);
      } else {
        const targetHandle = await resolveTargetDirectoryForWrite(path);
        const fileHandle = await targetHandle.getFileHandle(fileName, {
          create: true
        });
        const writable = await fileHandle.createWritable();
        await writable.write(await file.arrayBuffer());
        await writable.close();
      }
      console.log(
        "useFS: File uploaded successfully" + (encrypt ? " (encrypted)" : "") + ":",
        fileName
      );
      return { success: true, fileName, size: file.size, type: file.type };
    } catch (err) {
      console.error("useFS: Failed to upload file:", err);
      setError(err);
      throw err;
    }
  };
  const uploadFiles = async (files, path = "") => {
    try {
      if (!files || !Array.isArray(files)) {
        throw new Error(
          "Invalid files provided. Expected an array of File objects."
        );
      }
      const results = [];
      for (const file of files) {
        try {
          const result = await uploadFile(file, null, path);
          results.push({ ...result, status: "success" });
        } catch (err) {
          results.push({
            fileName: file.name,
            status: "error",
            error: err.message,
            size: file.size,
            type: file.type
          });
        }
      }
      return results;
    } catch (err) {
      console.error("useFS: Failed to upload files:", err);
      setError(err);
      throw err;
    }
  };
  const directoryPath = selectedDirectoryName || (fsMode === "opfs" ? "OPFS Root" : "No directory selected");
  const isReady = isInitialized && (fsMode === "opfs" || fsMode === "fsa" && directoryHandle !== null);
  const hasDirectoryAccess = fsMode === "opfs" || fsMode === "fsa" && directoryHandle !== null;
  return {
    // Core operations
    listDirectory,
    readFile,
    writeFile,
    removeFile,
    removeDirectory,
    uploadFile,
    uploadFiles,
    // Permission and setup
    requestPermission,
    selectDirectory,
    // State
    directoryPath,
    isReady,
    fsMode,
    hasPermission,
    hasDirectoryAccess,
    error,
    // Encryption
    encryptionEnabled: encrypt,
    encryptionReady: encrypt ? !!cryptoManager : null,
    // Mode switching
    switchToOPFS: () => {
      setPendingFolderReconnect(null);
      setPreferredMode("opfs");
      setIsInitialized(false);
      setDirectoryHandle(null);
      setHasPermission(false);
      setSelectedDirectoryName("");
      void clearRootDirectoryHandle();
    },
    switchToFSA: () => {
      if (isFileSystemAccessSupported()) {
        setPreferredMode("fsa");
        setIsInitialized(false);
        setDirectoryHandle(null);
        setHasPermission(false);
        setSelectedDirectoryName("");
      } else {
        throw new Error("File System Access API not supported");
      }
    },
    pickLocalDirectory,
    reconnectLocalDirectory,
    pendingFolderReconnect,
    clearPendingFolderReconnect,
    // Clear error
    clearError: () => setError(null)
  };
}

// src/core/contracts/validate.js
var UNDEF = Object.freeze({ $u: 1 });
var NOOP_FN = Object.freeze({ $fn: -1 });
function isPlaceholder(v, key) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  return keys.length === 1 && keys[0] === key;
}
var PLACEHOLDER_KEYS = ["$u", "$fn", "$o", "$nf"];
function isRecordValue(v) {
  if (v === null || typeof v !== "object" || Array.isArray(v)) return false;
  return !PLACEHOLDER_KEYS.some((k) => isPlaceholder(v, k));
}
var ASCII_WS = /* @__PURE__ */ new Set([" ", "	", "\n", "\v", "\f", "\r"]);
function trimAscii(s) {
  let a = 0;
  let b = s.length;
  while (a < b && ASCII_WS.has(s[a])) a += 1;
  while (b > a && ASCII_WS.has(s[b - 1])) b -= 1;
  return s.slice(a, b);
}
function normalizeNewlines(s) {
  return s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}
function truncate16(s, max) {
  let out = "";
  let len = 0;
  for (const ch of s) {
    if (len + ch.length > max) break;
    out += ch;
    len += ch.length;
  }
  return out;
}
function charAllowed(cls, ch) {
  const c = ch.codePointAt(0);
  switch (cls) {
    case "id":
      return c >= 48 && c <= 57 || c >= 65 && c <= 90 || c >= 97 && c <= 122 || c === 95 || c === 46 || c === 58 || c === 45;
    case "digits":
      return c >= 48 && c <= 57;
    case "line":
      return c === 9 || c >= 32 && c !== 127;
    default:
      return true;
  }
}
function filterChars(cls, s) {
  let out = "";
  for (const ch of s) if (charAllowed(cls, ch)) out += ch;
  return out;
}
var ok = (value) => ({ ok: true, value });
function fail(s, path, reason) {
  if (s.coerce && Object.prototype.hasOwnProperty.call(s, "default")) {
    return ok(s.default);
  }
  return { ok: false, path, reason };
}
function propagate(s, r) {
  if (r.ok) return r;
  if (s.coerce && Object.prototype.hasOwnProperty.call(s, "default")) {
    return ok(s.default);
  }
  return r;
}
var INT_STRING = /^-?[0-9]{1,15}$/;
function validateNumber(s, path, n) {
  if (n >= s.min && n <= s.max) return ok(n);
  if (s.coerce) return ok(n < s.min ? s.min : s.max);
  return fail(s, path, "out of range");
}
function validate(s, v, path = "$") {
  switch (s.k) {
    case "any":
      return ok(v);
    case "bool":
      if (typeof v === "boolean") return ok(v);
      if (s.coerce && typeof v === "string") {
        if (v === "true" || v === "") return ok(true);
        if (v === "false") return ok(false);
      }
      return fail(s, path, "expected boolean");
    case "int":
      if (typeof v === "number" && Number.isInteger(v)) {
        return validateNumber(s, path, v);
      }
      if (s.coerce && typeof v === "string" && INT_STRING.test(v)) {
        return validateNumber(s, path, Number(v));
      }
      return fail(s, path, "expected integer");
    case "num":
      if (typeof v === "number") return validateNumber(s, path, v);
      return fail(s, path, "expected finite number");
    case "str": {
      if (typeof v !== "string") return fail(s, path, "expected string");
      let out = s.nl ? normalizeNewlines(v) : v;
      if (s.trim) out = trimAscii(out);
      if (s.chars !== "any") {
        const filtered = filterChars(s.chars, out);
        if (filtered !== out) {
          if (!s.coerce) return fail(s, path, `disallowed characters (${s.chars})`);
          out = s.trim ? trimAscii(filtered) : filtered;
        }
      }
      if (out.length > s.max) {
        if (!s.coerce) return fail(s, path, `longer than ${s.max}`);
        out = truncate16(out, s.max);
        if (s.trim) out = trimAscii(out);
      }
      if (out.length < s.min) return fail(s, path, `shorter than ${s.min}`);
      return ok(out);
    }
    case "text": {
      if (typeof v !== "string") return fail(s, path, "expected string");
      let out = v;
      if (out.length > s.max) {
        if (!s.coerce) return fail(s, path, `longer than ${s.max}`);
        out = truncate16(out, s.max);
      }
      return ok(escapeText(out));
    }
    case "url":
      if (typeof v !== "string") return fail(s, path, "expected url string");
      return ok(sanitizeUrl(s.attr, v));
    case "enum":
      for (const x of s.values) if (x === v) return ok(v);
      return fail(s, path, "not one of the allowed values");
    case "rec": {
      if (!isRecordValue(v)) return fail(s, path, "expected object");
      const out = {};
      for (const [name, fs] of s.fields) {
        const has = Object.prototype.hasOwnProperty.call(v, name);
        const r = validate(fs, has ? v[name] : UNDEF, `${path}.${name}`);
        if (!r.ok) return propagate(s, r);
        if (!isPlaceholder(r.value, "$u")) out[name] = r.value;
      }
      return ok(out);
    }
    case "arr": {
      if (!Array.isArray(v)) return fail(s, path, "expected array");
      let items = v;
      if (items.length > s.max) {
        if (!s.coerce) return fail(s, path, `more than ${s.max} items`);
        items = items.slice(0, s.max);
      }
      const out = [];
      for (let i = 0; i < items.length; i++) {
        const r = validate(s.of, items[i], `${path}[${i}]`);
        if (!r.ok) return propagate(s, r);
        out.push(r.value);
      }
      if (out.length < s.min) return fail(s, path, `fewer than ${s.min} items`);
      return ok(out);
    }
    case "opt":
      if (isPlaceholder(v, "$u")) return ok(v);
      return validate(s.of, v, path);
    case "nullable":
      if (v === null) return ok(null);
      return propagate(s, validate(s.of, v, path));
    case "union":
      for (const alt of s.of) {
        const r = validate(alt, v, path);
        if (r.ok) return r;
      }
      return fail(s, path, "no union alternative matched");
    case "fn":
      if (isPlaceholder(v, "$fn")) return ok(v);
      if (s.coerce) return ok(NOOP_FN);
      return fail(s, path, "expected function");
    default:
      return { ok: false, path, reason: `unknown schema kind ${s.k}` };
  }
}

// src/core/contracts/lower.js
function isPlainObject(v) {
  if (v === null || typeof v !== "object") return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}
function lower(value) {
  const fns = [];
  const opaques = [];
  const seen = /* @__PURE__ */ new Set();
  const opaque = (v) => {
    opaques.push(v);
    return { $o: opaques.length - 1 };
  };
  const go = (v) => {
    if (v === void 0) return UNDEF;
    if (v === null || typeof v === "boolean" || typeof v === "string") return v;
    if (typeof v === "number") return Number.isFinite(v) ? v : { $nf: String(v) };
    if (typeof v === "function") {
      fns.push(v);
      return { $fn: fns.length - 1 };
    }
    if (typeof v !== "object") return opaque(v);
    if (seen.has(v)) return opaque(v);
    if (Array.isArray(v)) {
      seen.add(v);
      const out2 = v.map((x) => go(x));
      seen.delete(v);
      return out2;
    }
    if (!isPlainObject(v)) return opaque(v);
    seen.add(v);
    const out = {};
    for (const key of Object.keys(v)) {
      if (v[key] === void 0) continue;
      out[key] = go(v[key]);
    }
    seen.delete(v);
    return out;
  };
  return { value: go(value), fns, opaques };
}
var noop = () => {
};
function raise(schema, value, ctx, wrap) {
  const go = (s, v) => {
    if (v === null || typeof v !== "object") return v;
    if (isPlaceholder(v, "$u")) return void 0;
    if (isPlaceholder(v, "$fn")) {
      const fn = v.$fn >= 0 ? ctx.fns[v.$fn] : noop;
      return s && s.k === "fn" && wrap ? wrap(fn, s) : fn;
    }
    if (isPlaceholder(v, "$o")) return ctx.opaques[v.$o];
    if (isPlaceholder(v, "$nf")) return Number(v.$nf);
    const inner = s && (s.k === "opt" || s.k === "nullable") ? s.of : s;
    if (Array.isArray(v)) {
      const of = inner && inner.k === "arr" ? inner.of : null;
      return v.map((x) => go(of, x));
    }
    const fieldSchema = (name) => {
      if (!inner || inner.k !== "rec") return null;
      const f = inner.fields.find((p) => p[0] === name);
      return f ? f[1] : null;
    };
    const out = {};
    for (const key of Object.keys(v)) out[key] = go(fieldSchema(key), v[key]);
    return out;
  };
  return go(schema, value);
}

// src/core/contracts/engine.js
var engine = validate;
var engineName = "js";
function getValidatorEngine() {
  return { engine, name: engineName };
}
function runValidator(schema, lowered) {
  return engine(schema, lowered);
}

// src/core/contracts/contract.js
var wrapped = /* @__PURE__ */ new WeakMap();
function wrapCallback(fn, schema) {
  if (!schema.args || schema.args.length === 0) return fn;
  let bySchema = wrapped.get(fn);
  if (!bySchema) {
    bySchema = /* @__PURE__ */ new WeakMap();
    wrapped.set(fn, bySchema);
  }
  const cached = bySchema.get(schema);
  if (cached) return cached;
  const wrapper = function(...args) {
    const clean = validateArgs(schema.args, args, "callback");
    if (!clean.ok) {
      console.error(`[dim] callback payload rejected: ${clean.message}`);
      return void 0;
    }
    return fn.apply(this, clean.values);
  };
  bySchema.set(schema, wrapper);
  return wrapper;
}
function validateValue(schema, value) {
  const lowered = lower(value);
  const r = runValidator(schema, lowered.value);
  if (!r.ok) return r;
  return { ok: true, value: raise(schema, r.value, lowered, wrapCallback) };
}
function validateArgs(schemas, args, label) {
  const values = [];
  for (let i = 0; i < schemas.length; i++) {
    const r = validateValue(schemas[i], args[i]);
    if (!r.ok) {
      return {
        ok: false,
        message: `${label} argument ${i} at ${r.path}: ${r.reason}`
      };
    }
    values.push(r.value);
  }
  for (let i = schemas.length; i < args.length; i++) values.push(args[i]);
  return { ok: true, values };
}
function contract(spec, fn) {
  if (!spec || !Array.isArray(spec.args) || typeof fn !== "function") {
    throw new TypeError("contract(spec, fn): spec.args array and fn required");
  }
  const name = spec.name || fn.name || "contract";
  const contracted = function(...args) {
    const clean = validateArgs(spec.args, args, name);
    if (!clean.ok) throw new TypeError(`[dim] contract violation: ${clean.message}`);
    return fn.apply(this, clean.values);
  };
  contracted.contract = spec;
  contracted.impl = fn;
  return contracted;
}
function fold(items, init, step, inv) {
  return items.reduce(step, init);
}
var PASSTHROUGH = ["children", "childElements"];
function validateProps(inputs, props) {
  const raw = {};
  for (const [name] of inputs.fields) {
    const v = props[name];
    if (v !== void 0) raw[name] = v;
  }
  const r = validateValue(inputs, raw);
  if (!r.ok) return r;
  const out = r.value;
  for (const key of PASSTHROUGH) {
    if (!Object.prototype.hasOwnProperty.call(out, key)) out[key] = props[key];
  }
  return { ok: true, value: out };
}

// src/core/element/define.ts
function define({
  tag,
  component: CustomFunctionalComponent,
  inputs = null
}) {
  class DimComponent extends DimElement {
    constructor() {
      super();
      this.hookIndex = 0;
      this.hooks = {};
      this._childNodes = [];
      this._slotContent = null;
      this._childNodesCaptured = false;
      this._attributeObserver = null;
      this._attributeUpdateScheduled = false;
      this._transitionHost = new AutoTransitionHost(this);
    }
    connectedCallback() {
      super.connectedCallback();
      if (!this._childNodesCaptured) {
        this._childNodes = Array.from(this.childNodes);
        this._slotContent = this.innerHTML;
        this._childNodesCaptured = true;
      }
      if (!this._attributeObserver) {
        this._attributeObserver = new MutationObserver(() => {
          if (!this._attributeUpdateScheduled) {
            this._attributeUpdateScheduled = true;
            requestAnimationFrame(() => {
              this._attributeUpdateScheduled = false;
              this.requestUpdate();
            });
          }
        });
      }
      this._attributeObserver.observe(this, { attributes: true });
    }
    disconnectedCallback() {
      super.disconnectedCallback();
      if (this._attributeObserver) {
        this._attributeObserver.disconnect();
      }
      this._attributeUpdateScheduled = false;
      this._transitionHost.disconnect();
    }
    render() {
      this.hookIndex = 0;
      setCurrentInstance(this);
      const attributes = parseAttributes(this);
      if (!this._props) this._props = {};
      const hostProps = this._props;
      let autoTransition = null;
      const transitionId = readProp(attributes, "transitionId") ?? readProp(hostProps, "transitionId");
      if (transitionId !== void 0 && transitionId !== null) {
        autoTransition = useViewTransition(transitionId.toString(), {
          duration: parseInt(readProp(attributes, "transitionDuration")) || 500,
          autoDirection: readProp(attributes, "transitionAutoDirection") !== "false"
        });
      }
      const querySelector = this.shadowRoot?.querySelector.bind(
        this.shadowRoot
      );
      const getRef = (ref) => {
        const component = querySelector(ref);
        const refHookName = Object.keys(component.hooks).find(
          (o) => !!component.hooks[o].current
        ) || "";
        return component.hooks[refHookName].current;
      };
      const useFS2 = (options = {}) => {
        return useFS(options, { useState, useEffect, useStore });
      };
      const sharedDependencies = {
        useState,
        useEffect,
        useMemo,
        useScope,
        useStyle,
        useStore,
        useFS: useFS2,
        useViewTransition,
        html,
        css,
        unsafeCSS,
        useRef,
        querySelector,
        getRef,
        renderChildren,
        keyed
      };
      const children = this._slotContent || "";
      const childElements = this._childNodes.filter(
        (node) => node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      );
      const componentProps = createComponentProps(
        attributes,
        hostProps,
        children,
        childElements
      );
      let props = componentProps;
      if (inputs) {
        const checked = validateProps(inputs, componentProps);
        if (!checked.ok) {
          setCurrentInstance(null);
          console.error(
            `[dim] <${tag}> props rejected at ${checked.path}: ${checked.reason}`
          );
          return html``;
        }
        props = checked.value;
      }
      const result = CustomFunctionalComponent(props, sharedDependencies);
      setCurrentInstance(null);
      if (autoTransition) {
        return this._transitionHost.wrapRender(autoTransition, result, html);
      }
      this._transitionHost.cacheRenderResult(result);
      return result;
    }
    updated(changedProperties) {
      super.updated(changedProperties);
      this._transitionHost.onUpdated();
    }
  }
  if (!customElements.get(tag)) {
    window.customElements.define(tag, DimComponent);
  }
  CustomFunctionalComponent.tag = tag;
  CustomFunctionalComponent.inputs = inputs;
  return CustomFunctionalComponent;
}

// src/core/index.ts
init_crypto_manager();

// src/core/contracts/t.js
var MAX_SAFE = 9007199254740991;
var DEFAULT_STR_MAX = 1e5;
var DEFAULT_ARR_MAX = 1e5;
function policy(node, opts) {
  if (opts && opts.onInvalid === "coerce") node.coerce = true;
  if (opts && Object.prototype.hasOwnProperty.call(opts, "default")) {
    node.default = opts.default;
  }
  return node;
}
function num(v, fallback) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}
var CHAR_CLASSES = ["any", "id", "digits", "line"];
var t = {
  any: () => ({ k: "any" }),
  bool: (opts) => policy({ k: "bool" }, opts),
  int: (opts = {}) => policy(
    {
      k: "int",
      min: Math.trunc(num(opts.min, -9007199254740991)),
      max: Math.trunc(num(opts.max, MAX_SAFE))
    },
    opts
  ),
  num: (opts = {}) => policy(
    { k: "num", min: num(opts.min, -9007199254740991), max: num(opts.max, MAX_SAFE) },
    opts
  ),
  string: (opts = {}) => {
    const chars = CHAR_CLASSES.includes(opts.chars) ? opts.chars : "any";
    return policy(
      {
        k: "str",
        min: Math.max(0, Math.trunc(num(opts.min, 0))),
        max: Math.max(0, Math.trunc(num(opts.max, DEFAULT_STR_MAX))),
        trim: Boolean(opts.trim),
        nl: Boolean(opts.normalizeNewlines),
        chars
      },
      opts
    );
  },
  /** Identifier: trimmed, non-empty, [A-Za-z0-9_.:-], at most `max` units. */
  id: (opts = {}) => t.string({
    min: 1,
    max: num(opts.max, 128),
    trim: true,
    chars: "id",
    ...opts
  }),
  /** Escaped text (proven: never contains '<'). */
  text: (opts = {}) => policy(
    { k: "text", max: Math.max(0, Math.trunc(num(opts.max, DEFAULT_STR_MAX))) },
    opts
  ),
  /** URL for attribute `attr`, run through the proven sanitizeUrl. */
  url: (opts = {}) => policy({ k: "url", attr: String(opts.attr || "href") }, opts),
  enum: (values, opts) => policy({ k: "enum", values: values.slice() }, opts),
  lit: (value, opts) => policy({ k: "enum", values: [value] }, opts),
  record: (fields, opts) => policy(
    { k: "rec", fields: Object.keys(fields).map((name) => [name, fields[name]]) },
    opts
  ),
  array: (of, opts = {}) => policy(
    {
      k: "arr",
      of,
      min: Math.max(0, Math.trunc(num(opts.min, 0))),
      max: Math.max(0, Math.trunc(num(opts.max, DEFAULT_ARR_MAX)))
    },
    opts
  ),
  optional: (of) => ({ k: "opt", of }),
  nullable: (of, opts) => policy({ k: "nullable", of }, opts),
  union: (alternatives, opts) => policy({ k: "union", of: alternatives.slice() }, opts),
  /**
   * Callback. Payloads are validated against `args` when called. A missing or
   * non-function value becomes a no-op unless onInvalid: "reject".
   */
  fn: (args = [], ret, opts = {}) => {
    const node = policy(
      { k: "fn", args: args.slice(), ret: ret || { k: "any" } },
      opts
    );
    if (opts.onInvalid !== "reject") node.coerce = true;
    return node;
  },
  void: () => ({ k: "any" })
};

export { async_manager_default as AsyncronousStateManager, crypto_manager_default as CryptoManager, DimElement, storage_manager_default as StorageManager, contract, css, debouncedDispatcher, define, fold, getValidatorEngine, html, keyed, renderChildren, t, unsafeCSS, unsafeHTML, useEffect, useFS, useLazyScope, useMemo, useRef, useScope, useState, useStore, useStyle, useViewTransition, validateValue, viewTransitionStyles };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map
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

// src/wasm/generated/pkg/dim_core.js
function addController(host, controller) {
  const ret = wasm.addController(host, controller);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function beginRender(host) {
  wasm.beginRender(host);
}
function cssText(strings, values) {
  const ret = wasm.cssText(strings, values);
  if (ret[3]) {
    throw takeFromExternrefTable0(ret[2]);
  }
  var v1 = getCachedStringFromWasm0(ret[0], ret[1]);
  if (ret[0] !== 0) {
    wasm.__wbindgen_free(ret[0], ret[1], 1);
  }
  return v1;
}
function currentInstance() {
  const ret = wasm.currentInstance();
  return ret;
}
function endRender() {
  wasm.endRender();
}
function flushStyles(host) {
  const ret = wasm.flushStyles(host);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function hostConnected(host) {
  const ret = wasm.hostConnected(host);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function hostDisconnected(host) {
  const ret = wasm.hostDisconnected(host);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function hostInit(host) {
  wasm.hostInit(host);
}
function html(strings, values) {
  const ret = wasm.html(strings, values);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function initRuntime(define2) {
  wasm.initRuntime(define2);
}
function keyed(key, result) {
  const ret = wasm.keyed(key, result);
  return ret;
}
function mergeProps(attributes, host_props, children, child_elements) {
  const ret = wasm.mergeProps(attributes, host_props, children, child_elements);
  return ret;
}
function parseAttributes(element) {
  const ret = wasm.parseAttributes(element);
  return ret;
}
function readProp(obj, name) {
  const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.readProp(obj, ptr0, len0);
  return ret;
}
function removeController(host, controller) {
  wasm.removeController(host, controller);
}
function renderChildren(children) {
  const ret = wasm.renderChildren(children);
  return ret;
}
function requestUpdate(host) {
  const ret = wasm.requestUpdate(host);
  return ret;
}
function setSkipFocusRestore(value) {
  wasm.setSkipFocusRestore(value);
}
function setState(host, name, next) {
  const ptr0 = passStringToWasm0(name, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
  const len0 = WASM_VECTOR_LEN;
  const ret = wasm.setState(host, ptr0, len0, next);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function unsafeHTML(value) {
  const ret = wasm.unsafeHTML(value);
  return ret;
}
function useEffect(effect, dependencies) {
  const ret = wasm.useEffect(effect, dependencies);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function useMemo(calculation, dependencies) {
  const ret = wasm.useMemo(calculation, dependencies);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function useRef(initial) {
  const ret = wasm.useRef(initial);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function useScope(elements) {
  const ret = wasm.useScope(elements);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function useState(initial) {
  const ret = wasm.useState(initial);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function useStyle(css_result) {
  const ret = wasm.useStyle(css_result);
  if (ret[1]) {
    throw takeFromExternrefTable0(ret[0]);
  }
}
function validateJson(schema, value) {
  let ptr0, len0, ptr1, len1;
  try {
    ptr0 = passStringToWasm0(schema, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    len0 = WASM_VECTOR_LEN;
    ptr1 = passStringToWasm0(value, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
    len1 = WASM_VECTOR_LEN;
  } catch (e) {
    if (ptr1) {
      wasm.__wbindgen_free(ptr1, len1 * 1, 1);
    }
    if (ptr0) {
      wasm.__wbindgen_free(ptr0, len0 * 1, 1);
    }
    throw e;
  }
  const ret = wasm.validateJson(ptr0, len0, ptr1, len1);
  var v3 = getCachedStringFromWasm0(ret[0], ret[1]);
  if (ret[0] !== 0) {
    wasm.__wbindgen_free(ret[0], ret[1], 1);
  }
  return v3;
}
function __wbg_get_imports() {
  const import0 = {
    __proto__: null,
    __wbg_String_58249209d236f025: function(arg0, arg1) {
      const ret = String(arg1);
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
    },
    __wbg_String_71e4258de6dbd04b: function(arg0) {
      const ret = String(arg0);
      return ret;
    },
    __wbg___wbindgen_boolean_get_4f1baf9a00be3c74: function(arg0) {
      const v = arg0;
      const ret = typeof v === "boolean" ? v : void 0;
      return isLikeNone(ret) ? 16777215 : ret ? 1 : 0;
    },
    __wbg___wbindgen_is_falsy_d864b623500ae65d: function(arg0) {
      const ret = !arg0;
      return ret;
    },
    __wbg___wbindgen_is_function_741ff2bb612836f5: function(arg0) {
      const ret = typeof arg0 === "function";
      return ret;
    },
    __wbg___wbindgen_is_null_or_undefined_fb96af93c75460ae: function(arg0) {
      const ret = arg0 == null;
      return ret;
    },
    __wbg___wbindgen_is_object_8b968c3ab8e96595: function(arg0) {
      const val = arg0;
      const ret = typeof val === "object" && val !== null;
      return ret;
    },
    __wbg___wbindgen_is_string_fc456fee5d3317de: function(arg0) {
      const ret = typeof arg0 === "string";
      return ret;
    },
    __wbg___wbindgen_is_undefined_be5b34249ff1fc15: function(arg0) {
      const ret = arg0 === void 0;
      return ret;
    },
    __wbg___wbindgen_jsval_eq_38d7bfbe4cc84039: function(arg0, arg1) {
      const ret = arg0 === arg1;
      return ret;
    },
    __wbg___wbindgen_number_get_934b640d0889af78: function(arg0, arg1) {
      const obj = arg1;
      const ret = typeof obj === "number" ? obj : void 0;
      getDataViewMemory0().setFloat64((arg0 >>> 0) + 8 * 1, isLikeNone(ret) ? 0 : ret, true);
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, !isLikeNone(ret), true);
    },
    __wbg___wbindgen_string_get_7ce8eee7fd327545: function(arg0, arg1) {
      const obj = arg1;
      const ret = typeof obj === "string" ? obj : void 0;
      var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
    },
    __wbg___wbindgen_throw_4c88d8bf264fd984: function(arg0, arg1) {
      var v0 = getCachedStringFromWasm0(arg0, arg1);
      throw new Error(v0);
    },
    __wbg__wbg_cb_unref_09736879a3f67559: function(arg0) {
      arg0._wbg_cb_unref();
    },
    __wbg_activeElement_6c30fe7fda33ef51: function(arg0) {
      const ret = arg0.activeElement;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_addEventListener_cae67c8cf7debc22: function() {
      return handleError(function(arg0, arg1, arg2) {
        arg0.addEventListener(arg1, arg2);
      }, arguments);
    },
    __wbg_adopted_sheets_b0f4396361e388ac: function(arg0) {
      const ret = arg0.__adoptedSheets;
      return ret;
    },
    __wbg_appendChild_dbf7ad2f48413560: function() {
      return handleError(function(arg0, arg1) {
        const ret = arg0.appendChild(arg1);
        return ret;
      }, arguments);
    },
    __wbg_array_state_2e4f81a173d6c3d4: function(arg0) {
      const ret = arg0.a;
      return ret;
    },
    __wbg_assign_6b6bb30388088072: function(arg0, arg1) {
      const ret = Object.assign(arg0, arg1);
      return ret;
    },
    __wbg_attr_group_f9cf8a80577cf88a: function(arg0) {
      const ret = arg0.g;
      return ret;
    },
    __wbg_call_40b008ba32f73991: function() {
      return handleError(function(arg0, arg1) {
        const ret = arg0.call(arg1);
        return ret;
      }, arguments);
    },
    __wbg_call_a410eb4b59ed5965: function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = arg0.call(arg1, arg2);
        return ret;
      }, arguments);
    },
    __wbg_call_fc92fee6137d452d: function() {
      return handleError(function(arg0, arg1, arg2, arg3) {
        const ret = arg0.call(arg1, arg2, arg3);
        return ret;
      }, arguments);
    },
    __wbg_child_state_6ee5fcf8a81d4875: function(arg0) {
      const ret = arg0.cs;
      return ret;
    },
    __wbg_cloneNode_70249c8beed88ee3: function() {
      return handleError(function(arg0, arg1) {
        const ret = arg0.cloneNode(arg1 !== 0);
        return ret;
      }, arguments);
    },
    __wbg_committed_cf3c877c6c4b4f88: function(arg0) {
      const ret = arg0.c;
      return ret;
    },
    __wbg_concat_3d00c6c70212d5c4: function(arg0, arg1) {
      const ret = arg0.concat(arg1);
      return ret;
    },
    __wbg_contains_743aa7c94499c269: function(arg0, arg1) {
      const ret = arg0.contains(arg1);
      return ret;
    },
    __wbg_content_6fed93ca1fd29f06: function(arg0) {
      const ret = arg0.content;
      return ret;
    },
    __wbg_controllers_cb04499054a11f73: function(arg0) {
      const ret = arg0.__controllers;
      return ret;
    },
    __wbg_createElement_de4a31ed2fb252be: function() {
      return handleError(function(arg0, arg1, arg2) {
        var v0 = getCachedStringFromWasm0(arg1, arg2);
        const ret = arg0.createElement(v0);
        return ret;
      }, arguments);
    },
    __wbg_createRange_d94ab95f29a3c437: function() {
      return handleError(function(arg0) {
        const ret = arg0.createRange();
        return ret;
      }, arguments);
    },
    __wbg_createRenderRoot_9dc032bfa07e92ac: function() {
      return handleError(function(arg0) {
        const ret = arg0.createRenderRoot();
        return ret;
      }, arguments);
    },
    __wbg_createTextNode_2b48c3fc75dfcc67: function(arg0, arg1, arg2) {
      var v0 = getCachedStringFromWasm0(arg1, arg2);
      const ret = arg0.createTextNode(v0);
      return ret;
    },
    __wbg_createTextNode_58c71aa239bbf9e2: function(arg0, arg1) {
      const ret = arg0.createTextNode(arg1);
      return ret;
    },
    __wbg_createTreeWalker_d8b4ce2824fc8d13: function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = arg0.createTreeWalker(arg1, arg2 >>> 0);
        return ret;
      }, arguments);
    },
    __wbg_deleteContents_a801b71d592dd684: function() {
      return handleError(function(arg0) {
        arg0.deleteContents();
      }, arguments);
    },
    __wbg_dim_connected_c7cfc036cc392bb5: function(arg0) {
      const ret = arg0.__isConnected;
      return ret;
    },
    __wbg_dim_type_raw_9f41315944031cdb: function(arg0) {
      const ret = arg0._$dimType$;
      return ret;
    },
    __wbg_element_79c5bea78c47ddf9: function(arg0) {
      const ret = arg0.el;
      return ret;
    },
    __wbg_end_1151e30ebcf27b66: function(arg0) {
      const ret = arg0.e;
      return ret;
    },
    __wbg_error_d1fc0193610e0e39: function(arg0) {
      console.error(arg0);
    },
    __wbg_getAttributeNames_ec244c1f5044dcd7: function(arg0) {
      const ret = arg0.getAttributeNames();
      return ret;
    },
    __wbg_getAttribute_c7b80d4010284561: function(arg0, arg1, arg2, arg3) {
      var v0 = getCachedStringFromWasm0(arg2, arg3);
      const ret = arg1.getAttribute(v0);
      var ptr2 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len2 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len2, true);
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr2, true);
    },
    __wbg_getRootNode_6de097189559981d: function(arg0) {
      const ret = arg0.getRootNode();
      return ret;
    },
    __wbg_get_2080c49015e35254: function() {
      return handleError(function(arg0, arg1) {
        const ret = Reflect.get(arg0, arg1);
        return ret;
      }, arguments);
    },
    __wbg_get_47d4a9ae5955c771: function(arg0, arg1, arg2) {
      var v0 = getCachedStringFromWasm0(arg1, arg2);
      const ret = arg0.get(v0);
      return ret;
    },
    __wbg_get_69a1ae6cfbf20256: function(arg0, arg1) {
      const ret = arg0.get(arg1);
      return ret;
    },
    __wbg_get_d7176cfb76d71114: function(arg0, arg1) {
      const ret = arg0[arg1 >>> 0];
      return ret;
    },
    __wbg_get_unchecked_e6325ad374eff861: function(arg0, arg1) {
      const ret = arg0[arg1 >>> 0];
      return ret;
    },
    __wbg_has_2c4d5cf25ec8c1cf: function() {
      return handleError(function(arg0, arg1) {
        const ret = Reflect.has(arg0, arg1);
        return ret;
      }, arguments);
    },
    __wbg_has_requested_update_e85501b1225f6dc6: function(arg0) {
      const ret = arg0.__hasRequestedUpdate;
      return ret;
    },
    __wbg_hook_index_56151a98f8638698: function(arg0) {
      const ret = arg0.hookIndex;
      return ret;
    },
    __wbg_hooks_5606fa1fb92db3ec: function(arg0) {
      const ret = arg0.hooks;
      return ret;
    },
    __wbg_indexOf_60c95f6e9124857d: function(arg0, arg1, arg2) {
      const ret = arg0.indexOf(arg1, arg2);
      return ret;
    },
    __wbg_insertBefore_10ab0c19b463c12b: function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = arg0.insertBefore(arg1, arg2);
        return ret;
      }, arguments);
    },
    __wbg_instanceof_Element_05dbb22ded594343: function(arg0) {
      let result;
      try {
        result = arg0 instanceof Element;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_Node_01bbf5179851b46b: function(arg0) {
      let result;
      try {
        result = arg0 instanceof Node;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_instanceof_ShadowRoot_cd78159e03fed884: function(arg0) {
      let result;
      try {
        result = arg0 instanceof ShadowRoot;
      } catch (_) {
        result = false;
      }
      const ret = result;
      return ret;
    },
    __wbg_isArray_bcf1376d0d732d08: function(arg0) {
      const ret = Array.isArray(arg0);
      return ret;
    },
    __wbg_isConnected_c529655b02d009e7: function(arg0) {
      const ret = arg0.isConnected;
      return ret;
    },
    __wbg_isSameNode_1eda96b84821596e: function(arg0, arg1) {
      const ret = arg0.isSameNode(arg1);
      return ret;
    },
    __wbg_is_2248ff2b575d60c7: function(arg0, arg1) {
      const ret = Object.is(arg0, arg1);
      return ret;
    },
    __wbg_key_b18401707ce11bc0: function(arg0) {
      const ret = arg0.key;
      return ret;
    },
    __wbg_keys_105f5c0857898f84: function(arg0) {
      const ret = Object.keys(arg0);
      return ret;
    },
    __wbg_kind_9a168745469febc3: function(arg0) {
      const ret = arg0.k;
      return ret;
    },
    __wbg_length_b03a0fabb109b1e9: function(arg0) {
      const ret = arg0.length;
      return ret;
    },
    __wbg_length_e83e819f48c774e4: function(arg0) {
      const ret = arg0.length;
      return ret;
    },
    __wbg_listener_b57703cda2e92890: function(arg0) {
      const ret = arg0.l;
      return ret;
    },
    __wbg_name_fc387c0a391b6281: function(arg0) {
      const ret = arg0.n;
      return ret;
    },
    __wbg_new_02a12cbe3db795af: function() {
      const ret = /* @__PURE__ */ new WeakMap();
      return ret;
    },
    __wbg_new_37eb45aaf5eeb820: function() {
      const ret = new Array();
      return ret;
    },
    __wbg_new_787b9fb330d55d78: function(arg0, arg1) {
      var v0 = getCachedStringFromWasm0(arg0, arg1);
      const ret = new Error(v0);
      return ret;
    },
    __wbg_new_cd4348290afae586: function() {
      const ret = new Object();
      return ret;
    },
    __wbg_nextNode_e792e069e8880865: function() {
      return handleError(function(arg0) {
        const ret = arg0.nextNode();
        return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
      }, arguments);
    },
    __wbg_nextSibling_91136dc7a8ec9b09: function(arg0) {
      const ret = arg0.nextSibling;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_nodeType_5c5050c6571c3463: function(arg0) {
      const ret = arg0.nodeType;
      return ret;
    },
    __wbg_nodeValue_31dd9c06701588cb: function(arg0, arg1) {
      const ret = arg1.nodeValue;
      var ptr1 = isLikeNone(ret) ? 0 : passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      var len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
    },
    __wbg_node_index_951e60117d7f7f53: function(arg0) {
      const ret = arg0.ni;
      return ret;
    },
    __wbg_of_027eb15371aac932: function(arg0) {
      const ret = Array.of(arg0);
      return ret;
    },
    __wbg_of_4cc373bef1f715a4: function(arg0, arg1, arg2) {
      const ret = Array.of(arg0, arg1, arg2);
      return ret;
    },
    __wbg_parentNode_fe15bcc26df42856: function(arg0) {
      const ret = arg0.parentNode;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_parse_c3f72b5a24f83c01: function() {
      return handleError(function(arg0, arg1) {
        var v0 = getCachedStringFromWasm0(arg0, arg1);
        const ret = JSON.parse(v0);
        return ret;
      }, arguments);
    },
    __wbg_parts_c39ea10d5df8a236: function(arg0) {
      const ret = arg0.parts;
      return ret;
    },
    __wbg_push_c9f4893fc209f768: function(arg0, arg1) {
      const ret = arg0.push(arg1);
      return ret;
    },
    __wbg_removeAttribute_501590155298c411: function() {
      return handleError(function(arg0, arg1) {
        arg0.removeAttribute(arg1);
      }, arguments);
    },
    __wbg_removeAttribute_735f25a801a701e1: function() {
      return handleError(function(arg0, arg1, arg2) {
        var v0 = getCachedStringFromWasm0(arg1, arg2);
        arg0.removeAttribute(v0);
      }, arguments);
    },
    __wbg_removeChild_d2dc6fc1d6db896b: function() {
      return handleError(function(arg0, arg1) {
        const ret = arg0.removeChild(arg1);
        return ret;
      }, arguments);
    },
    __wbg_removeEventListener_2cefb1e50375786d: function() {
      return handleError(function(arg0, arg1, arg2) {
        arg0.removeEventListener(arg1, arg2);
      }, arguments);
    },
    __wbg_render_ec9cbe64cd5214c5: function() {
      return handleError(function(arg0) {
        const ret = arg0.render();
        return ret;
      }, arguments);
    },
    __wbg_render_root_d6a2376e2e4b29e0: function(arg0) {
      const ret = arg0.renderRoot;
      return ret;
    },
    __wbg_resolve_87f425e4296fbdc7: function(arg0) {
      const ret = Promise.resolve(arg0);
      return ret;
    },
    __wbg_setAttribute_23821fd072053da3: function() {
      return handleError(function(arg0, arg1, arg2) {
        arg0.setAttribute(arg1, arg2);
      }, arguments);
    },
    __wbg_setAttribute_f75317b2b5cabfb4: function() {
      return handleError(function(arg0, arg1, arg2, arg3, arg4) {
        var v0 = getCachedStringFromWasm0(arg1, arg2);
        var v1 = getCachedStringFromWasm0(arg3, arg4);
        arg0.setAttribute(v0, v1);
      }, arguments);
    },
    __wbg_setEndAfter_deac73696cb54ceb: function() {
      return handleError(function(arg0, arg1) {
        arg0.setEndAfter(arg1);
      }, arguments);
    },
    __wbg_setEndBefore_9ebb5954e0980b0d: function() {
      return handleError(function(arg0, arg1) {
        arg0.setEndBefore(arg1);
      }, arguments);
    },
    __wbg_setStartAfter_c652ffd68357cf04: function() {
      return handleError(function(arg0, arg1) {
        arg0.setStartAfter(arg1);
      }, arguments);
    },
    __wbg_setStartBefore_9461ee45dfd021c2: function() {
      return handleError(function(arg0, arg1) {
        arg0.setStartBefore(arg1);
      }, arguments);
    },
    __wbg_set_2793479888329cb6: function() {
      return handleError(function(arg0, arg1, arg2) {
        const ret = Reflect.set(arg0, arg1, arg2);
        return ret;
      }, arguments);
    },
    __wbg_set_adopted_sheets_6d6f0b3f26315c9e: function(arg0, arg1) {
      arg0.__adoptedSheets = arg1;
    },
    __wbg_set_array_state_b633b2106ca8a2d3: function(arg0, arg1) {
      arg0.a = arg1;
    },
    __wbg_set_attr_group_0a396d76583b060f: function(arg0, arg1) {
      arg0.g = arg1;
    },
    __wbg_set_c54db956e8b63026: function(arg0, arg1, arg2) {
      const ret = arg0.set(arg1, arg2);
      return ret;
    },
    __wbg_set_child_state_9ea7309acb9b220c: function(arg0, arg1) {
      arg0.cs = arg1;
    },
    __wbg_set_committed_de7f97f425b2befe: function(arg0, arg1) {
      arg0.c = arg1;
    },
    __wbg_set_controllers_ebcfb92d8306cdee: function(arg0, arg1) {
      arg0.__controllers = arg1;
    },
    __wbg_set_dim_connected_91c2e76d72df5a33: function(arg0, arg1) {
      arg0.__isConnected = arg1 !== 0;
    },
    __wbg_set_dim_type_raw_25b7558997d5019f: function(arg0, arg1) {
      arg0._$dimType$ = arg1 >>> 0;
    },
    __wbg_set_element_f329723f6b718cb7: function(arg0, arg1) {
      arg0.el = arg1;
    },
    __wbg_set_end_3536689b45da13b4: function(arg0, arg1) {
      arg0.e = arg1;
    },
    __wbg_set_has_rendered_077ff81cd27fd1f4: function(arg0, arg1) {
      arg0.__hasRendered = arg1 !== 0;
    },
    __wbg_set_has_requested_update_46caa7bff083227f: function(arg0, arg1) {
      arg0.__hasRequestedUpdate = arg1 !== 0;
    },
    __wbg_set_hook_index_76749461cd21a0ee: function(arg0, arg1) {
      arg0.hookIndex = arg1;
    },
    __wbg_set_hooks_85723ceeb7791c4b: function(arg0, arg1) {
      arg0.hooks = arg1;
    },
    __wbg_set_innerHTML_a9d3a267967b5117: function(arg0, arg1, arg2) {
      var v0 = getCachedStringFromWasm0(arg1, arg2);
      arg0.innerHTML = v0;
    },
    __wbg_set_key_0a44da8d22101ba0: function(arg0, arg1) {
      arg0.key = arg1;
    },
    __wbg_set_kind_cc7c21e653d9395c: function(arg0, arg1) {
      arg0.k = arg1;
    },
    __wbg_set_length_19b5595bb62abfa3: function(arg0, arg1) {
      arg0.length = arg1 >>> 0;
    },
    __wbg_set_listener_8f649bff029bc061: function(arg0, arg1) {
      arg0.l = arg1;
    },
    __wbg_set_name_f9e7344d57317496: function(arg0, arg1) {
      arg0.n = arg1;
    },
    __wbg_set_node_index_db89642f4e8a7522: function(arg0, arg1) {
      arg0.ni = arg1;
    },
    __wbg_set_parts_5b8f5485281cfce2: function(arg0, arg1) {
      arg0.parts = arg1;
    },
    __wbg_set_props_raw_1fbf8d33b5ae6337: function(arg0, arg1) {
      arg0._props = arg1;
    },
    __wbg_set_raw_text_70c70dcd2cfd8666: function(arg0, arg1) {
      arg0.r = arg1 !== 0;
    },
    __wbg_set_render_root_9780536c0aa9ca97: function(arg0, arg1) {
      arg0.renderRoot = arg1;
    },
    __wbg_set_start_ac5d291dea413b68: function(arg0, arg1) {
      arg0.s = arg1;
    },
    __wbg_set_strings_e19a5285b929c8d7: function(arg0, arg1) {
      arg0.strings = arg1;
    },
    __wbg_set_style_queue_20fb5e0a5d399d75: function(arg0, arg1) {
      arg0.__styleQueue = arg1;
    },
    __wbg_set_t_key_0bd826020aa90515: function(arg0, arg1) {
      arg0.key = arg1;
    },
    __wbg_set_t_result_47fcb0d5729425a6: function(arg0, arg1) {
      arg0.result = arg1;
    },
    __wbg_set_t_strings_315119fcc1420d7f: function(arg0, arg1) {
      arg0.strings = arg1;
    },
    __wbg_set_t_value_c2e29b07cdd9b2d2: function(arg0, arg1) {
      arg0.value = arg1;
    },
    __wbg_set_t_values_4299b16751c3aa45: function(arg0, arg1) {
      arg0.values = arg1;
    },
    __wbg_set_textContent_0177b2a6d9293c2c: function(arg0, arg1, arg2) {
      var v0 = getCachedStringFromWasm0(arg1, arg2);
      arg0.textContent = v0;
    },
    __wbg_set_text_data_31668173b7cccafc: function(arg0, arg1) {
      arg0.data = arg1;
    },
    __wbg_set_update_promise_dd1fc41cc21a5b49: function(arg0, arg1) {
      arg0.__updatePromise = arg1;
    },
    __wbg_set_value_prefix_b40511025378f7bb: function(arg0, arg1) {
      arg0.vp = arg1;
    },
    __wbg_set_value_suffix_2d7665acbd4c57da: function(arg0, arg1) {
      arg0.vs = arg1;
    },
    __wbg_start_32cfdac53480e1a9: function(arg0) {
      const ret = arg0.s;
      return ret;
    },
    __wbg_static_accessor_GLOBAL_THIS_003ee833af9699fc: function() {
      const ret = typeof globalThis === "undefined" ? void 0 : globalThis;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_GLOBAL_e4293fb22cbe77da: function() {
      const ret = typeof global === "undefined" ? void 0 : global;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_SELF_53bb20457401453d: function() {
      const ret = typeof self === "undefined" ? void 0 : self;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_static_accessor_WINDOW_b5e0810bfecb7feb: function() {
      const ret = typeof window === "undefined" ? void 0 : window;
      return isLikeNone(ret) ? 0 : addToExternrefTable0(ret);
    },
    __wbg_stringify_0a0fbf2ef722380a: function() {
      return handleError(function(arg0) {
        const ret = JSON.stringify(arg0);
        return ret;
      }, arguments);
    },
    __wbg_strings_c7751719108cf441: function(arg0) {
      const ret = arg0.strings;
      return ret;
    },
    __wbg_style_queue_0bdd6709029f5801: function(arg0) {
      const ret = arg0.__styleQueue;
      return ret;
    },
    __wbg_t_key_e9700923907fb785: function(arg0) {
      const ret = arg0.key;
      return ret;
    },
    __wbg_t_result_2b8d4b2e0fb34355: function(arg0) {
      const ret = arg0.result;
      return ret;
    },
    __wbg_t_strings_27fa51559856469d: function(arg0) {
      const ret = arg0.strings;
      return ret;
    },
    __wbg_t_value_88ac3a2bfb1ac00d: function(arg0) {
      const ret = arg0.value;
      return ret;
    },
    __wbg_t_values_d6f116c4df56c8ff: function(arg0) {
      const ret = arg0.values;
      return ret;
    },
    __wbg_tagName_775bb05619a5c52f: function(arg0, arg1) {
      const ret = arg1.tagName;
      const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
      const len1 = WASM_VECTOR_LEN;
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
      getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
    },
    __wbg_text_data_42fb428ee0e9aaf2: function(arg0) {
      const ret = arg0.data;
      return ret;
    },
    __wbg_update_promise_0d967fe7eb126a3f: function(arg0) {
      const ret = arg0.__updatePromise;
      return ret;
    },
    __wbg_updated_b226fd174571c429: function() {
      return handleError(function(arg0) {
        const ret = arg0.updated();
        return ret;
      }, arguments);
    },
    __wbg_value_prefix_3d7c342dcdb7f640: function(arg0) {
      const ret = arg0.vp;
      return ret;
    },
    __wbg_value_suffix_0feb247259515957: function(arg0) {
      const ret = arg0.vs;
      return ret;
    },
    __wbg_warn_228ff2257384d295: function(arg0) {
      console.warn(arg0);
    },
    __wbg_warn_42702744b2284b6f: function(arg0, arg1) {
      console.warn(arg0, arg1);
    },
    __wbindgen_generic_0000000000000001: function(arg0, arg1) {
      const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h4b59c53254412233);
      return ret;
    },
    __wbindgen_generic_0000000000000002: function(arg0) {
      const ret = arg0;
      return ret;
    },
    __wbindgen_generic_0000000000000003: function(arg0, arg1) {
      var v0 = getCachedStringFromWasm0(arg0, arg1);
      const ret = v0;
      return ret;
    },
    __wbindgen_init_externref_table: function() {
      const table = wasm.__wbindgen_externrefs;
      table.set(0, void 0);
      table.set(1024, void 0);
      table.set(1025, null);
      table.set(1026, true);
      table.set(1027, false);
    }
  };
  return {
    __proto__: null,
    "./dim_core_bg.js": import0
  };
}
function wasm_bindgen__convert__closures_____invoke__h4b59c53254412233(arg0, arg1, arg2) {
  const ret = wasm.wasm_bindgen__convert__closures_____invoke__h4b59c53254412233(arg0, arg1, arg2);
  if (ret[2]) {
    throw takeFromExternrefTable0(ret[1]);
  }
  return takeFromExternrefTable0(ret[0]);
}
function addToExternrefTable0(obj) {
  const idx = wasm.__externref_table_alloc();
  wasm.__wbindgen_externrefs.set(idx, obj);
  return idx;
}
var CLOSURE_DTORS = typeof FinalizationRegistry === "undefined" ? { register: () => {
}, unregister: () => {
} } : new FinalizationRegistry((state) => wasm.__wbindgen_destroy_closure(state.a, state.b));
function getCachedStringFromWasm0(ptr, len) {
  if (ptr === 0) {
    return getFromExternrefTable0(len);
  } else {
    return getStringFromWasm0(ptr, len);
  }
}
var cachedDataViewMemory0 = null;
function getDataViewMemory0() {
  if (cachedDataViewMemory0 === null || cachedDataViewMemory0.buffer.detached === true || cachedDataViewMemory0.buffer.detached === void 0 && cachedDataViewMemory0.buffer !== wasm.memory.buffer) {
    cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
  }
  return cachedDataViewMemory0;
}
function getFromExternrefTable0(idx) {
  return wasm.__wbindgen_externrefs.get(idx);
}
function getStringFromWasm0(ptr, len) {
  ptr = ptr >>> 0;
  return decodeText(getUint8ArrayMemory0().subarray(ptr, ptr + len));
}
var cachedUint8ArrayMemory0 = null;
function getUint8ArrayMemory0() {
  if (cachedUint8ArrayMemory0 === null || cachedUint8ArrayMemory0.byteLength === 0) {
    cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachedUint8ArrayMemory0;
}
function handleError(f, args) {
  try {
    return f.apply(this, args);
  } catch (e) {
    const idx = addToExternrefTable0(e);
    wasm.__wbindgen_exn_store(idx);
  }
}
function isLikeNone(x) {
  return x === void 0 || x === null;
}
function makeMutClosure(arg0, arg1, f) {
  const state = { a: arg0, b: arg1, cnt: 1 };
  const real = (...args) => {
    state.cnt++;
    const a = state.a;
    state.a = 0;
    try {
      return f(a, state.b, ...args);
    } finally {
      state.a = a;
      real._wbg_cb_unref();
    }
  };
  real._wbg_cb_unref = () => {
    if (--state.cnt === 0) {
      wasm.__wbindgen_destroy_closure(state.a, state.b);
      state.a = 0;
      CLOSURE_DTORS.unregister(state);
    }
  };
  CLOSURE_DTORS.register(real, state, state);
  return real;
}
function passStringToWasm0(arg, malloc, realloc) {
  if (realloc === void 0) {
    const buf = cachedTextEncoder.encode(arg);
    const ptr2 = malloc(buf.length, 1) >>> 0;
    getUint8ArrayMemory0().subarray(ptr2, ptr2 + buf.length).set(buf);
    WASM_VECTOR_LEN = buf.length;
    return ptr2;
  }
  let len = arg.length;
  let ptr = malloc(len, 1) >>> 0;
  const mem = getUint8ArrayMemory0();
  let offset = 0;
  for (; offset < len; offset++) {
    const code = arg.charCodeAt(offset);
    if (code > 127) break;
    mem[ptr + offset] = code;
  }
  if (offset !== len) {
    if (offset !== 0) {
      arg = arg.slice(offset);
    }
    ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
    const view = getUint8ArrayMemory0().subarray(ptr + offset, ptr + len);
    const ret = cachedTextEncoder.encodeInto(arg, view);
    offset += ret.written;
    ptr = realloc(ptr, len, offset, 1) >>> 0;
  }
  WASM_VECTOR_LEN = offset;
  return ptr;
}
function takeFromExternrefTable0(idx) {
  const value = wasm.__wbindgen_externrefs.get(idx);
  wasm.__externref_table_dealloc(idx);
  return value;
}
var cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true });
cachedTextDecoder.decode();
var MAX_SAFARI_DECODE_BYTES = 2146435072;
var numBytesDecoded = 0;
function decodeText(bytes) {
  numBytesDecoded += bytes.length;
  if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
    cachedTextDecoder = new TextDecoder("utf-8", { ignoreBOM: true });
    cachedTextDecoder.decode();
    numBytesDecoded = bytes.length;
  }
  return cachedTextDecoder.decode(bytes);
}
var cachedTextEncoder = new TextEncoder();
if (!("encodeInto" in cachedTextEncoder)) {
  cachedTextEncoder.encodeInto = function(arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
      read: arg.length,
      written: buf.length
    };
  };
}
var WASM_VECTOR_LEN = 0;
var wasm;
function __wbg_finalize_init(instance, module) {
  wasm = instance.exports;
  cachedDataViewMemory0 = null;
  cachedUint8ArrayMemory0 = null;
  wasm.__wbindgen_start();
  return wasm;
}
function initSync(module) {
  if (wasm !== void 0) return wasm;
  if (module !== void 0) {
    if (Object.getPrototypeOf(module) === Object.prototype) {
      ({ module } = module);
    } else {
      console.warn("using deprecated parameters for `initSync()`; pass a single object instead");
    }
  }
  const imports = __wbg_get_imports();
  if (!(module instanceof WebAssembly.Module)) {
    module = new WebAssembly.Module(module);
  }
  const instance = new WebAssembly.Instance(module, imports);
  return __wbg_finalize_init(instance);
}

// src/wasm/generated/wasm-inline.js
var wasmBase64 = "AGFzbQEAAAABnwROYAJ/fwBgAX8Bf2ADf39/AGACf38Bf2ABfwBgA39/fwF/YAR/f39/AGABbwFvYAJvbwBgBX9/f39/AGABbwF/YAACf39gAAF/YAZ/f39/f38AYAADf39/YAJvbwFvYAR/f39/AX9gAW8AYAJvfwBgAm9vAX9gBX9/f39/AX9gAn9vAGAAAGABbwJ/f2ADb29vAW9gA29/fwFvYAJ/fwFvYAABb2ACb38Bb2ADb29vAGADb39/AGAHf39/f39/fwBgBG9vb28Bb2ABbwF8YAJvfABgAn98AGAGf39/f39/AX9gA39+fgBgA39/fwF+YAV/f31/fwBgBX9/fn9/AGAFf398f38AYAJvbwN/f39gAW8Df39/YAJvbwJ/f2AABH9/f39gA29vfwF/YAR/b39/AGAFb39/f38AYANvb38Bb2ADb29vAX9gAXwBb2AJf39/f39/fn5+AGABfwF+YAJ/fgF/YAJ/fwF+YAV/f39/fABgBn9/f31/fwBgBn9/f35/fwBgBn9/f3x/fwBgBX9/fn9/AX9gBH9+f38Bf2AFf398f38Bf2AEf3x/fwF/YAV/f31/fwF/YAR/fX9/AX9gBH98f38AYAR/fX9/AGAEf35/fwBgAm9vBH9/f39gAX8BfGADf39vA39/f2AEb39/bwJ/f2AEf39/fwJ/f2ADb29/An9/YAN/f3wBfGAKf39/f39/f39/fwBgA39+fwACoEWkARAuL2RpbV9jb3JlX2JnLmpzIV9fd2JnX3NldF9sZW5ndGhfMTliNTU5NWJiNjJhYmZhMwASEC4vZGltX2NvcmVfYmcuanMkX193YmdfZ2V0X3VuY2hlY2tlZF9lNjMyNWFkMzc0ZWZmODYxABwQLi9kaW1fY29yZV9iZy5qcxpfX3diZ19nZXRfZDcxNzZjZmI3NmQ3MTExNAAcEC4vZGltX2NvcmVfYmcuanMbX193YmdfcHVzaF9jOWY0ODkzZmMyMDlmNzY4ABMQLi9kaW1fY29yZV9iZy5qcx1fX3diZ19sZW5ndGhfYjAzYTBmYWJiMTA5YjFlOQAKEC4vZGltX2NvcmVfYmcuanMeX193YmdfaW5kZXhPZl82MGM5NWY2ZTkxMjQ4NTdkAC4QLi9kaW1fY29yZV9iZy5qcx1fX3diZ19hc3NpZ25fNmI2YmIzMDM4ODA4ODA3MgAPEC4vZGltX2NvcmVfYmcuanMbX193YmdfY2FsbF9hNDEwZWI0YjU5ZWQ1OTY1ABgQLi9kaW1fY29yZV9iZy5qcxtfX3diZ19jYWxsX2ZjOTJmZWU2MTM3ZDQ1MmQAIBAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX2dldF82OWExYWU2Y2ZiZjIwMjU2AA8QLi9kaW1fY29yZV9iZy5qcxpfX3diZ19zZXRfYzU0ZGI5NTZlOGI2MzAyNgAYEC4vZGltX2NvcmVfYmcuanMbX193Ymdfa2V5c18xMDVmNWMwODU3ODk4Zjg0AAcQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19zZXRfc3RyaW5nc19lMTlhNTI4NWI5MjljOGQ3AAgQLi9kaW1fY29yZV9iZy5qcxpfX3diZ19rZXlfYjE4NDAxNzA3Y2UxMWJjMAAHEC4vZGltX2NvcmVfYmcuanMcX193YmdfcGFydHNfYzM5ZWExMGQ1ZGY4YTIzNgAHEC4vZGltX2NvcmVfYmcuanMeX193Ymdfc2V0X2tleV8wYTQ0ZGE4ZDIyMTAxYmEwAAgQLi9kaW1fY29yZV9iZy5qcx5fX3diZ19zdHJpbmdzX2M3NzUxNzE5MTA4Y2Y0NDEABxAuL2RpbV9jb3JlX2JnLmpzIF9fd2JnX3NldF9wYXJ0c181YjhmNTQ4NTI4MWNmY2UyAAgQLi9kaW1fY29yZV9iZy5qcx1fX3diZ19TdHJpbmdfNzFlNDI1OGRlNmRiZDA0YgAHEC4vZGltX2NvcmVfYmcuanMkX193Ymdfc2V0X3RleHRfZGF0YV8zMTY2ODE3M2I3Y2NjYWZjAAgQLi9kaW1fY29yZV9iZy5qcydfX3diZ19hZGRFdmVudExpc3RlbmVyX2NhZTY3YzhjZjdkZWJjMjIAHRAuL2RpbV9jb3JlX2JnLmpzI19fd2JnX3NldEF0dHJpYnV0ZV8yMzgyMWZkMDcyMDUzZGEzAB0QLi9kaW1fY29yZV9iZy5qcypfX3diZ19yZW1vdmVFdmVudExpc3RlbmVyXzJjZWZiMWU1MDM3NTc4NmQAHRAuL2RpbV9jb3JlX2JnLmpzJV9fd2JnX2NyZWF0ZVRleHROb2RlXzU4YzcxYWEyMzliYmY5ZTIADxAuL2RpbV9jb3JlX2JnLmpzJl9fd2JnX3JlbW92ZUF0dHJpYnV0ZV81MDE1OTAxNTUyOThjNDExAAgQLi9kaW1fY29yZV9iZy5qcyBfX3diZ190ZXh0X2RhdGFfNDJmYjQyOGVlMGU5YWFmMgAHEC4vZGltX2NvcmVfYmcuanMhX193YmdfaG9va19pbmRleF81NjE1MWE5OGY4NjM4Njk4ACEQLi9kaW1fY29yZV9iZy5qcx1fX3diZ19yZW5kZXJfZWM5Y2JlNjRjZDUyMTRjNQAHEC4vZGltX2NvcmVfYmcuanMiX193YmdfY29udHJvbGxlcnNfY2IwNDQ5OTA1NGExMWY3MwAHEC4vZGltX2NvcmVfYmcuanMiX193YmdfcmVuZGVyX3Jvb3RfZDZhMjM3NmUyZTRiMjllMAAHEC4vZGltX2NvcmVfYmcuanMiX193Ymdfc3R5bGVfcXVldWVfMGJkZDY3MDkwMjlmNTgwMQAHEC4vZGltX2NvcmVfYmcuanMeX193YmdfdXBkYXRlZF9iMjI2ZmQxNzQ1NzFjNDI5AAcQLi9kaW1fY29yZV9iZy5qcyRfX3diZ19kaW1fY29ubmVjdGVkX2M3Y2ZjMDM2Y2MzOTJiYjUAChAuL2RpbV9jb3JlX2JnLmpzJF9fd2JnX3NldF9wcm9wc19yYXdfMWZiZjhkMzNiNWFlNjMzNwAIEC4vZGltX2NvcmVfYmcuanMlX193YmdfYWRvcHRlZF9zaGVldHNfYjBmNDM5NjM2MWUzODhhYwAHEC4vZGltX2NvcmVfYmcuanMlX193Ymdfc2V0X2hvb2tfaW5kZXhfNzY3NDk0NjFjZDIxYTBlZQAiEC4vZGltX2NvcmVfYmcuanMlX193YmdfdXBkYXRlX3Byb21pc2VfMGQ5NjdmZTdlYjEyNmEzZgAHEC4vZGltX2NvcmVfYmcuanMmX193Ymdfc2V0X2NvbnRyb2xsZXJzX2ViY2ZiOTJkODMwNmNkZWUACBAuL2RpbV9jb3JlX2JnLmpzJl9fd2JnX3NldF9yZW5kZXJfcm9vdF85NzgwNTM2YzBhYTljYTk3AAgQLi9kaW1fY29yZV9iZy5qcyZfX3diZ19zZXRfc3R5bGVfcXVldWVfMjBmYjVlMGE1ZDM5OWQ3NQAIEC4vZGltX2NvcmVfYmcuanMnX193Ymdfc2V0X2hhc19yZW5kZXJlZF8wNzdmZjgxY2QyN2ZkMWY0ABIQLi9kaW1fY29yZV9iZy5qcyhfX3diZ19zZXRfZGltX2Nvbm5lY3RlZF85MWMyZTc2ZDcyZGY1YTMzABIQLi9kaW1fY29yZV9iZy5qcylfX3diZ19zZXRfYWRvcHRlZF9zaGVldHNfNmQ2ZjBiM2YyNjMxNWM5ZQAIEC4vZGltX2NvcmVfYmcuanMpX193Ymdfc2V0X3VwZGF0ZV9wcm9taXNlX2RkMWZjNDFjYzIxYTViNDkACBAuL2RpbV9jb3JlX2JnLmpzK19fd2JnX2hhc19yZXF1ZXN0ZWRfdXBkYXRlX2U4NTUwMWIxMjI1ZjZkYzYAChAuL2RpbV9jb3JlX2JnLmpzJ19fd2JnX2NyZWF0ZVJlbmRlclJvb3RfOWRjMDMyYmZhMDdlOTJhYwAHEC4vZGltX2NvcmVfYmcuanMvX193Ymdfc2V0X2hhc19yZXF1ZXN0ZWRfdXBkYXRlXzQ2Y2FhN2JmZjA4MzIyN2YAEhAuL2RpbV9jb3JlX2JnLmpzHF9fd2JnX2hvb2tzXzU2MDZmYTFmYjkyZGIzZWMABxAuL2RpbV9jb3JlX2JnLmpzIF9fd2JnX3NldF9ob29rc184NTcyM2NlZWI3NzkxYzRiAAgQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19zZXRfdF92YWx1ZV9jMmUyOWIwN2NkZDliMmQyAAgQLi9kaW1fY29yZV9iZy5qcyNfX3diZ19kaW1fdHlwZV9yYXdfOWY0MTMxNTk0NDAzMWNkYgAHEC4vZGltX2NvcmVfYmcuanMjX193Ymdfc2V0X3RfcmVzdWx0XzQ3ZmNiMGQ1NzI5NDI1YTYACBAuL2RpbV9jb3JlX2JnLmpzI19fd2JnX3NldF90X3ZhbHVlc180Mjk5YjE2NzUxYzNhYTQ1AAgQLi9kaW1fY29yZV9iZy5qcyRfX3diZ19zZXRfdF9zdHJpbmdzXzMxNTExOWZjYzE0MjBkN2YACBAuL2RpbV9jb3JlX2JnLmpzJ19fd2JnX3NldF9kaW1fdHlwZV9yYXdfMjViNzU1ODk5N2Q1MDE5ZgASEC4vZGltX2NvcmVfYmcuanMcX193YmdfdF9rZXlfZTk3MDA5MjM5MDdmYjc4NQAHEC4vZGltX2NvcmVfYmcuanMeX193YmdfdF92YWx1ZV84OGFjM2EyYmZiMWFjMDBkAAcQLi9kaW1fY29yZV9iZy5qcx9fX3diZ190X3Jlc3VsdF8yYjhkNGIyZTBmYjM0MzU1AAcQLi9kaW1fY29yZV9iZy5qcx9fX3diZ190X3ZhbHVlc19kNmYxMTZjNGRmNTZjOGZmAAcQLi9kaW1fY29yZV9iZy5qcyBfX3diZ19zZXRfdF9rZXlfMGJkODI2MDIwYWE5MDUxNQAIEC4vZGltX2NvcmVfYmcuanMgX193YmdfdF9zdHJpbmdzXzI3ZmE1MTU1OTg1NjQ2OWQABxAuL2RpbV9jb3JlX2JnLmpzIV9fd2JnX2F0dHJfZ3JvdXBfZjljZjhhODA1NzdjZjg4YQAHEC4vZGltX2NvcmVfYmcuanMhX193Ymdfbm9kZV9pbmRleF85NTFlNjAxMTdkN2Y3ZjUzACEQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19hcnJheV9zdGF0ZV8yZTRmODFhMTczZDZjM2Q0AAcQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19jaGlsZF9zdGF0ZV82ZWU1ZmNmOGE4MWQ0ODc1AAcQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19zZXRfZWxlbWVudF9mMzI5NzIzZjZiNzE4Y2I3AAgQLi9kaW1fY29yZV9iZy5qcyNfX3diZ19zZXRfbGlzdGVuZXJfOGY2NDliZmYwMjliYzA2MQAIEC4vZGltX2NvcmVfYmcuanMjX193Ymdfc2V0X3Jhd190ZXh0XzcwYzcwZGNkMmNmZDg2NjYAEhAuL2RpbV9jb3JlX2JnLmpzI19fd2JnX3ZhbHVlX3ByZWZpeF8zZDdjMzQyZGNkYjdmNjQwAAcQLi9kaW1fY29yZV9iZy5qcyNfX3diZ192YWx1ZV9zdWZmaXhfMGZlYjI0NzI1OTUxNTk1NwAHEC4vZGltX2NvcmVfYmcuanMkX193Ymdfc2V0X2NvbW1pdHRlZF9kZTdmOTdmNDI1YjJiZWZlAAgQLi9kaW1fY29yZV9iZy5qcyVfX3diZ19zZXRfYXR0cl9ncm91cF8wYTM5NmQ3NjU4M2IwNjBmAAgQLi9kaW1fY29yZV9iZy5qcyVfX3diZ19zZXRfbm9kZV9pbmRleF9kYjg5NjQyZjRlOGE3NTIyACIQLi9kaW1fY29yZV9iZy5qcyZfX3diZ19zZXRfYXJyYXlfc3RhdGVfYjYzM2IyMTA2Y2E4YTJkMwAIEC4vZGltX2NvcmVfYmcuanMmX193Ymdfc2V0X2NoaWxkX3N0YXRlXzllYTczMDlhY2I5YjIyMGMACBAuL2RpbV9jb3JlX2JnLmpzJ19fd2JnX3NldF92YWx1ZV9wcmVmaXhfYjQwNTExMDI1Mzc4ZjdiYgAIEC4vZGltX2NvcmVfYmcuanMnX193Ymdfc2V0X3ZhbHVlX3N1ZmZpeF8yZDc2NjVhY2JkNGM1N2RhAAgQLi9kaW1fY29yZV9iZy5qcxpfX3diZ19lbmRfMTE1MWUzMGViY2YyN2I2NgAHEC4vZGltX2NvcmVfYmcuanMbX193Ymdfa2luZF85YTE2ODc0NTQ2OWZlYmMzAAoQLi9kaW1fY29yZV9iZy5qcxtfX3diZ19uYW1lX2ZjMzg3YzBhMzkxYjYyODEABxAuL2RpbV9jb3JlX2JnLmpzHF9fd2JnX3N0YXJ0XzMyY2ZkYWM1MzQ4MGUxYTkABxAuL2RpbV9jb3JlX2JnLmpzHl9fd2JnX2VsZW1lbnRfNzljNWJlYTc4YzQ3ZGRmOQAHEC4vZGltX2NvcmVfYmcuanMeX193Ymdfc2V0X2VuZF8zNTM2Njg5YjQ1ZGExM2I0AAgQLi9kaW1fY29yZV9iZy5qcx9fX3diZ19saXN0ZW5lcl9iNTc3MDNjZGEyZTkyODkwAAcQLi9kaW1fY29yZV9iZy5qcx9fX3diZ19zZXRfa2luZF9jYzdjMjFlNjUzZDkzOTVjABIQLi9kaW1fY29yZV9iZy5qcx9fX3diZ19zZXRfbmFtZV9mOWU3MzQ0ZDU3MzE3NDk2AAgQLi9kaW1fY29yZV9iZy5qcyBfX3diZ19jb21taXR0ZWRfY2YzYzg3N2M2YzRiNGY4OAAHEC4vZGltX2NvcmVfYmcuanMgX193Ymdfc2V0X3N0YXJ0X2FjNWQyOTFkZWE0MTNiNjgACBAuL2RpbV9jb3JlX2JnLmpzHV9fd2JnX1N0cmluZ181ODI0OTIwOWQyMzZmMDI1ABUQLi9kaW1fY29yZV9iZy5qcx5fX3diZ19yZXNvbHZlXzg3ZjQyNWU0Mjk2ZmJkYzcABxAuL2RpbV9jb3JlX2JnLmpzKV9fd2JnX2luc3RhbmNlb2ZfRWxlbWVudF8wNWRiYjIyZGVkNTk0MzQzAAoQLi9kaW1fY29yZV9iZy5qcyNfX3diZ19nZXRBdHRyaWJ1dGVfYzdiODBkNDAxMDI4NDU2MQAvEC4vZGltX2NvcmVfYmcuanMjX193Ymdfc2V0QXR0cmlidXRlX2Y3NTMxN2IyYjVjYWJmYjQAMBAuL2RpbV9jb3JlX2JnLmpzJF9fd2JnX3NldF9pbm5lckhUTUxfYTlkM2EyNjc5NjdiNTExNwAeEC4vZGltX2NvcmVfYmcuanMmX193YmdfcmVtb3ZlQXR0cmlidXRlXzczNWYyNWE4MDFhNzAxZTEAHhAuL2RpbV9jb3JlX2JnLmpzKF9fd2JnX2dldEF0dHJpYnV0ZU5hbWVzX2VjMjQ0YzFmNTA0NGRjZDcABxAuL2RpbV9jb3JlX2JnLmpzHl9fd2JnX3RhZ05hbWVfNzc1YmIwNTYxOWE1YzUyZgAVEC4vZGltX2NvcmVfYmcuanMbX193Ymdfd2Fybl8yMjhmZjIyNTczODRkMjk1ABEQLi9kaW1fY29yZV9iZy5qcxtfX3diZ193YXJuXzQyNzAyNzQ0YjIyODRiNmYACBAuL2RpbV9jb3JlX2JnLmpzHF9fd2JnX2Vycm9yX2QxZmMwMTkzNjEwZTBlMzkAERAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX2NyZWF0ZVJhbmdlX2Q5NGFiOTVmMjlhM2M0MzcABxAuL2RpbV9jb3JlX2JnLmpzJF9fd2JnX2FjdGl2ZUVsZW1lbnRfNmMzMGZlN2ZkYTMzZWY1MQAKEC4vZGltX2NvcmVfYmcuanMkX193YmdfY3JlYXRlRWxlbWVudF9kZTRhMzFlZDJmYjI1MmJlABkQLi9kaW1fY29yZV9iZy5qcyVfX3diZ19jcmVhdGVUZXh0Tm9kZV8yYjQ4YzNmYzc1ZGZjYzY3ABkQLi9kaW1fY29yZV9iZy5qcydfX3diZ19jcmVhdGVUcmVlV2Fsa2VyX2Q4YjRjZTI4MjRmYzhkMTMAMRAuL2RpbV9jb3JlX2JnLmpzLF9fd2JnX2luc3RhbmNlb2ZfU2hhZG93Um9vdF9jZDc4MTU5ZTAzZmVkODg0AAoQLi9kaW1fY29yZV9iZy5qcx9fX3diZ19uZXh0Tm9kZV9lNzkyZTA2OWU4ODgwODY1AAoQLi9kaW1fY29yZV9iZy5qcx5fX3diZ19jb250ZW50XzZmZWQ5M2NhMWZkMjlmMDYABxAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX2dldF80N2Q0YTlhZTU5NTVjNzcxABkQLi9kaW1fY29yZV9iZy5qcyZfX3diZ19pbnN0YW5jZW9mX05vZGVfMDFiYmY1MTc5ODUxYjQ2YgAKEC4vZGltX2NvcmVfYmcuanMgX193Ymdfbm9kZVZhbHVlXzMxZGQ5YzA2NzAxNTg4Y2IAFRAuL2RpbV9jb3JlX2JnLmpzIV9fd2JnX3BhcmVudE5vZGVfZmUxNWJjYzI2ZGY0Mjg1NgAKEC4vZGltX2NvcmVfYmcuanMiX193YmdfYXBwZW5kQ2hpbGRfZGJmN2FkMmY0ODQxMzU2MAAPEC4vZGltX2NvcmVfYmcuanMiX193YmdfaXNDb25uZWN0ZWRfYzUyOTY1NWIwMmQwMDllNwAKEC4vZGltX2NvcmVfYmcuanMhX193YmdfaXNTYW1lTm9kZV8xZWRhOTZiODQ4MjE1OTZlABMQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19uZXh0U2libGluZ185MTEzNmRjN2E4ZWM5YjA5AAoQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19yZW1vdmVDaGlsZF9kMmRjNmZjMWQ2ZGI4OTZiAA8QLi9kaW1fY29yZV9iZy5qcyJfX3diZ19nZXRSb290Tm9kZV82ZGUwOTcxODk1NTk5ODFkAAcQLi9kaW1fY29yZV9iZy5qcyNfX3diZ19pbnNlcnRCZWZvcmVfMTBhYjBjMTliNDYzYzEyYgAYEC4vZGltX2NvcmVfYmcuanMmX193Ymdfc2V0X3RleHRDb250ZW50XzAxNzdiMmE2ZDkyOTNjMmMAHhAuL2RpbV9jb3JlX2JnLmpzIF9fd2JnX2Nsb25lTm9kZV83MDI0OWM4YmVlZDg4ZWUzABwQLi9kaW1fY29yZV9iZy5qcx9fX3diZ19jb250YWluc183NDNhYTdjOTQ0OTljMjY5ABMQLi9kaW1fY29yZV9iZy5qcx9fX3diZ19ub2RlVHlwZV81YzUwNTBjNjU3MWMzNDYzAAoQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19zZXRFbmRBZnRlcl9kZWFjNzM2OTZjYjU0Y2ViAAgQLi9kaW1fY29yZV9iZy5qcyNfX3diZ19zZXRFbmRCZWZvcmVfOWViYjU5NTRlMDk4MGIwZAAIEC4vZGltX2NvcmVfYmcuanMlX193YmdfZGVsZXRlQ29udGVudHNfYTgwMWI3MWQ1OTJkZDY4NAAREC4vZGltX2NvcmVfYmcuanMkX193Ymdfc2V0U3RhcnRBZnRlcl9jNjUyZmZkNjgzNTdjZjA0AAgQLi9kaW1fY29yZV9iZy5qcyVfX3diZ19zZXRTdGFydEJlZm9yZV85NDYxZWU0NWRmZDAyMWMyAAgQLi9kaW1fY29yZV9iZy5qcxtfX3diZ19jYWxsXzQwYjAwOGJhMzJmNzM5OTEADxAuL2RpbV9jb3JlX2JnLmpzHF9fd2JnX3BhcnNlX2MzZjcyYjVhMjRmODNjMDEAGhAuL2RpbV9jb3JlX2JnLmpzIF9fd2JnX3N0cmluZ2lmeV8wYTBmYmYyZWY3MjIzODBhAAcQLi9kaW1fY29yZV9iZy5qcxpfX3diZ19uZXdfMzdlYjQ1YWFmNWVlYjgyMAAbEC4vZGltX2NvcmVfYmcuanMZX193Ymdfb2ZfMDI3ZWIxNTM3MWFhYzkzMgAHEC4vZGltX2NvcmVfYmcuanMZX193Ymdfb2ZfNGNjMzczYmVmMWY3MTVhNAAYEC4vZGltX2NvcmVfYmcuanMeX193YmdfaXNBcnJheV9iY2YxMzc2ZDBkNzMyZDA4AAoQLi9kaW1fY29yZV9iZy5qcxpfX3diZ19uZXdfNzg3YjlmYjMzMGQ1NWQ3OAAaEC4vZGltX2NvcmVfYmcuanMZX193YmdfaXNfMjI0OGZmMmI1NzVkNjBjNwATEC4vZGltX2NvcmVfYmcuanMaX193YmdfbmV3X2NkNDM0ODI5MGFmYWU1ODYAGxAuL2RpbV9jb3JlX2JnLmpzMl9fd2JnX3N0YXRpY19hY2Nlc3Nvcl9HTE9CQUxfVEhJU18wMDNlZTgzM2FmOTY5OWZjAAwQLi9kaW1fY29yZV9iZy5qcytfX3diZ19zdGF0aWNfYWNjZXNzb3JfU0VMRl81M2JiMjA0NTc0MDE0NTNkAAwQLi9kaW1fY29yZV9iZy5qcy1fX3diZ19zdGF0aWNfYWNjZXNzb3JfR0xPQkFMX2U0MjkzZmIyMmNiZTc3ZGEADBAuL2RpbV9jb3JlX2JnLmpzLV9fd2JnX3N0YXRpY19hY2Nlc3Nvcl9XSU5ET1dfYjVlMDgxMGJmZWNiN2ZlYgAMEC4vZGltX2NvcmVfYmcuanMaX193YmdfZ2V0XzIwODBjNDkwMTVlMzUyNTQADxAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX2hhc18yYzRkNWNmMjVlYzhjMWNmABMQLi9kaW1fY29yZV9iZy5qcxpfX3diZ19zZXRfMjc5MzQ3OTg4ODMyOWNiNgAyEC4vZGltX2NvcmVfYmcuanMaX193YmdfbmV3XzAyYTEyY2JlM2RiNzk1YWYAGxAuL2RpbV9jb3JlX2JnLmpzHV9fd2JnX2NvbmNhdF8zZDAwYzZjNzAyMTJkNWM0AA8QLi9kaW1fY29yZV9iZy5qcx1fX3diZ19sZW5ndGhfZTgzZTgxOWY0OGM3NzRlNAAKEC4vZGltX2NvcmVfYmcuanMnX193YmdfX193YmluZGdlbl90aHJvd180Yzg4ZDhiZjI2NGZkOTg0AAAQLi9kaW1fY29yZV9iZy5qcypfX3diZ19fX3diaW5kZ2VuX2lzX2ZhbHN5X2Q4NjRiNjIzNTAwYWU2NWQAChAuL2RpbV9jb3JlX2JnLmpzKl9fd2JnX19fd2JpbmRnZW5fanN2YWxfZXFfMzhkN2JmYmU0Y2M4NDAzOQATEC4vZGltX2NvcmVfYmcuanMrX193YmdfX193YmluZGdlbl9pc19vYmplY3RfOGI5NjhjM2FiOGU5NjU5NQAKEC4vZGltX2NvcmVfYmcuanMrX193YmdfX193YmluZGdlbl9pc19zdHJpbmdfZmM0NTZmZWU1ZDMzMTdkZQAKEC4vZGltX2NvcmVfYmcuanMsX193YmdfX193YmluZGdlbl9udW1iZXJfZ2V0XzkzNGI2NDBkMDg4OWFmNzgAFRAuL2RpbV9jb3JlX2JnLmpzLF9fd2JnX19fd2JpbmRnZW5fc3RyaW5nX2dldF83Y2U4ZWVlN2ZkMzI3NTQ1ABUQLi9kaW1fY29yZV9iZy5qcy1fX3diZ19fX3diaW5kZ2VuX2Jvb2xlYW5fZ2V0XzRmMWJhZjlhMDBiZTNjNzQAChAuL2RpbV9jb3JlX2JnLmpzLV9fd2JnX19fd2JpbmRnZW5faXNfZnVuY3Rpb25fNzQxZmYyYmI2MTI4MzZmNQAKEC4vZGltX2NvcmVfYmcuanMuX193YmdfX193YmluZGdlbl9pc191bmRlZmluZWRfYmU1YjM0MjQ5ZmYxZmMxNQAKEC4vZGltX2NvcmVfYmcuanM2X193YmdfX193YmluZGdlbl9pc19udWxsX29yX3VuZGVmaW5lZF9mYjk2YWY5M2M3NTQ2MGFlAAoQLi9kaW1fY29yZV9iZy5qcyRfX3diZ19fd2JnX2NiX3VucmVmXzA5NzM2ODc5YTNmNjc1NTkAERAuL2RpbV9jb3JlX2JnLmpzH19fd2JpbmRnZW5faW5pdF9leHRlcm5yZWZfdGFibGUAFhAuL2RpbV9jb3JlX2JnLmpzI19fd2JpbmRnZW5fZ2VuZXJpY18wMDAwMDAwMDAwMDAwMDAxABoQLi9kaW1fY29yZV9iZy5qcyNfX3diaW5kZ2VuX2dlbmVyaWNfMDAwMDAwMDAwMDAwMDAwMgAzEC4vZGltX2NvcmVfYmcuanMjX193YmluZGdlbl9nZW5lcmljXzAwMDAwMDAwMDAwMDAwMDMAGgOaBJgEAgkJAgABAgACAgIjCQACAAYDAgkCACQEBQIABQMABQMDBgYJAB8fHwACJTQDAAkAAA0CAQY1AAADAAECAgMGAwMDAAwCDAANAgMAAwIAAgANAgIJAAAAAAAJAgMDAQACADYAAQANCQYGDQMJBgYFCQIJNyYABiUABg04CSQDBgMJAwUAAQIABjkNOjsECQAGAgIJBAACAwICBgYJBAYEFBQCAhACAgQGAAkAAAYAAQAGAAIEAwMAAgYBBAICDQkJAwEABgUNBBQ8PkADBgkGEAQFBQUJKScoAgUCBgIWBQEEEAAAAAIDBAAAAAAFBgIAAAYJCQIAAgQDAAYGAgAGAgYAAAIFAAUFAAQGAAICAgEEAgEDAgUUIAACAwICBAIAAQMCAAIDAwQWBAMFBgQDAgADAkUDRgADRwMCAgMAKipISQEDAwQEAgAFSisrBARLASwsBQAXFxcXFwUPAxAEAAQQAgwBAgAAACYBGQQBAQEBAQEBAgEBAAQCCAQEBAQEAAAHBwcHBAQDBAEFBAQCBAIEBQIDAgkDDAwDAwADAwAQAQIEAwADAwMRERERAwMAAAAAAAECAQEBAQEBAwMDBAAAAAAAAAAAAAAAAAAbAQQEBAQEBAEBBAEBAQEBAQEBAQEBAQEBAQEBAQEBAQMBAQEBAAQEBAMEBAADAAUDAyMAAAAMDAAEBBYMAQEBARYGBg0GBRRMAE0ECQJwAXFxbwCECAUDAQARBhkDfwFBgIDAAAt/AEHwxsIAC38AQaDIwgALB5oGLAZtZW1vcnkCAA1hZGRDb250cm9sbGVyAPUDC2JlZ2luUmVuZGVyAM0EB2Nzc1RleHQA1wMPY3VycmVudEluc3RhbmNlAPEECWVuZFJlbmRlcgCsBQtmbHVzaFN0eWxlcwD5AxNnZXRTa2lwRm9jdXNSZXN0b3JlAK0FDWhvc3RDb25uZWN0ZWQA/AMQaG9zdERpc2Nvbm5lY3RlZAD6Awhob3N0SW5pdADOBARodG1sAOIDC2luaXRSdW50aW1lAM8EBWtleWVkAP8DCm1lcmdlUHJvcHMAuwMPcGFyc2VBdHRyaWJ1dGVzAKYECHJlYWRQcm9wAI8EEHJlbW92ZUNvbnRyb2xsZXIAngQGcmVuZGVyAO4DDnJlbmRlckNoaWxkcmVuAKcEDXJlcXVlc3RVcGRhdGUAqAQSc2V0Q3VycmVudEluc3RhbmNlANAEE3NldFNraXBGb2N1c1Jlc3RvcmUA6gIIc2V0U3RhdGUA5AMKdW5zYWZlSFRNTACpBAl1c2VFZmZlY3QA9gMHdXNlTWVtbwDjAwZ1c2VSZWYA7wMIdXNlU2NvcGUA+wMIdXNlU3RhdGUA8AMIdXNlU3R5bGUA/QMMdmFsaWRhdGVKc29uAOUDD19fYWJvcnRfaGFuZGxlcgMBFV9faW5zdGFuY2VfdGVybWluYXRlZAMCPXdhc21fYmluZGdlbl9fY29udmVydF9fY2xvc3VyZXNfX19fX2ludm9rZV9faDRiNTljNTMyNTQ0MTIyMzMA3AMRX193YmluZGdlbl9tYWxsb2MA7wISX193YmluZGdlbl9yZWFsbG9jAIUDD19fd2JpbmRnZW5fZnJlZQC0BBVfX3diaW5kZ2VuX2V4dGVybnJlZnMBARdfX2V4dGVybnJlZl90YWJsZV9hbGxvYwDpARRfX3diaW5kZ2VuX2V4bl9zdG9yZQCzBBpfX3diaW5kZ2VuX2Rlc3Ryb3lfY2xvc3VyZQDHAxlfX2V4dGVybnJlZl90YWJsZV9kZWFsbG9jALcCEF9fd2JpbmRnZW5fc3RhcnQA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IAU2AuABIAIgCDYC3AEgAiAJNgLYASACQQA6APgBIAJBADYC8AEgAkKAgICAEDcC6AEgAiAEIAZrNgL0AQwBCyACQQA2AsgCIAIgCDYCxAIgAiAFNgLAAiACIAQ2ArwCIAIgBTYCuAIgAkKigICA8AQ3A7ACAkACQAJAAkADQCACQegAaiAbENUCIAIoAmwiCEGAgMQARg0BIAIoAmghByACQbACaiIJIAgQygNFDQALIAJB4ABqIAcgBSAEQby5wAAQ4wIgAiACKAJgIgg2ArACIAIgCCACKAJkajYCtAIgCRCzAyIIQYCAxABGDQEgCSAFIAQgBxDGASACKAKwAkGAgMQAaw4CAwACCyACQdgBaiACQYgCakEk/AoAAAwECyACQdgBaiACQYgCakEk/AoAAAwDCyACQdgBaiACQYgCakEk/AoAACANEJcFDAILIA4gDSkCADcCACAOQQhqIA1BCGooAgA2AgAgAigCtAIhCSACQdgAaiAHQQFqIAUgBEHMucAAEOMCIBQgAigCWCACKAJcEOACIAIgBCAJazYC9AEgAiAINgLYASACQYECOwH4AQsgAkGIAmoQtQQLIAItAPkBIgZFDQEgAkGIAmogBiACKALgASACKALkARDFASACKAKIAiIEQYCAgIB4Rg0DIAwgAikCjAI3AgggDCAENgIEIAxBgICAgHg2AgAgAkHYAWoQtQQLIAJBzAFqEJcFIAJBuAFqEKMEIAJBrAFqEJcFIAJBoAFqIgQQmwMgBBCcBQwFCyACQQI2AowCIAJBqMHAADYCiAIgAkICNwKUAiACQdIANgK8AiACQdIANgK0AiACIAJBsAJqNgKQAiACIAJBzAFqNgK4AiACIAJBrAFqNgKwAiACQfwBaiACQYgCahCIAiACQdACaiACKAKAAiACKAKEAhCUAiACKALUAiEPIAIoAtgCIQkgAkGAgICAeDYCsAJBASAJayEcIA9BAWohBiAJQQFrIQpBACEFA0ACQAJAIAkgBSIESwRAIARBAWohBSAEIA9qLQAAQTxHDQNBACEYIAUhCCAFIAlJDQEMAgsgAigCsAIhBCACQbACahCwBCACQdACahCXBSACQfwBahCXBSACQawBaiIFIAIoAtABIAIoAtQBELkEIAVB1sHAAEHIwcAAIARBgICAgHhHIgQbQQlBDiAEGxC5BCAC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wAFyOgAADAILIAFBDHYhByADQT9xQYB/ciEDIAFB//8DTQRAIAIgBToAAiACIAM6AAEgAiAHQeABcjoAAAwCCyACIAU6AAMgAiADOgACIAIgB0E/cUGAf3I6AAEgAiABQRJ2QXByOgAADAELIAIgAToAAAsgACAEIAZqNgIIQQAL5QICBH8BfiMAQSBrIgIkAAJAIAFFBEAgAEEANgIIIABCgICAgBA3AgAMAQsCQCABrSIGQiCIUARAIAJBCGogBqciBEEBQQFBoLPAABDiAiACQQA2AhwgAiACKQMINwIUIAJBFGpB6KTAAEHppMAAELUDA0ACQCABQQFNBEAgBCACKAIcIgFHDQEMBAsgAigCHCIDBEAgAigCGCIFIANqIAUgA/wKAAALIAIgAigCHEEBdDYCHCABQQF2IQEMAQsLIAQgAWsiAwRAIAEgAigCGCIFaiAFIAP8CgAACyACIAQ2AhwMAQsjAEEwayIAJAAgAEERNgIMIABBnKPAADYCCCAAQQE2AhQgAEH81sEANgIQIABCATcCHCAAIABBCGqtQoCAgICQDYQ3AyggACAAQShqNgIYIABBEGpBwLPAABDhAwALIAAgAikCFDcCACAAQQhqIAJBHGooAgA2AgALIAJBIGokAAuXAgEEfyMAQTBrIgAkACAAQSBqQfSfwAAQrwMgACgCICEBIAAgACgCJCICNgIsIAAgATYCKEEBIQMgAUEBcUUEQCAAQRhqQfyfwAAQrwMgACgCHCECIAAoAhghAyAAQShqEKsECyAAIAM2AiggACACNgIsQQEhASADQQFxRQRAIABBEGpB8J/AABCvAyAAKAIUIQIgACgCECEBIABBKGoQqwQLIAAgATYCKCAAIAI2AixBASEDIAFBAXFFBEAgAEEIakH4n8AAEK8DIAAoAgwhAiAAKAIIIQMgAEEoahCrBAtBgAghASADQQFxBEAgACACNgIoIABBKGoiARDeBAR/IAEQqgRBgAgFIAILIQELIABBMGokACABC9QBAgR/AX4jAEEgayIDJAACQAJAIAIgASACaiIESwRAQQAhAQwBC0EAIQFBCCAEIAAoAgAiBUEBdCICIAIgBEkbIgIgAkEITRsiBK0iB0IgiFBFDQAgB6ciBkH/////B0sNACADIAUEfyADIAU2AhwgAyAAKAIENgIUQQEFQQALNgIY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CGogCygCADYCACAAIAcpAhQ3AgAgB0EgaiQAIANBEGokAAtgAQJ/IwBBEGsiAiQAIAEEfyACQQhqIgMgASgCDDYCBCADIAEoAghBACABKAIAQYOAgIB4Rhs2AgAgAigCDCEDIAIoAggFQQALIQEgACADNgIEIAAgATYCACACQRBqJAALQgECfyMAQRBrIgIkACABBH8gAkEIaiABEIMEIAIoAgwhAyACKAIIBUEACyEBIAAgAzYCBCAAIAE2AgAgAkEQaiQACzoAIAEgAhD8ASAAAn9BASABQYABSQ0AGkECIAFBgBBJDQAaQQNBBCABQYCABEkbCzYCBCAAIAI2AgALhREDCH8FfgF8IAEoAggiA0GAgIABcSECIAArAwAhDyADQYCAgIABcUUEQCACQQBHIQVBACECIwBBoAFrIgAkACAPvSEKAn9BAyAPmUQAAAAAAADwf2ENABpBAiAKQoCAgICAgID4/wCDIgtCgICAgICAgPj/AFENABogCkL/////////B4MiDkKAgICAgICACIQgCkIBhkL+////////D4MgCkI0iKdB/w9xIgIbIgxCAYMhDSALUARAQQQgDlANARogAkGzCGshAkIBIQsgDVAMAQtCgICAgICAgCAgDEIBhiAMQoCAgICAgIAIUSIDGyEMQgJCASADGyELQct3Qcx3IAMbIAJqIQIgDVALIQMgACACOwGIASAAIAs3A4ABIABCATcDeCAAIAw3A3AgACADOgCKAQJAAkACQAJAAkACQAJAAkAgA0H/AXEiAkEBTQRAIABB4ABqIABB8ABqIABBB2oQrgEgACgCYEUNASAAQZgBaiAAQegAaigCADYCACAAIAApAmA3A5ABDAILIAJBAkYNAkEBIQJBydzAAEHK3MAAIApCAFMiBBtBydzAAEEBIAQbIAUbIQQgCkI/iKcgBXIhBSADQf8BcUEERg0DIABBAzYCICAAQfK9wQA2AhwgAEECOwEYDAcLIABBkAFqIABB8ABqIABBB2oQpAELIAAoApQBIgJFDQIgACgCkAEiBC0AAEEwTQ0DQcncwABBASAKQgBTIgMbIQdBydzAAEHK3MAAIAMbIQggCkI/iKchCSAALgGYASEGIAAgBDYCHCAAQQI7ARggAEEBNgIgIAJBAUYEQCAAQSRqIQNBAyECDAULIABBPGohAyAAQQI7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IAQoAghBAXE2AgAgACABNgIEIARBEGokAAtFAQF/IwBBEGsiAyQAIANBBGogACABIAIQlQMCQCADKAIIIgBFDQAgAygCDCIBRQ0AIAMoAgQgASAAENkECyADQRBqJAAL6wMBCH8jAEEQayIEJAAgBCABEOYDNgIAIAQgBBD5BDYCDCAEQQA2AgggBCAENgIEIwBBMGsiASQAIAFBFGogBEEEaiIDEPgBAkAgASgCFEGAgICAeEcEQCABQQQgA0EIaiIHKAIAIgIgAygCBGsiBkEAIAIgBk8bQQFqIgJBfyACGyICIAJBBE0bQQRBDEGkksAAEOICIAEoAgAhBiABKAIEIgIgASkCFDcCACACQQhqIAFBHGooAgA2AgAgAUEQaiIJQQE2AgAgASACNgIMIAEgBjYCCCABQShqIAcoAgA2AgAgASADKQIANwMgIAFBCGohAyABQSBqIQcjAEEQayICJAADQAJAIAJBBGogBxD4ASACKAIEQYCAgIB4Rg0AIAMoAggiBiADKAIARgRAIAcoAggiBSAHKAIEayIIQQAgBSAITxtBAWoiBUF/IAUbIgUgAygCACADKAIIIghrSwRAIAMgCCAFQQRBDBCWAwsLIAMoAgQgBkEMbGoiBSACKQIENwIAIAVBCGogAkEMaigCADYCACADIAZBAWo2AggMAQsLIAJBEGokACAAQQhqIAkoAgA2AgAgACABKQIINwIADAELIABBADYCCCAAQoCAgIDAADcCAAsgAUEwaiQAIAQQqgQgBEEQaiQAC68BAQR/IwBBEGsiAiQAIwBBEGsiAyQAAkACQCACQQhqIgUgASgCCCIEIAEoAgBJBH8gA0EIaiABIARBBEEEELYCIAMoAggiBEGBgICAeEcNASABKAIIBSAECzYCBCAFIAEoAgQ2AgAgA0EQaiQADAELIAQgAygCDEGAoMAAEJ0EAAsgAiACKAIIIAIoAgwQxgQgAigCBCEBIAAgAigCADYCACAAIAE2AgQgAkEQaiQAC0ABA39BBCEFAkAgA0UNACABKAIAIgZFDQAgACACNgIEIAAgASgCBDYCACADIAZsIQRBCCEFCyAAIAVqIAQ2AgALFAAgACABIAIgAyAEQfyiwAAQtQULFAAgACABIAIgAyAEQfDCwAAQtQULRwEBfyMAQRBrIgMkACABKAIAJQEgAigCACUBEBggA0EIahDyAyADKAIMIQEgACADKAIIQQFxNgIAIAAgATYCBCADQRBqJAALPAEBfyMAQRBrIgIkACACIAEoAgAlARCZASAAIAIoAgAEfiAAIAIrAwg5AwhCAQVCAAs3AwAgAkEQaiQAC0UBAX8jAEEgayIDJAAgAyACNgIcIAMgATYCGCADIAI2AhQgA0EIaiADQRRqQfChwAAQtQIgACADKQMINwMAIANBIGokAAs/AQF/IAAoAgghASAAKAIEIQADQCABBEAgABCXBSAAQQxqEJcFIABBGGoQlwUgAUEBayEBIABBKGohAAwBCwsLlA0DB38FfgF8IAEoAggiA0GAgIABcSECIAArAwAhDiADQYCAgIABcUUEQCACQQBHIQNBACECIwBBgAFrIgAkACAOvSEJAn9BAyAOmUQAAAAAAADwf2ENABpBAiAJQoCAgICAgID4/wCDIgpCgICAgICAgPj/AFENABogCUL/////////B4MiDUKAgICAgICACIQgCUIBhkL+////////D4MgCUI0iKdB/w9xIgIbIgtCAYMhDCAKUARAQQQgDVANARogAkGzCGshAkIBIQogDFAMAQtCgICAgICAgCAgC0IBhiALQoCAgICAgIAIUSIEGyELQgJCASAEGyEKQct3Qcx3IAQbIAJqIQIgDFALIQQgACACOwF4IAAgCjcDcCAAQgE3A2ggACALNwNgIAAgBDoAegJ/AkACQAJAAkAgBEH/AXEiAkEBTQRAIABBIGogAEHgAGogAEEPahCuAUHJ3MAAQQEgCUIAUyICGyEEQcncwABBytzAACACGyECIAlCP4inIQYgACgCIEUNASAAQdgAaiAAQShqKAIANgIAIAAgACkCIDcDUAwCCyACQQJGDQJBASECQcncwABBytzAACAJQgBTIgUbQcncwABBASAFGyADGyEFIAlCP4inIANyIQMgBEH/AXFBBEcNAyAAQQI7ASAgAEEBNgIoIABB9b3BADYCJCAAQSBqDAQLIABB0ABqIABB4ABqIABBD2oQpAELIAIgBCADGyEFIAMgBnIhAyAAIAAoAlAgACgCVCAALwFYQQAgAEEgahDVASAAKAIEIQIgACgCAAwCCyAAQQM2AiggAEHvvcEANgIkIABBAjsBIEEBIQVBACEDQQEhAiAAQSBqDAELIABBAzYCKCAAQfK9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NgJkIAJBxJTAADYCYCACQgE3AmwgAiAENgJ4IAIgAkH4AGo2AmggAkHUAGoiByAFEIQCIAQQlwUgAigCWCACKAJcEMUDIQQgBxCXBQwECyACQcgAaiACQThqEKkDIAIoAkgiBUGAgICAeEYNAQsgAiACKAJQIgQ2AkQgAiACKAJMIgc2AkAgAiAFNgI8IAJBEGoiBSAHIAQQtwQgAkE8ahCXBSACIAJBCGogCUEBahDSBDYCVCACQeAAaiACQdQAahDOAiAFAn8gAigCYEGAgICAeEcEQCACQYgBaiACQegAaigCACIENgIAIAIgAikCYDcDgAEgAigChAEMAQtBACEEIAJBADYCiAEgAkKAgICAEDcDgAFBAQsgBBC3BCACQYABahCXBSACQdQAahCqBCACQThqEKoEDAELCyACKAJMIQQLIAZBgICAgHg2AgAgBiAENgIEIAJBOGoQqgQgAkEQahCXBQsgAkEMahCqBCACQQhqEKoEIAJBkAFqJAACfyADKAIQQYCAgIB4RgRAQQEhAiADKAIUIQtBAAwBCyADIANBEGoQ+wEgAygCBCEMQQAhAiADKAIACyEGIAggAjYCDCAIIAs2AgggCCAMNgIEIAggBjYCACADQUBrJAAgCCgCACAIKAIEIAgoAgggCCgCDCAIQRBqJAALcQEFfyMAQRBrIgIkACACELwEIgQ2AgwgAkEMaiEFIwBBEGsiAyQAA0AgACABRwRAIAMgACgCACAAQQRqKAIAEM4DNgIMIAUgA0EMaiIGEMAEIABBCGohACAGEKoEDAELCyADQRBqJAAgAkEQaiQAIAQLLAIBfwF8IwBBEGsiASQAIAEgACgCACUBED45AwggAUEIaisDACABQRBqJAALMAEBfyABQQhrIgIgAigCAEEBaiICNgIAIAJFBEAACyAAIAE2AgQgAEGMocAANgIACy4AIAAoAgAiACABaiwAAEEATgR/IAApAwBCgIGChIiQoMCAf4N6p0EDdgUgAQsLNwEBfyMAQRBrIgMkACADIAAQ6QEiACACJgEgASAAEMECIAMoAgAgAygCBCADKAIIIANBEGokAAsnAQJ/IAAoAggiAyABKAIIRgR/IAAoAgQgASgCBCADEPYCBUEBC0ULKAAgASgCAARAIAIQqgUACyABQX82AgAgACABNgIEIAAgAUEEajYCAAst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ADcDACAHQQhqIANByABqKQMANwMAIANBDGogA0E4aigCADYCACADIAMpAzA3AgQMAgtB4J/AABCqBQALIAMgBUEYahCCAiADKAIAIQgLIAUgBSgCAEEBajYCACADQRhqIgUgA0EMaigCADYCACADIAMpAgQ3AxAgCEGGgICAeEYNACANIAg2AgAgDSADKQMQNwIEIA1BDGogBSgCADYCACADQeAAaiQADAELQeSRwAAQ9AIACyACQThqIgMgACABEN8BAkACQAJAAkAgAigCKCIAQYWAgIB4RgRAIAJB0ABqIAJBNGooAgA2AgAgAiACKQIsNwNIIAJB2ABqQaifwABBARDbAiACQQE2AnQgAkHYn8AANgJwDAELIAIoAjhBhYCAgHhHDQEgAkHQAGogAkHEAGooAgA2AgAgAiACKQI8NwNIIAJB2ABqQaifwABBARDbAiACQQE2AnQgAkG8n8AANgJwCyACQgE3AnwgAkECNgKMASACIAJBiAFqNgJ4IAIgAkHIAGoiATYCiAEgAkHkAGogAkHwAGoQhAIgAkEYaiACQeAAaikCADcDACACQSBqIAJB6ABqKQIANwMAIAIgAikCWDcDECABEJcFIAIoAihBhYCAgHhHBEAgAkEoahCLAwsgAigCOEGFgICAeEYEQCAAQYWAgIB4Rg0CDAMLIAMQiwMMAgsgAkHgAGogAkEwaikDADcDACACIAIpAyg3A1ggAkH4AGogA0EIaikDADcDACACIAMpAwA3A3AgAkEQaiACQdgAaiIAIAJB8ABqIgFBqJ/AAEEBEKYBIAEQiwMgABCLAyACKAI4QYWAgIB4Rw0BCyACQTxqEJcFCyACQThqIAJBIGopAwA3AwAgAkEwaiACQRhqKQMANwMAIAIgAikDEDcDKCACQfAAaiEFIwBBEGsiASQAAkAgAkEoaiIDKAIAQYCAgIB4RwRAQcgAEI4EIgBChICAgLCAgICAfzcCHCAAQeuswAA2AhggAEEAOgAMIABCgoCAgJCAgICAfzcCBCAAQeSswAA2AgAgAEKGgICAsICAgIB/NwI0IABB76zAADYCMCAAIAMpAgA3AiQgAEEsaiADQQhqKAIANgIAIAAgAykCDDcCPCAAQcQAaiADQRRqKAIANgIAIAFBAzYCBCABIAA2AgggAUEDNgIMDAELQTAQjgQiAEEFNgIcIABB5qzAADYCGCAAQQE6AAwgAEKCgICAkICAgIB/NwIEIABB5KzAADYCACAAIAMpAwg3AyAgAEEoaiADQRBqKQMANwMAIAFBAjYCDCABIAA2AgggAUECNgIECyAFIAFBBGoQhgMgAUEQaiQAIwBBEGsiACQAIABBDGoiAUEANgIAIABCgICAgBA3AgQgAEEEaiAFENMBIAxBCGogASgCADYCACAMIAApAgQ3AgAgAEEQaiQAIAUQiwMgAkGQAWokACAGQRhqEJAEIAZBEGoQkAQgBkEgaiQAIARBCGogDBD7ASAEIAQoAgggBCgCDBDGBCAKIAQpAwA3AgAgBEHQAGokACAKKAIAIAooAgQgCkEQaiQACykBAX8gACgCACIAQYAITyAAQYQISXEEfyAABRDpASIBIAAlASYBIAELC0ABAW8gABCIBEUEQCABEIgERQRAIAAoAgAlASABKAIAJQEQkgEhAhDpASIAIAImASAADwsgABDmAw8LIAEQ5gMLHQAgACgCACUBIAEEfyABKAIABUEACyUBEHJBAEcLJgEBfyMAQRBrIgEkACABIABBCGs2AgwgAUEMahDAAiABQRBqJAALJgEBfyMAQRBrIgEkACABIABBCGs2AgwgAUEMahCCBCABQRBqJAALJgAgACABNgIIIAAgAkEAIAFBAXEiARs2AgQgAEEAIAIgARs2AgALJwEBfyMAQRBrIgIkACACIAE2AgwgACACQQxqQQQQ7AEgAkEQaiQACyYBAX8gACgCCCIDIAFNBEAgASADIAIQuQIACyAAKAIEIAFBDGxqC6gCAQR/IwBBEGsiBSQAEOkBIgQgACYBEOkBIgYgASYBIwBB0ABrIgMkACADIAY2AhQgAyAENgIQIAMgAjYCGCADIANBzwBqIgI2AkggAyACNgJEIAMgAjYCQCADIANBGGo2AjwgAyACNgI4IAMgAjYCNCADIAI2AjAgAyADQRRqNgIsIAMgAjYCKCADIAI2AiQgAyACNgIgIAMgA0EQajYCHCMAQRBrIgIkACACQQhqIANBHGoiBCgCACgCACAEKAIQKAIAIAQoAiAoAgBBAEcQtAEgAigCDCEEIANBCGoiBiACKAIINgIAIAYgBDYCBCACQRBqJAAgAyADKAIIIAMoAgwQmAQgBSADKQMANwIAIANB0ABqJAAgBSgCACAFKAIE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CGoQ8gRFBEBBpJfAABCDAyEDDAELIAFBCGoQ3ARFBEBBqJfAABCDAyEDDAELIAEgAUEIahCVBTYCDEEAQayXwAAoAgARAQAiA0UEQEHkkcAAEPQCAAsgAyABQQxqIgQQtwMhAyAEEKoECyABQQhqEKoEIAFBEGokACACQSBqJAAgAyUBIAMQtwILYQECfxDpASICIAAmASMAQSBrIgEkACABIAI2AgggASABQR9qIgI2AhggASACNgIUIAEgAjYCECABIAFBCGo2AgwgAUEMaigCACgCABCBAiECIAFBIGokACACJQEgAhC3AguMAQEEfxDpASICIAAmASMAQSBrIgEkACABIAI2AgggASABQR9qIgI2AhggASACNgIUIAEgAjYCECABIAFBCGo2AgwgAUEMaigCACgCACEDIwBBEGsiAiQAIAIgAzYCDEEDENgEIgQlASADJQEQMSACQQxqEKoEIAJBEGokACABQSBqJAAgBCUBIAQQtwILFQAgACgCACIAQYQITwRAIAAQtwILCxIAIAAoAgAEQCAAQQRqEKoECwsZACAAKAIAIAAoAgQgASgCACABKAIEEIEECxYAIAAQlwUgAEEMaiIAEJsDIAAQnAULGAAgACgCAEUEQEEADwsgAEG8lcAAEKwECygBAW8gACgCACUBIAEoAgAlASACKAIAJQEQCiEDEOkBIgAgAyYBIAALFgAgACgCAEGAgICAeEcEQCAAEJcFCwsTACAAKAIARQRAIABBBGoQqgQLCxAAIAIEQCAAIAIgARDZBAsLEwBB6MfCACAArUIghkIBhDcDAAsQACABBEAgACABIAIQ2QQLCxIAIABBBGoQlwUgAEEQahCXBQsWACAAKAIAIAEgAiAAKAIEKAIMEQUACw4AIAAgASABIAJqELEDCxYAIAAoAgAlASABKAIAJQEQlgFBAEcLDgAgACABIAEgAmoQtQMLoAcBA38jAEHwAGsiBSQAIAUgAzYCDCAFIAI2AggCfwJAAkACQAJAIAFBgQJPBEBB/QEhBgNAIAAgBmoiB0EDaiwAAEG/f0oNAyAHQQJqLAAAQb9/Sg0CIAdBAWosAABBv39KDQQgBywAAEG/f0oNBSAGQQRrIgZBfUcNAAtBACEGDAQLIAUgATYCFCAFIAA2AhBBAQwECyAGQQJqIQYMAgsgBkEDaiEGDAELIAZB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GyADIAgQuQIACyAKIAUgBxC5AgALIAEgBSALaiILNgIUIAYNAQsLQQALIgo2AhwMAQsLIAAgCjYCAAs0AQF/IwBBIGsiAiQAIAJBADYCGCACQQE2AgwgAiABNgIIIAJCBDcCECACQQhqIAAQ4QMAC0UBAX8jAEEwayIDJAAgA0EBNgIMIAMgAjYCCCADQgE3AhQgAyADQS9qrSABhDcDICADIANBIGo2AhAgA0EIaiAAEOEDAAsL+8MCKwBBgIDAAAudDy9ydXN0Yy9lZDYxZTdkN2UyNDI0OTRmYjcwNTdmMjY1NzMwMGQ5ZTc3YmI0ZmNiL2xpYnJhcnkvY29yZS9zcmMvY2VsbC9sYXp5LnJzAGRpbS1zcGVjLWNvcmUvc3JjL3BvbGljeS5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9mbHQyZGVjL3N0cmF0ZWd5L2dyaXN1LnJzAGRpbS1jb3JlL3NyYy9ob3N0LnJzAGxpYnJhcnkvYWxsb2Mvc3JjL2ZtdC5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9kaXlfZmxvYXQucnMAZGltLWNvcmUvc3JjL2NvbnRyYWN0cy5ycwBkaW0tY29yZS9zcmMvY3NzLnJzAC9ob21lL3JhanUvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi93YXNtLWJpbmRnZW4tMC4yLjEzMC9zcmMvY29udmVydC9zbGljZXMucnMAL3J1c3RjL2VkNjFlN2Q3ZTI0MjQ5NGZiNzA1N2YyNjU3MzAwZDllNzdiYjRmY2IvbGlicmFyeS9hbGxvYy9zcmMvc3RyLnJzAC9ydXN0Yy9lZDYxZTdkN2UyNDI0OTRmYjcwNTdmMjY1NzMwMGQ5ZTc3YmI0ZmNiL2xpYnJhcnkvY29yZS9zcmMvaXRlci90cmFpdHMvaXRlcmF0b3IucnMAbGlicmFyeS9jb3JlL3NyYy9udW0vZGVjMmZsdC9kZWNpbWFsX3NlcS5ycwAvcnVzdGMvZWQ2MWU3ZDdlMjQyNDk0ZmI3MDU3ZjI2NTczMDBkOWU3N2JiNGZjYi9saWJyYXJ5L2NvcmUvc3JjL3N0ci9wYXR0ZXJuLnJzAC9ob21lL3JhanUvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi93YXNtLWJpbmRnZW4tMC4yLjEzMC9zcmMvY2FjaGUvaW50ZXJuLnJzAC9ob21lL3JhanUvcmVwb3MvcG9zaXRpdmUtaW50ZW50aW9ucy9kaW0vcnVzdC9kaW0tY29udHJhY3QtY29yZS9zcmMvanNvbi5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9mbHQyZGVjL3N0cmF0ZWd5L2RyYWdvbi5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9iaWdudW0ucnMAZGltLWNvcmUvc3JjL2RvbS5ycwAvcnVzdGMvZWQ2MWU3ZDdlMjQyNDk0ZmI3MDU3ZjI2NTczMDBkOWU3N2JiNGZjYi9saWJyYXJ5L3N0ZC9zcmMvdGhyZWFkL2xvY2FsLnJzAC9ob21lL3JhanUvLmNhcmdvL3JlZ2lzdHJ5L3NyYy9pbmRleC5jcmF0ZXMuaW8tMTk0OWNmOGM2YjViNTU3Zi9qcy1zeXMtMC4zLjEwNy9zcmMvZnV0dXJlcy9qc3BpLnJzAC9ydXN0Yy9lZDYxZTdkN2UyNDI0OTRmYjcwNTdmMjY1NzMwMGQ5ZTc3YmI0ZmNiL2xpYnJhcnkvYWxsb2Mvc3JjL3N0cmluZy5ycwBkaW0tY29udHJhY3QtY29yZS9zcmMvdmFsaWRhdGUucnMAbGlicmFyeS9jb3JlL3NyYy9udW0vZGVjMmZsdC9wYXJzZS5ycwAvaG9tZS9yYWp1L3JlcG9zL3Bvc2l0aXZlLWludGVudGlvbnMvZGltL3J1c3QvZGltLXNwZWMtY29yZS9zcmMvcHJlcGFyZS5ycwAvcnVzdGMvZWQ2MWU3ZDdlMjQyNDk0ZmI3MDU3ZjI2NTczMDBkOWU3N2JiNGZjYi9saWJyYXJ5L2NvcmUvc3JjL2Nsb25lLnJzAGxpYnJhcnkvY29yZS9zcmMvdW5pY29kZS9wcmludGFibGUucnMAL3J1c3RjL2VkNjFlN2Q3ZTI0MjQ5NGZiNzA1N2YyNjU3MzAwZDllNzdiYjRmY2IvbGlicmFyeS9hbGxvYy9zcmMvc2xpY2UucnMAL3J1c3QvZGVwcy9oYXNoYnJvd24tMC4xNS41L3NyYy9yYXcvbW9kLnJzAGxpYnJhcnkvY29yZS9zcmMvZm10L21vZC5ycwAvcnVzdGMvZWQ2MWU3ZDdlMjQyNDk0ZmI3MDU3ZjI2NTczMDBkOWU3N2JiNGZjYi9saWJyYXJ5L2FsbG9jL3NyYy9yYXdfdmVjL21vZC5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9mbHQyZGVjL21vZC5ycwAvcnVzdGMvZWQ2MWU3ZDdlMjQyNDk0ZmI3MDU3ZjI2NTczMDBkOWU3N2JiNGZjYi9saWJyYXJ5L2FsbG9jL3NyYy92ZWMvc3BlY19mcm9tX2l0ZXJfbmVzdGVkLnJzAC9ydXN0L2RlcHMvZGxtYWxsb2MtMC4yLjEwL3NyYy9kbG1hbGxvYy5ycwBsaWJyYXJ5L3N0ZC9zcmMvYWxsb2MucnMAbGlicmFyeS9jb3JlL3NyYy91bmljb2RlL3VuaWNvZGVfZGF0YS5ycwAAAAAXARAAagAAADsBAAAOAEGoj8AAC+sSAQAAAAcAAAAIAAAAY2xvc3VyZSBpbnZva2VkIHJlY3Vyc2l2ZWx5IG9yIGFmdGVyIGJlaW5nIGRyb3BwZWQAAP8EEABKAAAAgQEAAB8AAAD/BBAASgAAAIYBAAAZAAAA/wQQAEoAAACZAQAAEwAAAP8EEABKAAAAogEAABUAAAD/BBAASgAAAKgBAAANAAAA/wQQAEoAAACeAQAAHgAAAP8EEABKAAAAngEAABUAAAD/BBAASgAAAJ8BAAAdAAAAe30AAGgIEAABAAAAaQgQAAEAAAA9JycAAQAAAAAAAAB8CBAAAgAAAH4IEAABAAAA/wQQAEoAAACNAQAAKAAAAF9fVkFMVUVfX18AAKgIEAAIAAAAsAgQAAIAAAD/BBAASgAAAIMBAAAOAAAA/wQQAEoAAACEAQAADgAAALgDEABPAAAAGQEAABkAAABQAhAATwAAAOUFAAAUAAAAUAIQAE8AAADlBQAAIQAAAFACEABPAAAA2QUAACEAAADLARAAWAAAAOsHAAAJAAAAawQQAEsAAADoAQAAFwAAAIIBEABIAAAATAEAABAAAACCARAASAAAAEgBAAAUAAAAggEQAEgAAABJAQAAFAAAAAkDEABLAAAABAAAAAoAAABQAhAATwAAAGkEAAAkAAAAugUQAEoAAAC9AQAAHQAAAF8kY3NzUmVzdWx0JFZhbHVlIHBhc3NlZCB0byAnY3NzJyBmdW5jdGlvbiBtdXN0IGJlIGEgJ2NzcycgZnVuY3Rpb24gcmVzdWx0OiAuIFVzZSAndW5zYWZlQ1NTJyB0byBwYXNzIG5vbi1saXRlcmFsIHZhbHVlcywgYnV0IHRha2UgY2FyZSB0byBlbnN1cmUgcGFnZSBzZWN1cml0eS6wCRAAQAAAAPAJEABUAAAAY3NzVGV4dAADARAAEwAAAB4AAAANAAAAAwEQABMAAAAfAAAADQAAAHZhbHVlY2hlY2tlZGN1cnJlbnRyYXc8c2xvdD48L3Nsb3Q+AJIKEAANAAAACQAAAHRlbXBsYXRle3tkaW19fQC0ChAABwAAAKQDEAATAAAAtwAAABkAAACkAxAAEwAAAMwAAAArAAAAZGF0YS1kaW0tAAAApAMQABMAAADYAAAAKAAAAGRldGFjaGVkIG1hcmtlcnRwbWF4Z3JwAKQDEAATAAAAAwEAABgAAAAKAAAAAQAAAAAAAAABAAAAAAAAAAEAAAAAAAAAYWN0aXZlRWxlbWVudHNlbGVjdGlvblN0YXJ0c2VsZWN0aW9uRW5kcHJldmVudFNjcm9sbGZvY3Vzc2V0U2VsZWN0aW9uUmFuZ2VJTlBVVFRFWFRBUkVBU0VMRUNUAAAACwAAAAwAAAANAAAApAMQABMAAADZAQAAHAAAAA4AAACkAxAAEwAAAFUBAAAiAAAApAMQABMAAACIAQAAIwAAAKQDEAATAAAAjQEAACMAAACkAxAAEwAAAJUBAAAkAAAA77+wZGlt77+xAAAApAMQABMAAACsAQAAJwAAAKQDEAATAAAArQEAACYAAABodG1sYC4uLmAgcmVxdWlyZXMgYSB0ZW1wbGF0ZSBsaXRlcmFsIChUZW1wbGF0ZVN0cmluZ3NBcnJheSB3aXRoIC5yYXcpLiBEbyBub3QgY2FsbCBodG1sKCkgd2l0aCBhIHBsYWluIHN0cmluZyBvciBjcmFmdGVkIGFycmF5Lg8AAABkb2N1bWVudBAAAACZABAAFAAAABYBAAAZAAAAaG9vay1kZXBlbmRlbmNpZXNjb250cm9sbGVyUmVnaXN0ZXJlZGNsZWFudXBfX2RpbUVmZmVjdGNoaWxkcmVuY2hpbGRFbGVtZW50c5kAEAAUAAAABgEAABkAAABzaGFkb3dSb290aG9va05hbWVbZGF0YS1zdHlsZS1ob29rPSIiXQAAPg0QABIAAABQDRAAAgAAAHByZWZlckFkb3B0ZWRhZG9wdGVkU3R5bGVTaGVldHNjc3NSZXN1bHRzdHlsZVNoZWV0cmVwbGFjZVN5bmMAAAARAAAAmQAQABQAAAAeAAAAGAAAAHN0eWxlZGF0YS1zdHlsZS1ob29raG9zdENvbm5lY3RlZHF1ZXJ5U2VsZWN0b3J0aGVuAAASAAAAaG9zdFVwZGF0ZWRob3N0VXBkYXRlSG9va3Mgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIGluc2lkZSBhIGNvbXBvbmVudC6ZABAAFAAAABsBAAAeAAAAaG9zdERpc2Nvbm5lY3RlZJkAEAAUAAAAEQEAABkAAACZABAAFAAAACYBAAAVAAAAY3VzdG9tRWxlbWVudHNEaW0gcnVudGltZSBub3QgaW5pdGlhbGlzZWR0YWd1c2VTY29wZTogY2Fubm90IHJlc29sdmUgdGFnIGZvciAiIi4gVXNlIGEgaHlwaGVuYXRlZCB0YWcga2V5IG9yIGNhbGwgZGVmaW5lKCkgb24gdGhlIGNvbXBvbmVudCBmaXJzdC4AAKAOEAAiAAAAwg4QAEQAAACZABAAFAAAAOABAAA2AAAAY29tcG9uZW50AAAAmQAQABQAAADUAQAAFQAAAHN0eWxlLWhvb2stRmFpbGVkIHRvIHBhcnNlIG9iamVjdCBhdHRyaWJ1dGUgYXMgSlNPTiAodXNlIC5wcm9wcyBmb3IgZnVuY3Rpb25zL25vbi1KU09OIHZhbHVlcyk6ABMAAAAkYmFkIHZhbHVlIGpzb246IAAAAKkPEAAQAAAAYmFkIHNjaGVtYSBqc29uOiAAAADEDxAAEQAAAOkAEAAZAAAAEQAAAB8AAABIoxAAUKMQAFijEABgoxAAFwEQAGoAAAA7AQAADgAAAGNsb3N1cmUgaW52b2tlZCByZWN1cnNpdmVseSBvciBhZnRlciBiZWluZyBkcm9wcGVkaW50ZXJuYWwgZXJyb3I6IGVudGVyZWQgdW5yZWFjaGFibGUgY29kZQAAAAAQAE0AAAD+AAAALgAAAAAAEABNAAAA7QAAAEwAAABFAAAARgAAAEcAAABIAAAACAQQAGIAAADIAAAALAAAAAgEEABiAAAAuwAAACAAAABLAAAAoAIQAGgAAAAvAAAAHQAAAKAC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AgMACQUHAAMBAgUJAwEDAgIFBwQGAQUEBwgFAQUGAgUEBgUGBgECCAcDAAcHAwkCBQcIAQIFAgMCCAMABgQDBgUDCAYJBgIICQAGAgUBAQYEAQUDAgEIAgYJAwQIAQQEBQMBAgUFCAIABwYGAAkBAwQGBwQABwICBgUGAgUCCQEAAwgDAAQFBgcDAwcAAwYBAwIIAQIFAQQFBQEJAQUCAggDBgYIBQEIAAYGBAAGAgUHAgcFCQUHBgEEAQgDBAIFCQADAwIAAwECBQMGAwcJBwgIAAcACQEHAQIJBQEGBgABBQYCBQEIAQgJCAkEAAMFBAUIBQYEBwUIAwAABwgBAgUJAAkECQQHAAEHBwIJAggCAwcJAQUAAwkABgIFBAUEBwQHAwUACAgGBAYEAQEICQUHBQEJBQMBAgUCAgcDBwMGBwUEBAMCAwIABQkEBwgHBQkHBgUGAgUBAQMGCAYIAwcHAgEGAQYAAgkHAwkDBwkICAIIAQIFBQYIBAMEAQgIBgAIAAgAAQQIBgkGCAkJBAEEAAYCBQIIBAIBBwAJBAMABAAEAAAHBAMECAQECQcABwADAQIFAQQCAQAIBQQHAQUCAAIAAAMHAQcEAgIECAUDBQEFBgIFBwEABQQCBwMFBwYAAQAAAQgFCAcBAQIEAgYHBQcIAQIFAwUFAgcBAwYHCAgAAAUAAAkCCQMFBQYCAQMDBwgJAAYCBQEHBwYDBQYIAwkEAAACBQAEBgQGBwcIAQAGBggJBAUDAQIFCAgIAQcIBAEJBwAAAQIFAgMCAwMICQAFAwMEBAcCBgUGAgUEBAQACAkCAAkIBQAABgIGAQYBBgkEBQIGBgcCAwYDAggBAgUCAgIABAQGAAQJAgUAAwEDAAgACAQHAgYDAwMGAQgBBgQABgIFAQEBAAICAwACBAYCBQEFBgUEAAQCAwYDAQYGCAAJAAgCAAMBAgUFBQUBAQEFAQIDAQIFBwgCBwACAQEIAQUIAwQABAUEAQABBQYCBQIHBwUFBQcFBgEFBgIICQEDBQEABQkABwkBBwACAgcABQAHCAECBQEDCAcHBwgHCAAHCAEEBAUGBwUFAgkFAwkFCAUBAQMFAgUDCQAGAgUGCQMICAkDCQADCQAHAgIIAwcHBgQHBgkHCQIFBQYHBgIGCQUDAQIFAwQGCQQEBgkFAQkFAwYBBAEICAgCAwgE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APkAAADaAAAA+gAAANsAAAD7AAAA3AAAAPwAAADdAAAA/QAAAN4AAAD+AAAAAAEAAAEBAAACAQAAAwEAAAQBAAAFAQAABgEAAAcBAAAIAQAACQEAAAoBAAALAQAADAEAAA0BAAAOAQAADwEAABABAAARAQAAEgEAABMBAAAUAQAAFQEAABYBAAAXAQAAGAEAABkBAAAaAQAAGwEAABwBAAAdAQAAHgEAAB8BAAAgAQAAIQEAACIBAAAjAQAAJAEAACUBAAAmAQAAJwEAACgBAAApAQAAKgEAACsBAAAsAQAALQEAAC4BAAAvAQAAMAEAAAAAQAAyAQAAMwEAADQBAAA1AQAANgEAADcBAAA5AQAAOgEAADsBAAA8AQAAPQEAAD4BAAA/AQAAQAEAAEEBAABCAQAAQwEAAEQBAABFAQAARgEAAEcBAABIAQAASgEAAEsBAABMAQAATQEAAE4BAABPAQAAUAEAAFEBAABSAQAAUwEAAFQBAABVAQAAVgEAAFcBAABYAQAAWQEAAFoBAABbAQAAXAEAAF0BAABeAQAAXwEAAGABAABhAQAAYgEAAGMBAABkAQAAZQEAAGYBAABnAQAAaAEAAGkBAABqAQAAawEAAGwBAABtAQAAbgEAAG8BAABwAQAAcQEAAHIBAABzAQAAdAEAAHUBAAB2AQAAdwEAAHgBAAD/AAAAeQEAAHoBAAB7AQAAfAEAAH0BAAB+AQAAgQEAAFMCAACCAQAAgwEAAIQBAACFAQAAhgEAAFQCAACHAQAAiAEAAIkBAABWAgAAigEAAFcCAACLAQAAjAEAAI4BAADdAQAAjwEAAFkCAACQAQAAWwIAAJEBAACSAQAAkwEAAGACAACUAQAAYwIAAJYBAABpAgAAlwEAAGgCAACYAQAAmQEAAJwBAABvAgAAnQEAAHICAACfAQAAdQIAAKABAAChAQAAogEAAKMBAACkAQAApQEAAKYBAACAAgAApwEAAKgBAACpAQAAgwIAAKwBAACtAQAArgEAAIgCAACvAQAAsAEAALEBAACKAgAAsgEAAIsCAACzAQAAtAEAALUBAAC2AQAAtwEAAJICAAC4AQAAuQEAALwBAAC9AQAAxAEAAMYBAADFAQAAxgEAAMcBAADJAQAAyAEAAMkBAADKAQAAzAEAAMsBAADMAQAAzQEAAM4BAADPAQAA0AEAANEBAADSAQAA0wEAANQBAADVAQAA1gEAANcBAADYAQAA2QEAANoBAADbAQAA3AEAAN4BAADfAQAA4AEAAOEBAADiAQAA4wEAAOQBAADlAQAA5gEAAOcBAADoAQAA6QEAAOoBAADrAQAA7AEAAO0BAADuAQAA7wEAAPEBAADzAQAA8gEAAPMBAAD0AQAA9QEAAPYBAACVAQAA9wEAAL8BAAD4AQAA+QEAAPoBAAD7AQAA/AEAAP0BAAD+AQAA/wEAAAACAAABAgAAAgIAAAMCAAAEAgAABQIAAAYCAAAHAgAACAIAAAkCAAAKAgAACwIAAAwCAAANAgAADgIAAA8CAAAQAgAAEQIAABICAAATAgAAFAIAABUCAAAWAgAAFwIAABgCAAAZAgAAGgIAABsCAAAcAgAAHQIAAB4CAAAfAgAAIAIAAJ4BAAAiAgAAIwIAACQCAAAlAgAAJgIAACcCAAAoAgAAKQIAACoCAAArAgAALAIAAC0CAAAuAgAALwIAADACAAAxAgAAMgIAADMCAAA6AgAAZSwAADsCAAA8AgAAPQIAAJoBAAA+AgAAZiwAAEECAABCAgAAQwIAAIABAABEAgAAiQIAAEUCAACMAgAARgIAAEcCAABIAgAASQIAAEoCAABLAgAATAIAAE0CAABOAgAATwIAAHADAABxAwAAcgMAAHMDAAB2AwAAdwMAAH8DAADzAwAAhgMAAKwDAACIAwAArQMAAIkDAACuAwAAigMAAK8DAACMAwAAzAMAAI4DAADNAwAAjwMAAM4DAACRAwAAsQMAAJIDAACyAwAAkwMAALMDAACUAwAAtAMAAJUDAAC1AwAAlgMAALYDAACXAwAAtwMAAJgDAAC4AwAAmQMAALkDAACaAwAAugMAAJsDAAC7AwAAnAMAALwDAACdAwAAvQMAAJ4DAAC+AwAAnwMAAL8DAACgAwAAwAMAAKEDAADBAwAAowMAAMMDAACkAwAAxAMAAKUDAADFAwAApgMAAMYDAACnAwAAxwMAAKgDAADIAwAAqQMAAMkDAACqAwAAygMAAKsDAADLAwAAzwMAANcDAADYAwAA2QMAANoDAADbAwAA3AMAAN0DAADeAwAA3wMAAOADAADhAwAA4gMAAOMDAADkAwAA5QMAAOYDAADnAwAA6AMAAOkDAADqAwAA6wMAAOwDAADtAwAA7gMAAO8DAAD0AwAAuAMAAPcDAAD4AwAA+QMAAPIDAAD6AwAA+wMAAP0DAAB7AwAA/gMAAHwDAAD/AwAAfQMAAAAEAABQBAAAAQQAAFEEAAACBAAAUgQAAAMEAABTBAAABAQAAFQEAAAFBAAAVQQAAAYEAABWBAAABwQAAFcEAAAIBAAAWAQAAAkEAABZBAAACgQAAFoEAAALBAAAWwQAAAwEAABcBAAADQQAAF0EAAAOBAAAXgQAAA8EAABfBAAAEAQAADAEAAARBAAAMQQAABIEAAAyBAAAEwQAADMEAAAUBAAANAQAABUEAAA1BAAAFgQAADYEAAAXBAAANwQAABgEAAA4BAAAGQQAADkEAAAaBAAAOgQAABsEAAA7BAAAHAQAADwEAAAdBAAAPQQAAB4EAAA+BAAAHwQAAD8EAAAgBAAAQAQAACEEAABBBAAAIgQAAEIEAAAjBAAAQwQAACQEAABEBAAAJQQAAEUEAAAmBAAARgQAACcEAABHBAAAKAQAAEgEAAApBAAASQQAACoEAABKBAAAKwQAAEsEAAAsBAAATAQAAC0EAABNBAAALgQAAE4EAAAvBAAATwQAAGAEAABhBAAAYgQAAGMEAABkBAAAZQQAAGYEAABnBAAAaAQAAGkEAABqBAAAawQAAGwEAABtBAAAbgQAAG8EAABwBAAAcQQAAHIEAABzBAAAdAQAAHUEAAB2BAAAdwQAAHgEAAB5BAAAegQAAHsEAAB8BAAAfQQAAH4EAAB/BAAAgAQAAIEEAACKBAAAiwQAAIwEAACNBAAAjgQAAI8EAACQBAAAkQQAAJIEAACTBAAAlAQAAJUEAACWBAAAlwQAAJgEAACZBAAAmgQAAJsEAACcBAAAnQQAAJ4EAACfBAAAoAQAAKEEAACiBAAAowQAAKQEAAClBAAApgQAAKcEAACoBAAAqQQAAKoEAACrBAAArAQAAK0EAACuBAAArwQAALAEAACxBAAAsgQAALMEAAC0BAAAtQQAALYEAAC3BAAAuAQAALkEAAC6BAAAuwQAALwEAAC9BAAAvgQAAL8EAADABAAAzwQAAMEEAADCBAAAwwQAAMQEAADFBAAAxgQAAMcEAADIBAAAyQQAAMoEAADLBAAAzAQAAM0EAADOBAAA0AQAANEEAADSBAAA0wQAANQEAADVBAAA1gQAANcEAADYBAAA2QQAANoEAADbBAAA3AQAAN0EAADeBAAA3wQAAOAEAADhBAAA4gQAAOMEAADkBAAA5QQAAOYEAADnBAAA6AQAAOkEAADqBAAA6wQAAOwEAADtBAAA7gQAAO8EAADwBAAA8QQAAPIEAADzBAAA9AQAAPUEAAD2BAAA9wQAAPgEAAD5BAAA+gQAAPsEAAD8BAAA/QQAAP4EAAD/BAAAAAUAAAEFAAACBQAAAwUAAAQFAAAFBQAABgUAAAcFAAAIBQAACQUAAAoFAAALBQAADAUAAA0FAAAOBQAADwUAABAFAAARBQAAEgUAABMFAAAUBQAAFQUAABYFAAAXBQAAGAUAABkFAAAaBQAAGwUAABwFAAAdBQAAHgUAAB8FAAAgBQAAIQUAACIFAAAjBQAAJAUAACUFAAAmBQAAJwUAACgFAAApBQAAKgUAACsFAAAsBQAALQUAAC4FAAAvBQAAMQUAAGEFAAAyBQAAYgUAADMFAABjBQAANAUAAGQFAAA1BQAAZQUAADYFAABmBQAANwUAAGcFAAA4BQAAaAUAADkFAABpBQAAOgUAAGoFAAA7BQAAawUAADwFAABsBQAAPQUAAG0FAAA+BQAAbgUAAD8FAABvBQAAQAUAAHAFAABBBQAAcQUAAEIFAAByBQAAQwUAAHMFAABEBQAAdAUAAEUFAAB1BQAARgUAAHYFAABHBQAAdwUAAEgFAAB4BQAASQUAAHkFAABKBQAAegUAAEsFAAB7BQAATAUAAHwFAABNBQAAfQUAAE4FAAB+BQAATwUAAH8FAABQBQAAgAUAAFEFAACBBQAAUgUAAIIFAABTBQAAgwUAAFQFAACEBQAAVQUAAIUFAABWBQAAhgUAAKAQAAAALQAAoRAAAAEtAACiEAAAAi0AAKMQAAADLQAApBAAAAQtAAClEAAABS0AAKYQAAAGLQAApxAAAActAACoEAAACC0AAKkQAAAJLQAAqhAAAAotAACrEAAACy0AAKwQAAAMLQAArRAAAA0tAACuEAAADi0AAK8QAAAPLQAAsBAAABAtAACxEAAAES0AALIQAAASLQAAsxAAABMtAAC0EAAAFC0AALUQAAAVLQAAthAAABYtAAC3EAAAFy0AALgQAAAYLQAAuRAAABktAAC6EAAAGi0AALsQAAAbLQAAvBAAABwtAAC9EAAAHS0AAL4QAAAeLQAAvxAAAB8tAADAEAAAIC0AAMEQAAAhLQAAwhAAACItAADDEAAAIy0AAMQQAAAkLQAAxRAAACUtAADHEAAAJy0AAM0QAAAtLQAAoBMAAHCrAAChEwAAcasAAKITAAByqwAAoxMAAHOrAACkEwAAdKsAAKUTAAB1qwAAphMAAHarAACnEwAAd6sAAKgTAAB4qwAAqRMAAHmrAACqEwAAeqsAAKsTAAB7qwAArBMAAHyrAACtEwAAfasAAK4TAAB+qwAArxMAAH+rAACwEwAAgKsAALETAACBqwAAshMAAIKrAACzEwAAg6sAALQTAACEqwAAtRMAAIWrAAC2EwAAhqsAALcTAACHqwAAuBMAAIirAAC5EwAAiasAALoTAACKqwAAuxMAAIurAAC8EwAAjKsAAL0TAACNqwAAvhMAAI6rAAC/EwAAj6sAAMATAACQqwAAwRMAAJGrAADCEwAAkqsAAMMTAACTqwAAxBMAAJSrAADFEwAAlasAAMYTAACWqwAAxxMAAJerAADIEwAAmKsAAMkTAACZqwAAyhMAAJqrAADLEwAAm6sAAMwTAACcqwAAzRMAAJ2rAADOEwAAnqsAAM8TAACfqwAA0BMAAKCrAADREwAAoasAANITAACiqwAA0xMAAKOrAADUEwAApKsAANUTAAClqwAA1hMAAKarAADXEwAAp6sAANgTAACoqwAA2RMAAKmrAADaEwAAqqsAANsTAACrqwAA3BMAAKyrAADdEwAArasAAN4TAACuqwAA3xMAAK+rAADgEwAAsKsAAOETAACxqwAA4hMAALKrAADjEwAAs6sAAOQTAAC0qwAA5RMAALWrAADmEwAAtqsAAOcTAAC3qwAA6BMAALirAADpEwAAuasAAOoTAAC6qwAA6xMAALurAADsEwAAvKsAAO0TAAC9qwAA7hMAAL6rAADvEwAAv6sAAPATAAD4EwAA8RMAAPkTAADyEwAA+hMAAPMTAAD7EwAA9BMAAPwTAAD1EwAA/RMAAIkcAACKHAAAkBwAANAQAACRHAAA0RAAAJIcAADSEAAAkxwAANMQAACUHAAA1BAAAJUcAADVEAAAlhwAANYQAACXHAAA1xAAAJgcAADYEAAAmRwAANkQAACaHAAA2hAAAJscAADbEAAAnBwAANwQAACdHAAA3RAAAJ4cAADeEAAAnxwAAN8QAACgHAAA4BAAAKEcAADhEAAAohwAAOIQAACjHAAA4xAAAKQcAADkEAAApRwAAOUQAACmHAAA5hAAAKccAADnEAAAqBwAAOgQAACpHAAA6RAAAKocAADqEAAAqxwAAOsQAACsHAAA7BAAAK0cAADtEAAArhwAAO4QAACvHAAA7xAAALAcAADwEAAAsRwAAPEQAACyHAAA8hAAALMcAADzEAAAtBwAAPQQAAC1HAAA9RAAALYcAAD2EAAAtxwAAPcQAAC4HAAA+BAAALkcAAD5EAAAuhwAAPoQAAC9HAAA/RAAAL4cAAD+EAAAvxwAAP8QAAAAHgAAAR4AAAIeAAADHgAABB4AAAUeAAAGHgAABx4AAAgeAAAJHgAACh4AAAseAAAMHgAADR4AAA4eAAAPHgAAEB4AABEeAAASHgAAEx4AABQeAAAVHgAAFh4AABceAAAYHgAAGR4AABoeAAAbHgAAHB4AAB0eAAAeHgAAHx4AACAeAAAhHgAAIh4AACMeAAAkHgAAJR4AACYeAAAnHgAAKB4AACkeAAAqHgAAKx4AACweAAAtHgAALh4AAC8eAAAwHgAAMR4AADIeAAAzHgAANB4AADUeAAA2HgAANx4AADgeAAA5HgAAOh4AADseAAA8HgAAPR4AAD4eAAA/HgAAQB4AAEEeAABCHgAAQx4AAEQeAABFHgAARh4AAEceAABIHgAASR4AAEoeAABLHgAATB4AAE0eAABOHgAATx4AAFAeAABRHgAAUh4AAFMeAABUHgAAVR4AAFYeAABXHgAAWB4AAFkeAABaHgAAWx4AAFweAABdHgAAXh4AAF8eAABgHgAAYR4AAGIeAABjHgAAZB4AAGUeAABmHgAAZx4AAGgeAABpHgAAah4AAGseAABsHgAAbR4AAG4eAABvHgAAcB4AAHEeAAByHgAAcx4AAHQeAAB1HgAAdh4AAHceAAB4HgAAeR4AAHoeAAB7HgAAfB4AAH0eAAB+HgAAfx4AAIAeAACBHgAAgh4AAIMeAACEHgAAhR4AAIYeAACHHgAAiB4AAIkeAACKHgAAix4AAIweAACNHgAAjh4AAI8eAACQHgAAkR4AAJIeAACTHgAAlB4AAJUeAACeHgAA3wAAAKAeAAChHgAAoh4AAKMeAACkHgAApR4AAKYeAACnHgAAqB4AAKkeAACqHgAAqx4AAKweAACtHgAArh4AAK8eAACwHgAAsR4AALIeAACzHgAAtB4AALUeAAC2HgAAtx4AALgeAAC5HgAAuh4AALseAAC8HgAAvR4AAL4eAAC/HgAAwB4AAMEeAADCHgAAwx4AAMQeAADFHgAAxh4AAMceAADIHgAAyR4AAMoeAADLHgAAzB4AAM0eAADOHgAAzx4AANAeAADRHgAA0h4AANMeAADUHgAA1R4AANYeAADXHgAA2B4AANkeAADaHgAA2x4AANweAADdHgAA3h4AAN8eAADgHgAA4R4AAOIeAADjHgAA5B4AAOUeAADmHgAA5x4AAOgeAADpHgAA6h4AAOseAADsHgAA7R4AAO4eAADvHgAA8B4AAPEeAADyHgAA8x4AAPQeAAD1HgAA9h4AAPceAAD4HgAA+R4AAPoeAAD7HgAA/B4AAP0eAAD+HgAA/x4AAAgfAAAAHwAACR8AAAEfAAAKHwAAAh8AAAsfAAADHwAADB8AAAQfAAANHwAABR8AAA4fAAAGHwAADx8AAAcfAAAYHwAAEB8AABkfAAARHwAAGh8AABIfAAAbHwAAEx8AABwfAAAUHwAAHR8AABUfAAAoHwAAIB8AACkfAAAhHwAAKh8AACIfAAArHwAAIx8AACwfAAAkHwAALR8AACUfAAAuHwAAJh8AAC8fAAAnHwAAOB8AADAfAAA5HwAAMR8AADofAAAyHwAAOx8AADMfAAA8HwAANB8AAD0fAAA1HwAAPh8AADYfAAA/HwAANx8AAEgfAABAHwAASR8AAEEfAABKHwAAQh8AAEsfAABDHwAATB8AAEQfAABNHwAARR8AAFkfAABRHwAAWx8AAFMfAABdHwAAVR8AAF8fAABXHwAAaB8AAGAfAABpHwAAYR8AAGofAABiHwAAax8AAGMfAABsHwAAZB8AAG0fAABlHwAAbh8AAGYfAABvHwAAZx8AAIgfAACAHwAAiR8AAIEfAACKHwAAgh8AAIsfAACDHwAAjB8AAIQfAACNHwAAhR8AAI4fAACGHwAAjx8AAIcfAACYHwAAkB8AAJkfAACRHwAAmh8AAJIfAACbHwAAkx8AAJwfAACUHwAAnR8AAJUfAACeHwAAlh8AAJ8fAACXHwAAqB8AAKAfAACpHwAAoR8AAKofAACiHwAAqx8AAKMfAACsHwAApB8AAK0fAAClHwAArh8AAKYfAACvHwAApx8AALgfAACwHwAAuR8AALEfAAC6HwAAcB8AALsfAABxHwAAvB8AALMfAADIHwAAch8AAMkfAABzHwAAyh8AAHQfAADLHwAAdR8AAMwfAADDHwAA2B8AANAfAADZHwAA0R8AANofAAB2HwAA2x8AAHcfAADoHwAA4B8AAOkfAADhHwAA6h8AAHofAADrHwAAex8AAOwfAADlHwAA+B8AAHgfAAD5HwAAeR8AAPofAAB8HwAA+x8AAH0fAAD8HwAA8x8AACYhAADJAwAAKiEAAGsAAAArIQAA5QAAADIhAABOIQAAYCEAAHAhAABhIQAAcSEAAGIhAAByIQAAYyEAAHMhAABkIQAAdCEAAGUhAAB1IQAAZiEAAHYhAABnIQAAdyEAAGghAAB4IQAAaSEAAHkhAABqIQAAeiEAAGshAAB7IQAAbCEAAHwhAABtIQAAfSEAAG4hAAB+IQAAbyEAAH8hAACDIQAAhCEAALYkAADQJAAAtyQAANEkAAC4JAAA0iQAALkkAADTJAAAuiQAANQkAAC7JAAA1SQAALwkAADWJAAAvSQAANckAAC+JAAA2CQAAL8kAADZJAAAwCQAANokAADBJAAA2yQAAMIkAADcJAAAwyQAAN0kAADEJAAA3iQAAMUkAADfJAAAxiQAAOAkAADHJAAA4SQAAMgkAADiJAAAySQAAOMkAADKJAAA5CQAAMskAADlJAAAzCQAAOYkAADNJAAA5yQAAM4kAADoJAAAzyQAAOkkAAAALAAAMCwAAAEsAAAxLAAAAiwAADIsAAADLAAAMywAAAQsAAA0LAAABSwAADUsAAAGLAAANiwAAAcsAAA3LAAACCwAADgsAAAJLAAAOSwAAAosAAA6LAAACywAADssAAAMLAAAPCwAAA0sAAA9LAAADiwAAD4sAAAPLAAAPywAABAsAABALAAAESwAAEEsAAASLAAAQiwAABMsAABDLAAAFCwAAEQsAAAVLAAARSwAABYsAABGLAAAFywAAEcsAAAYLAAASCwAABksAABJLAAAGiwAAEosAAAbLAAASywAABwsAABMLAAAHSwAAE0sAAAeLAAATiwAAB8sAABPLAAAICwAAFAsAAAhLAAAUSwAACIsAABSLAAAIywAAFMsAAAkLAAAVCwAACUsAABVLAAAJiwAAFYsAAAnLAAAVywAACgsAABYLAAAKSwAAFksAAAqLAAAWiwAACssAABbLAAALCwAAFwsAAAtLAAAXSwAAC4sAABeLAAALywAAF8sAABgLAAAYSwAAGIsAABrAgAAYywAAH0dAABkLAAAfQIAAGcsAABoLAAAaSwAAGosAABrLAAAbCwAAG0sAABRAgAAbiwAAHECAABvLAAAUAIAAHAsAABSAgAAciwAAHMsAAB1LAAAdiwAAH4sAAA/AgAAfywAAEACAACALAAAgSwAAIIsAACDLAAAhCwAAIUsAACGLAAAhywAAIgsAACJLAAAiiwAAIssAACMLAAAjSwAAI4sAACPLAAAkCwAAJEsAACSLAAAkywAAJQsAACVLAAAliwAAJcsAACYLAAAmSwAAJosAACbLAAAnCwAAJ0sAACeLAAAnywAAKAsAAChLAAAoiwAAKMsAACkLAAApSwAAKYsAACnLAAAqCwAAKksAACqLAAAqywAAKwsAACtLAAAriwAAK8sAACwLAAAsSwAALIsAACzLAAAtCwAALUsAAC2LAAAtywAALgsAAC5LAAAuiwAALssAAC8LAAAvSwAAL4sAAC/LAAAwCwAAMEsAADCLAAAwywAAMQsAADFLAAAxiwAAMcsAADILAAAySwAAMosAADLLAAAzCwAAM0sAADOLAAAzywAANAsAADRLAAA0iwAANMsAADULAAA1SwAANYsAADXLAAA2CwAANksAADaLAAA2ywAANwsAADdLAAA3iwAAN8sAADgLAAA4SwAAOIsAADjLAAA6ywAAOwsAADtLAAA7iwAAPIsAADzLAAAQKYAAEGmAABCpgAAQ6YAAESmAABFpgAARqYAAEemAABIpgAASaYAAEqmAABLpgAATKYAAE2mAABOpgAAT6YAAFCmAABRpgAAUqYAAFOmAABUpgAAVaYAAFamAABXpgAAWKYAAFmmAABapgAAW6YAAFymAABdpgAAXqYAAF+mAABgpgAAYaYAAGKmAABjpgAAZKYAAGWmAABmpgAAZ6YAAGimAABppgAAaqYAAGumAABspgAAbaYAAICmAACBpgAAgqYAAIOmAACEpgAAhaYAAIamAACHpgAAiKYAAImmAACKpgAAi6YAAIymAACNpgAAjqYAAI+mAACQpgAAkaYAAJKmAACTpgAAlKYAAJWmAACWpgAAl6YAAJimAACZpgAAmqYAAJumAAAipwAAI6cAACSnAAAlpwAAJqcAACenAAAopwAAKacAACqnAAArpwAALKcAAC2nAAAupwAAL6cAADKnAAAzpwAANKcAADWnAAA2pwAAN6cAADinAAA5pwAAOqcAADunAAA8pwAAPacAAD6nAAA/pwAAQKcAAEGnAABCpwAAQ6cAAESnAABFpwAARqcAAEenAABIpwAASacAAEqnAABLpwAATKcAAE2nAABOpwAAT6cAAFCnAABRpwAAUqcAAFOnAABUpwAAVacAAFanAABXpwAAWKcAAFmnAABapwAAW6cAAFynAABdpwAAXqcAAF+nAABgpwAAYacAAGKnAABjpwAAZKcAAGWnAABmpwAAZ6cAAGinAABppwAAaqcAAGunAABspwAAbacAAG6nAABvpwAAeacAAHqnAAB7pwAAfKcAAH2nAAB5HQAAfqcAAH+nAACApwAAgacAAIKnAACDpwAAhKcAAIWnAACGpwAAh6cAAIunAACMpwAAjacAAGUCAACQpwAAkacAAJKnAACTpwAAlqcAAJenAACYpwAAmacAAJqnAACbpwAAnKcAAJ2nAACepwAAn6cAAKCnAAChpwAAoqcAAKOnAACkpwAApacAAKanAACnpwAAqKcAAKmnAACqpwAAZgIAAKunAABcAgAArKcAAGECAACtpwAAbAIAAK6nAABqAgAAsKcAAJ4CAACxpwAAhwIAALKnAACdAgAAs6cAAFOrAAC0pwAAtacAALanAAC3pwAAuKcAALmnAAC6pwAAu6cAALynAAC9pwAAvqcAAL+nAADApwAAwacAAMKnAADDpwAAxKcAAJSnAADFpwAAggIAAManAACOHQAAx6cAAMinAADJpwAAyqcAAMunAABkAgAAzKcAAM2nAADQpwAA0acAANanAADXpwAA2KcAANmnAADapwAA26cAANynAACbAQAA9acAAPanAAAh/wAAQf8AACL/AABC/wAAI/8AAEP/AAAk/wAARP8AACX/AABF/wAAJv8AAEb/AAAn/wAAR/8AACj/AABI/wAAKf8AAEn/AAAq/wAASv8AACv/AABL/wAALP8AAEz/AAAt/wAATf8AAC7/AABO/wAAL/8AAE//AAAw/wAAUP8AADH/AABR/wAAMv8AAFL/AAAz/wAAU/8AADT/AABU/wAANf8AAFX/AAA2/wAAVv8AADf/AABX/wAAOP8AAFj/AAA5/wAAWf8AADr/AABa/wAAAAQBACgEAQABBAEAKQQBAAIEAQAqBAEAAwQBACsEAQAEBAEALAQBAAUEAQAtBAEABgQBAC4EAQAHBAEALwQBAAgEAQAwBAEACQQBADEEAQAKBAEAMgQBAAsEAQAzBAEADAQBADQEAQANBAEANQQBAA4EAQA2BAEADwQBADcEAQAQBAEAOAQBABEEAQA5BAEAEgQBADoEAQATBAEAOwQBABQEAQA8BAEAFQQBAD0EAQAWBAEAPgQBABcEAQA/BAEAGAQBAEAEAQAZBAEAQQQBABoEAQBCBAEAGwQBAEMEAQAcBAEARAQBAB0EAQBFBAEAHgQBAEYEAQAfBAEARwQBACAEAQBIBAEAIQQBAEkEAQAiBAEASgQBACMEAQBLBAEAJAQBAEwEAQAlBAEATQQBACYEAQBOBAEAJwQBAE8EAQCwBAEA2AQBALEEAQDZBAEAsgQBANoEAQCzBAEA2wQBALQEAQDcBAEAtQQBAN0EAQC2BAEA3gQBALcEAQDfBAEAuAQBAOAEAQC5BAEA4QQBALoEAQDiBAEAuwQBAOMEAQC8BAEA5AQBAL0EAQDlBAEAvgQBAOYEAQC/BAEA5wQBAMAEAQDoBAEAwQQBAOkEAQDCBAEA6gQBAMMEAQDrBAEAxAQBAOwEAQDFBAEA7QQBAMYEAQDuBAEAxwQBAO8EAQDIBAEA8AQBAMkEAQDxBAEAygQBAPIEAQDLBAEA8wQBAMwEAQD0BAEAzQQBAPUEAQDOBAEA9gQBAM8EAQD3BAEA0AQBAPgEAQDRBAEA+QQBANIEAQD6BAEA0wQBAPsEAQBwBQEAlwUBAHEFAQCYBQEAcgUBAJkFAQBzBQEAmgUBAHQFAQCbBQEAdQUBAJwFAQB2BQEAnQUBAHcFAQCeBQEAeAUBAJ8FAQB5BQEAoAUBAHoFAQChBQEAfAUBAKMFAQB9BQEApAUBAH4FAQClBQEAfwUBAKYFAQCABQEApwUBAIEFAQCoBQEAggUBAKkFAQCDBQEAqgUBAIQFAQCrBQEAhQUBAKwFAQCGBQEArQUBAIcFAQCuBQEAiAUBAK8FAQCJBQEAsAUBAIoFAQCxBQEAjAUBALMFAQCNBQEAtAUBAI4FAQC1BQEAjwUBALYFAQCQBQEAtwUBAJEFAQC4BQEAkgUBALkFAQCUBQEAuwUBAJUFAQC8BQEAgAwBAMAMAQCBDAEAwQwBAIIMAQDCDAEAgwwBAMMMAQCEDAEAxAwBAIUMAQDFDAEAhgwBAMYMAQCHDAEAxwwBAIgMAQDIDAEAiQwBAMkMAQCKDAEAygwBAIsMAQDLDAEAjAwBAMwMAQCNDAEAzQwBAI4MAQDODAEAjwwBAM8MAQCQDAEA0AwBAJEMAQDRDAEAkgwBANIMAQCTDAEA0wwBAJQMAQDUDAEAlQwBANUMAQCWDAEA1gwBAJcMAQDXDAEAmAwBANgMAQCZDAEA2QwBAJoMAQDaDAEAmwwBANsMAQCcDAEA3AwBAJ0MAQDdDAEAngwBAN4MAQCfDAEA3wwBAKAMAQDgDAEAoQwBAOEMAQCiDAEA4gwBAKMMAQDjDAEApAwBAOQMAQClDAEA5QwBAKYMAQDmDAEApwwBAOcMAQCoDAEA6AwBAKkMAQDpDAEAqgwBAOoMAQCrDAEA6wwBAKwMAQDsDAEArQwBAO0MAQCuDAEA7gwBAK8MAQDvDAEAsAwBAPAMAQCxDAEA8QwBALIMAQDyDAEAUA0BAHANAQBRDQEAcQ0BAFINAQByDQEAUw0BAHMNAQBUDQEAdA0BAFUNAQB1DQEAVg0BAHYNAQBXDQEAdw0BAFgNAQB4DQEAWQ0BAHkNAQBaDQEAeg0BAFsNAQB7DQEAXA0BAHwNAQBdDQEAfQ0BAF4NAQB+DQEAXw0BAH8NAQBgDQEAgA0BAGENAQCBDQEAYg0BAIINAQBjDQEAgw0BAGQNAQCEDQEAZQ0BAIUNAQCgGAEAwBgBAKEYAQDBGAEAohgBAMIYAQCjGAEAwxgBAKQYAQDEGAEApRgBAMUYAQCmGAEAxhgBAKcYAQDHGAEAqBgBAMgYAQCpGAEAyRgBAKoYAQDKGAEAqxgBAMsYAQCsGAEAzBgBAK0YAQDNGAEArhgBAM4YAQCvGAEAzxgBALAYAQDQGAEAsRgBANEYAQCyGAEA0hgBALMYAQDTGAEAtBgBANQYAQC1GAEA1RgBALYYAQDWGAEAtxgBANcYAQC4GAEA2BgBALkYAQDZGAEAuhgBANoYAQC7GAEA2xgBALwYAQDcGAEAvRgBAN0YAQC+GAEA3hgBAL8YAQDfGAEAQG4BAGBuAQBBbgEAYW4BAEJuAQBibgEAQ24BAGNuAQBEbgEAZG4BAEVuAQBlbgEARm4B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";

// src/wasm/load.ts
function decode(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
initSync({ module: decode(wasmBase64) });

// src/wasm/renderer.ts
var global2 = globalThis;
var supportsAdoptingStyleSheets = global2.ShadowRoot && (global2.ShadyCSS === void 0 || global2.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var constructionToken = /* @__PURE__ */ Symbol();
var cssTagCache = /* @__PURE__ */ new WeakMap();
var CSSResult = class {
  cssText;
  _strings;
  _styleSheet;
  constructor(cssText2, strings, safeToken) {
    this["_$cssResult$"] = true;
    if (safeToken !== constructionToken) {
      throw new Error(
        "CSSResult is not constructable. Use `unsafeCSS` or `css` instead."
      );
    }
    this.cssText = cssText2;
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
var unsafeCSS = (value) => new CSSResult(
  typeof value === "string" ? value : String(value),
  void 0,
  constructionToken
);
var css = (strings, ...values) => new CSSResult(cssText(strings, values), strings, constructionToken);
var html2 = (strings, ...values) => html(strings, values);
var keyed2 = (key, result) => keyed(key, result);
var unsafeHTML2 = (value) => unsafeHTML(value);
var renderChildren2 = (children) => renderChildren(children);
function setSkipFocusRestore2(value) {
  setSkipFocusRestore(!!value);
}

// src/wasm/hooks.ts
function useState2(initialState) {
  const [value, host, name] = useState(initialState);
  const setState2 = (newState) => setState(host, name, newState);
  return [value, setState2];
}
function useEffect2(effect, dependencies) {
  useEffect(effect, dependencies);
}
function useMemo2(calculation, dependencies) {
  return useMemo(calculation, dependencies);
}
function useRef2(initialValue) {
  return useRef(initialValue);
}
function useStyle2(styles) {
  useStyle(typeof styles === "string" ? unsafeCSS(styles) : styles);
}
function useScope2(elements) {
  useScope(elements);
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
  const [randomId] = useState2(crypto.getRandomValues(new Uint8Array(8)));
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
        const [isLoading, setIsLoading] = useState2(true);
        const [isSaving, setIsSaving] = useState2(false);
        obj[key] = [value, setValue, isLoading, setIsLoading, isSaving];
        const fullKey = `${path}${key}`;
        stateManager.addLoadingSetter(fullKey, subscriberId, setIsLoading);
        stateManager.addSavingSetter(fullKey, subscriberId, setIsSaving);
      }
    });
  };
  enhanceStoreWithLoading(store);
  stateManager.createListeners(store, subscriberId);
  useEffect2(() => {
    stateManager.db.loadFromDatabase(store, subscriberId);
    return () => {
      stateManager.removeListeners(subscriberId);
    };
  }, []);
  return store;
};

// src/wasm/instance.ts
function getCurrentInstance() {
  return currentInstance();
}

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
  wrapRender(autoTransition, result, html3) {
    const transitionStyles = autoTransition.getTransitionStyles();
    const styleString = Object.entries(transitionStyles).map(([key, value]) => `${key}: ${value}`).join("; ");
    const styleText = `${viewTransitionStyles}
        .auto-transition-wrapper {
          position: relative;
          overflow: hidden;
          width: 100%;
          height: 100%;
        }`;
    const wrapperStyles = html3`
      <style>
        ${styleText}
      </style>
    `;
    const hasPrevious = this._previousRenderResult !== null && this._previousRenderResult !== void 0;
    if (autoTransition.isTransitioning && hasPrevious) {
      const incomingClass = autoTransition.getIncomingClass("vt-layer");
      const outgoingClass = autoTransition.getOutgoingClass("vt-layer");
      const previousResult = this._previousRenderResult;
      setSkipFocusRestore2(true);
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
      return html3`
        ${wrapperStyles}
        <div class="auto-transition-wrapper view-transition-container">
          <div class="${incomingClass} vt-incoming" style="${styleString}">
            ${keyed2(autoTransition.currentId, result)}
          </div>
          <div class="${outgoingClass}" style="${styleString}">
            ${keyed2(autoTransition.previousId, previousResult)}
          </div>
        </div>
      `;
    }
    setSkipFocusRestore2(false);
    this._isTransitioningNow = false;
    this.cleanupTransitionEffects();
    this._previousRenderResult = result;
    return html3`
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
  const { useState: useState3, useEffect: useEffect3, useStore: useStore2 } = hooks;
  const [cryptoManager, setCryptoManager] = useState3(null);
  useEffect3(() => {
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
  const [isInitialized, setIsInitialized] = useState3(false);
  const [fsMode, setFsMode] = useState3(null);
  const [directoryHandle, setDirectoryHandle] = useState3(null);
  const [error, setError] = useState3(null);
  const [pendingFolderReconnect, setPendingFolderReconnect] = useState3(null);
  const store = useStore2({
    selectedDirectoryName: useState3(""),
    hasPermission: useState3(false),
    preferredMode: useState3(opfs ? "opfs" : "fsa")
  });
  const [selectedDirectoryName, setSelectedDirectoryName] = store.selectedDirectoryName;
  const [hasPermission, setHasPermission] = store.hasPermission;
  const [preferredMode, setPreferredMode] = store.preferredMode;
  const isFileSystemAccessSupported = () => {
    return "showDirectoryPicker" in window;
  };
  useEffect3(() => {
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

// src/core/renderer/pure/policy.js
var ALLOWED_SCHEMES = /* @__PURE__ */ new Set(["http:", "https:", "mailto:", "tel:"]);
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
function escapeText(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
function setValidatorEngine(fn, name) {
  engine = fn;
  engineName = name;
}
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

// src/wasm/element.ts
var DimElement = class extends HTMLElement {
  constructor() {
    super();
    hostInit(this);
  }
  /** Reactive `.props` property. Assigning triggers update. */
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
    hostConnected(this);
  }
  disconnectedCallback() {
    hostDisconnected(this);
  }
  addController(controller) {
    addController(this, controller);
  }
  removeController(controller) {
    removeController(this, controller);
  }
  requestUpdate() {
    return requestUpdate(this);
  }
  get updateComplete() {
    return this.__updatePromise || Promise.resolve(true);
  }
  __flushStyles() {
    flushStyles(this);
  }
  /** Override in subclass / DimComponent */
  render() {
    return html2``;
  }
  /** Override — called after render commits */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updated(_changedProperties) {
  }
};
function createComponentProps(attributes, hostProps, children, childElements) {
  const rawProps = mergeProps(
    attributes,
    hostProps,
    children,
    childElements
  );
  return new Proxy(rawProps, {
    get(target, key) {
      if (typeof key === "string" && !(key in target)) {
        return readProp(target, key);
      }
      return target[key];
    }
  });
}
function define({
  tag,
  component: CustomFunctionalComponent,
  inputs = null
}) {
  class DimComponent extends DimElement {
    constructor() {
      super();
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
      beginRender(this);
      let result;
      let autoTransition = null;
      try {
        const attributes = parseAttributes(this);
        if (!this._props) this._props = {};
        const hostProps = this._props;
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
        const useFS2 = (options = {}) => useFS(options, { useState: useState2, useEffect: useEffect2, useStore });
        const sharedDependencies = {
          useState: useState2,
          useEffect: useEffect2,
          useMemo: useMemo2,
          useScope: useScope2,
          useStyle: useStyle2,
          useStore,
          useFS: useFS2,
          useViewTransition,
          html: html2,
          css,
          unsafeCSS,
          useRef: useRef2,
          querySelector,
          getRef,
          renderChildren: renderChildren2,
          keyed: keyed2
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
          if (checked.ok) {
            props = checked.value;
          } else {
            console.error(
              `[dim] <${tag}> props rejected at ${checked.path}: ${checked.reason}`
            );
            props = null;
          }
        }
        result = props ? CustomFunctionalComponent(props, sharedDependencies) : html2``;
      } finally {
        endRender();
      }
      if (autoTransition) {
        return this._transitionHost.wrapRender(autoTransition, result, html2);
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
initRuntime(define);

// src/wasm/index.ts
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

// src/wasm/contracts.ts
var schemaText = /* @__PURE__ */ new WeakMap();
function wasmValidate(schema, lowered) {
  let text = schemaText.get(schema);
  if (text === void 0) {
    text = JSON.stringify(schema);
    schemaText.set(schema, text);
  }
  return JSON.parse(validateJson(text, JSON.stringify(lowered)));
}
setValidatorEngine(wasmValidate, "wasm");

export { async_manager_default as AsyncronousStateManager, crypto_manager_default as CryptoManager, DimElement, storage_manager_default as StorageManager, contract, css, debouncedDispatcher, define, fold, getValidatorEngine, html2 as html, keyed2 as keyed, renderChildren2 as renderChildren, t, unsafeCSS, unsafeHTML2 as unsafeHTML, useEffect2 as useEffect, useFS, useLazyScope, useMemo2 as useMemo, useRef2 as useRef, useScope2 as useScope, useState2 as useState, useStore, useStyle2 as useStyle, useViewTransition, validateValue, viewTransitionStyles };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map
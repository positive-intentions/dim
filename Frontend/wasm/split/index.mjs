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
async function __wbg_load(module, imports) {
  if (typeof Response === "function" && module instanceof Response) {
    if (!module.ok) {
      throw new Error(`failed to fetch Wasm: ${module.status} ${module.statusText} fetching '${module.url}'`);
    }
    if (typeof WebAssembly.instantiateStreaming === "function") {
      try {
        return await WebAssembly.instantiateStreaming(module, imports);
      } catch (e) {
        const validResponse = expectedResponseType(module.type);
        if (validResponse && module.headers.get("Content-Type") !== "application/wasm") {
          console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);
        } else {
          throw e;
        }
      }
    }
    const bytes = await module.arrayBuffer();
    return await WebAssembly.instantiate(bytes, imports);
  } else {
    const instance = await WebAssembly.instantiate(module, imports);
    if (instance instanceof WebAssembly.Instance) {
      return { instance, module };
    } else {
      return instance;
    }
  }
  function expectedResponseType(type) {
    switch (type) {
      case "basic":
      case "cors":
      case "default":
        return true;
    }
    return false;
  }
}
var __wbg_init_promise;
async function __wbg_init(module_or_path) {
  if (wasm !== void 0) return wasm;
  if (__wbg_init_promise === void 0) {
    __wbg_init_promise = __wbg_init_once(module_or_path);
    __wbg_init_promise.catch(() => {
      __wbg_init_promise = void 0;
    });
  }
  return __wbg_init_promise;
}
async function __wbg_init_once(module_or_path) {
  if (module_or_path !== void 0) {
    if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
      ({ module_or_path } = module_or_path);
    } else {
      console.warn("using deprecated parameters for the initialization function; pass a single object instead");
    }
  }
  if (module_or_path === void 0) {
    module_or_path = (() => {
      throw new Error("dim-core: pass the wasm module or URL explicitly");
    })();
  }
  const imports = __wbg_get_imports();
  if (typeof module_or_path === "string" || typeof Request === "function" && module_or_path instanceof Request || typeof URL === "function" && module_or_path instanceof URL) {
    module_or_path = fetch(module_or_path);
  }
  const { instance, module } = await __wbg_load(await module_or_path, imports);
  return __wbg_finalize_init(instance);
}

// src/wasm/load-split.ts
await __wbg_init({
  module_or_path: new URL("./dim_core_bg.wasm", import.meta.url)
});

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
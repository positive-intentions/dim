var Dim = (function (exports) {
  'use strict';

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
    default: () => exports.CryptoManager
  });
  var DEFAULT_ITERATIONS, CryptoManager; exports.CryptoManager = void 0;
  var init_crypto_manager = __esm({
    "src/core/store/crypto-manager.js"() {
      DEFAULT_ITERATIONS = 1e6;
      CryptoManager = class {
        constructor(password, options = {}) {
          this.password = password;
          this.iterations = options.iterations || DEFAULT_ITERATIONS;
          this._keyCache = /* @__PURE__ */ new Map();
          this.key = null;
          this.keyPromise = this.generateKey(password).then((key) => {
            this.key = key;
            return key;
          });
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
        // Derive the deterministic fallback salt for a password (legacy behaviour).
        // Only used when no explicit salt is supplied. Real encryption always uses
        // a random per-record salt embedded in the payload.
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
         * @param {string} password
         * @param {Uint8Array|ArrayBuffer} [salt] - random salt; falls back to a
         *   deterministic salt derived from the password when omitted.
         * @returns {Promise<CryptoKey>}
         */
        async getKeyFromPassword(password, salt) {
          const encoder = new TextEncoder();
          let saltBytes;
          if (salt === void 0 || salt === null) {
            saltBytes = await this._fallbackSalt(password);
          } else {
            saltBytes = salt instanceof Uint8Array ? salt : new Uint8Array(salt);
          }
          const cacheKey = `${password}::${this.arrayBufferToString(saltBytes)}`;
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
                iterations: this.iterations,
                hash: "SHA-256"
              },
              passwordKey,
              {
                name: "AES-GCM",
                length: 256
              },
              true,
              ["encrypt", "decrypt"]
            );
          })();
          this._keyCache.set(cacheKey, keyPromise);
          return keyPromise;
        }
        // Legacy wrapper retained for backwards compatibility.
        async generateKey(password) {
          const key = await this.getKeyFromPassword(password);
          this.key = key;
          return key;
        }
        async encryptData(data) {
          const enc = new TextEncoder();
          const iv = crypto.getRandomValues(new Uint8Array(12));
          const salt = crypto.getRandomValues(new Uint8Array(16));
          const key = await this.getKeyFromPassword(this.password, salt);
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
            encryptedData: this.arrayBufferToString(encryptedData),
            iv: this.arrayBufferToString(iv),
            salt: this.arrayBufferToString(salt)
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
          const { encryptedData, iv, salt } = payload;
          if (!encryptedData || !iv) {
            throw new Error("Invalid encrypted payload: missing encryptedData or iv");
          }
          if (typeof encryptedData === "object" || typeof iv === "object") {
            throw new Error(
              "Invalid encrypted payload: encryptedData and iv must be strings"
            );
          }
          const saltBytes = salt ? new Uint8Array(this.stringToArrayBuffer(salt)) : void 0;
          const key = await this.getKeyFromPassword(this.password, saltBytes);
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
      exports.CryptoManager = CryptoManager;
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
    return ret;
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
  function __wbg_get_imports() {
    const import0 = {
      __proto__: null,
      __wbg_String_32109ad28e27e110: function(arg0) {
        const ret = String(arg0);
        return ret;
      },
      __wbg_String_ce53286f5497b165: function(arg0, arg1) {
        const ret = String(arg1);
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 1, len1, true);
        getDataViewMemory0().setInt32((arg0 >>> 0) + 4 * 0, ptr1, true);
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
      __wbg_addEventListener_ced711dcc0e537ab: function() {
        return handleError(function(arg0, arg1, arg2) {
          arg0.addEventListener(arg1, arg2);
        }, arguments);
      },
      __wbg_adopted_sheets_3ce53525d69a2b50: function(arg0) {
        const ret = arg0.__adoptedSheets;
        return ret;
      },
      __wbg_appendChild_dbf7ad2f48413560: function() {
        return handleError(function(arg0, arg1) {
          const ret = arg0.appendChild(arg1);
          return ret;
        }, arguments);
      },
      __wbg_array_state_742edc08d87fbeb4: function(arg0) {
        const ret = arg0.a;
        return ret;
      },
      __wbg_assign_6b6bb30388088072: function(arg0, arg1) {
        const ret = Object.assign(arg0, arg1);
        return ret;
      },
      __wbg_attr_group_d8b83729be24af73: function(arg0) {
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
      __wbg_child_state_c1243b376914c81a: function(arg0) {
        const ret = arg0.cs;
        return ret;
      },
      __wbg_cloneNode_70249c8beed88ee3: function() {
        return handleError(function(arg0, arg1) {
          const ret = arg0.cloneNode(arg1 !== 0);
          return ret;
        }, arguments);
      },
      __wbg_committed_3fd14631f9f6dd91: function(arg0) {
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
      __wbg_controllers_065a28da297deeaa: function(arg0) {
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
      __wbg_createRenderRoot_e22fd970edbac9f6: function() {
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
      __wbg_createTextNode_c3db62b4cfc381b2: function(arg0, arg1) {
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
      __wbg_dim_connected_0978f6a9ff389dcd: function(arg0) {
        const ret = arg0.__isConnected;
        return ret;
      },
      __wbg_dim_type_raw_be71b2d79eb9f027: function(arg0) {
        const ret = arg0._$dimType$;
        return ret;
      },
      __wbg_element_49fea8d16b46fee6: function(arg0) {
        const ret = arg0.el;
        return ret;
      },
      __wbg_end_f51a115337f975b9: function(arg0) {
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
      __wbg_has_requested_update_29ce0930ecd88148: function(arg0) {
        const ret = arg0.__hasRequestedUpdate;
        return ret;
      },
      __wbg_hook_index_727ed2cd45a5d2a0: function(arg0) {
        const ret = arg0.hookIndex;
        return ret;
      },
      __wbg_hooks_59df0a480d3ccd4c: function(arg0) {
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
      __wbg_key_4cc6da1b4491c4a9: function(arg0) {
        const ret = arg0.key;
        return ret;
      },
      __wbg_keys_105f5c0857898f84: function(arg0) {
        const ret = Object.keys(arg0);
        return ret;
      },
      __wbg_kind_b390ba6bb799d4c9: function(arg0) {
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
      __wbg_listener_5a2af9f74c3f2f07: function(arg0) {
        const ret = arg0.l;
        return ret;
      },
      __wbg_name_65119134dd7fa9c2: function(arg0) {
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
      __wbg_node_index_8ed016e078601bc3: function(arg0) {
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
      __wbg_parts_426c51ad661f761e: function(arg0) {
        const ret = arg0.parts;
        return ret;
      },
      __wbg_push_c9f4893fc209f768: function(arg0, arg1) {
        const ret = arg0.push(arg1);
        return ret;
      },
      __wbg_removeAttribute_735f25a801a701e1: function() {
        return handleError(function(arg0, arg1, arg2) {
          var v0 = getCachedStringFromWasm0(arg1, arg2);
          arg0.removeAttribute(v0);
        }, arguments);
      },
      __wbg_removeAttribute_e284ae9e2b3555aa: function() {
        return handleError(function(arg0, arg1) {
          arg0.removeAttribute(arg1);
        }, arguments);
      },
      __wbg_removeChild_d2dc6fc1d6db896b: function() {
        return handleError(function(arg0, arg1) {
          const ret = arg0.removeChild(arg1);
          return ret;
        }, arguments);
      },
      __wbg_removeEventListener_4a3125dde2f44169: function() {
        return handleError(function(arg0, arg1, arg2) {
          arg0.removeEventListener(arg1, arg2);
        }, arguments);
      },
      __wbg_render_9abda45c9a4f16c1: function() {
        return handleError(function(arg0) {
          const ret = arg0.render();
          return ret;
        }, arguments);
      },
      __wbg_render_root_0bc8b2100a541d45: function(arg0) {
        const ret = arg0.renderRoot;
        return ret;
      },
      __wbg_resolve_edf562099000d546: function(arg0) {
        const ret = Promise.resolve(arg0);
        return ret;
      },
      __wbg_setAttribute_4ef01517c640dc8d: function() {
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
      __wbg_set_adopted_sheets_ce6ab4028ac1a3c1: function(arg0, arg1) {
        arg0.__adoptedSheets = arg1;
      },
      __wbg_set_array_state_152d6b858962f2b2: function(arg0, arg1) {
        arg0.a = arg1;
      },
      __wbg_set_attr_group_eba0237fc954b1fe: function(arg0, arg1) {
        arg0.g = arg1;
      },
      __wbg_set_c54db956e8b63026: function(arg0, arg1, arg2) {
        const ret = arg0.set(arg1, arg2);
        return ret;
      },
      __wbg_set_child_state_546841817fe46b6f: function(arg0, arg1) {
        arg0.cs = arg1;
      },
      __wbg_set_committed_260de58433e0b326: function(arg0, arg1) {
        arg0.c = arg1;
      },
      __wbg_set_controllers_4995c71d39bc356e: function(arg0, arg1) {
        arg0.__controllers = arg1;
      },
      __wbg_set_dim_connected_e63adb881206ed6d: function(arg0, arg1) {
        arg0.__isConnected = arg1 !== 0;
      },
      __wbg_set_dim_type_raw_c2ad06b5707bed82: function(arg0, arg1) {
        arg0._$dimType$ = arg1 >>> 0;
      },
      __wbg_set_element_f71e9d70673d4d1e: function(arg0, arg1) {
        arg0.el = arg1;
      },
      __wbg_set_end_c506eb4fdfab0e86: function(arg0, arg1) {
        arg0.e = arg1;
      },
      __wbg_set_has_rendered_afacef198617df4e: function(arg0, arg1) {
        arg0.__hasRendered = arg1 !== 0;
      },
      __wbg_set_has_requested_update_7646535a87f51dfa: function(arg0, arg1) {
        arg0.__hasRequestedUpdate = arg1 !== 0;
      },
      __wbg_set_hook_index_d51fd8517cfe2e5f: function(arg0, arg1) {
        arg0.hookIndex = arg1;
      },
      __wbg_set_hooks_9933452bff0c2ea7: function(arg0, arg1) {
        arg0.hooks = arg1;
      },
      __wbg_set_innerHTML_a9d3a267967b5117: function(arg0, arg1, arg2) {
        var v0 = getCachedStringFromWasm0(arg1, arg2);
        arg0.innerHTML = v0;
      },
      __wbg_set_key_dc77409f358a577f: function(arg0, arg1) {
        arg0.key = arg1;
      },
      __wbg_set_kind_12d437e6ab29f93e: function(arg0, arg1) {
        arg0.k = arg1;
      },
      __wbg_set_length_19b5595bb62abfa3: function(arg0, arg1) {
        arg0.length = arg1 >>> 0;
      },
      __wbg_set_listener_9d37ef7dfe2e5ecc: function(arg0, arg1) {
        arg0.l = arg1;
      },
      __wbg_set_name_7ac537726a353296: function(arg0, arg1) {
        arg0.n = arg1;
      },
      __wbg_set_node_index_ef44cb5446ce82e2: function(arg0, arg1) {
        arg0.ni = arg1;
      },
      __wbg_set_parts_c06dd14c5a334571: function(arg0, arg1) {
        arg0.parts = arg1;
      },
      __wbg_set_props_raw_f720099d7711bfda: function(arg0, arg1) {
        arg0._props = arg1;
      },
      __wbg_set_raw_text_02949d9ce0dbd5ff: function(arg0, arg1) {
        arg0.r = arg1 !== 0;
      },
      __wbg_set_render_root_d135b0fbc99f9ac1: function(arg0, arg1) {
        arg0.renderRoot = arg1;
      },
      __wbg_set_start_4f2d9ccb75e53e65: function(arg0, arg1) {
        arg0.s = arg1;
      },
      __wbg_set_strings_350efe5f42585d30: function(arg0, arg1) {
        arg0.strings = arg1;
      },
      __wbg_set_style_queue_0db860f3a3c36aeb: function(arg0, arg1) {
        arg0.__styleQueue = arg1;
      },
      __wbg_set_t_key_2c10d3d1a37657f8: function(arg0, arg1) {
        arg0.key = arg1;
      },
      __wbg_set_t_result_99b51cba39133293: function(arg0, arg1) {
        arg0.result = arg1;
      },
      __wbg_set_t_strings_5ca6ebbab81042ba: function(arg0, arg1) {
        arg0.strings = arg1;
      },
      __wbg_set_t_value_92f6a3bf8d588f2e: function(arg0, arg1) {
        arg0.value = arg1;
      },
      __wbg_set_t_values_e8d90417d2640573: function(arg0, arg1) {
        arg0.values = arg1;
      },
      __wbg_set_textContent_0177b2a6d9293c2c: function(arg0, arg1, arg2) {
        var v0 = getCachedStringFromWasm0(arg1, arg2);
        arg0.textContent = v0;
      },
      __wbg_set_text_data_59255d76f096e646: function(arg0, arg1) {
        arg0.data = arg1;
      },
      __wbg_set_update_promise_6da0f67b12d9f644: function(arg0, arg1) {
        arg0.__updatePromise = arg1;
      },
      __wbg_set_value_prefix_8dd65adca136790d: function(arg0, arg1) {
        arg0.vp = arg1;
      },
      __wbg_set_value_suffix_121c535d9956d5cc: function(arg0, arg1) {
        arg0.vs = arg1;
      },
      __wbg_start_b229e5d6dbe91200: function(arg0) {
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
      __wbg_strings_f1ee720b6ca95df2: function(arg0) {
        const ret = arg0.strings;
        return ret;
      },
      __wbg_style_queue_e42414445b60a460: function(arg0) {
        const ret = arg0.__styleQueue;
        return ret;
      },
      __wbg_t_key_6177a0e9e0955f3d: function(arg0) {
        const ret = arg0.key;
        return ret;
      },
      __wbg_t_result_815ed9d48e47c2ff: function(arg0) {
        const ret = arg0.result;
        return ret;
      },
      __wbg_t_strings_3f7c7df47f3891e8: function(arg0) {
        const ret = arg0.strings;
        return ret;
      },
      __wbg_t_value_99b40bc70aaa891c: function(arg0) {
        const ret = arg0.value;
        return ret;
      },
      __wbg_t_values_1e1c59801dc5d7f2: function(arg0) {
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
      __wbg_text_data_e880bf7418122931: function(arg0) {
        const ret = arg0.data;
        return ret;
      },
      __wbg_update_promise_0e6c578593660136: function(arg0) {
        const ret = arg0.__updatePromise;
        return ret;
      },
      __wbg_updated_2db2b645dc1aa52b: function() {
        return handleError(function(arg0) {
          const ret = arg0.updated();
          return ret;
        }, arguments);
      },
      __wbg_value_prefix_a5d50b41b0fb7ed1: function(arg0) {
        const ret = arg0.vp;
        return ret;
      },
      __wbg_value_suffix_7983ed2cf3cdfc01: function(arg0) {
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
        const ret = makeMutClosure(arg0, arg1, wasm_bindgen__convert__closures_____invoke__h4b0b5ab8e62a9272);
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
  function wasm_bindgen__convert__closures_____invoke__h4b0b5ab8e62a9272(arg0, arg1, arg2) {
    const ret = wasm.wasm_bindgen__convert__closures_____invoke__h4b0b5ab8e62a9272(arg0, arg1, arg2);
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
  var wasmBase64 = "AGFzbQEAAAAB+gNKYAJ/fwBgAX8Bf2ACf38Bf2ADf39/AGADf39/AX9gAX8AYAFvAW9gBH9/f38AYAJvbwBgAW8Bf2AFf39/f38AYAACf39gAAF/YAJvbwFvYAR/f39/AX9gAW8AYAADf39/YAJvfwBgBX9/f39/AX9gAm9vAX9gBn9/f39/fwBgAn9vAGAAAGABbwJ/f2ADb29vAW9gA29/fwFvYAJ/fwFvYAABb2ACb38Bb2ADb29vAGADb39/AGAEb29vbwFvYAFvAXxgAm98AGADf39/AX5gBX9/fX9/AGAFf39+f38AYAV/f3x/fwBgAW8Df39/YAJvbwJ/f2AABH9/f39gA29vfwF/YAR/b39/AGAFb39/f38AYANvb38Bb2ADb29vAX9gAXwBb2AHf39/f39/fwBgCX9/f39/f35+fgBgAX8BfmACf34Bf2ACf38BfmADf35+AGAGf39/f39/AX9gBn9/f31/fwBgBn9/f35/fwBgBn9/f3x/fwBgBX9/fn9/AX9gBH9+f38Bf2AFf398f38Bf2AEf3x/fwF/YAV/f31/fwF/YAR/fX9/AX9gBH98f38AYAR/fX9/AGAEf35/fwBgAm9vBH9/f39gAX8BfGADf39vA39/f2ACb28Df39/YARvf39vAn9/YANvb38Cf39gAn98AGADf35/AAKgRaQBEC4vZGltX2NvcmVfYmcuanMhX193Ymdfc2V0X2xlbmd0aF8xOWI1NTk1YmI2MmFiZmEzABEQLi9kaW1fY29yZV9iZy5qcyRfX3diZ19nZXRfdW5jaGVja2VkX2U2MzI1YWQzNzRlZmY4NjEAHBAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX2dldF9kNzE3NmNmYjc2ZDcxMTE0ABwQLi9kaW1fY29yZV9iZy5qcxtfX3diZ19wdXNoX2M5ZjQ4OTNmYzIwOWY3NjgAExAuL2RpbV9jb3JlX2JnLmpzHV9fd2JnX2xlbmd0aF9iMDNhMGZhYmIxMDliMWU5AAkQLi9kaW1fY29yZV9iZy5qcx5fX3diZ19pbmRleE9mXzYwYzk1ZjZlOTEyNDg1N2QAKRAuL2RpbV9jb3JlX2JnLmpzHV9fd2JnX2Fzc2lnbl82YjZiYjMwMzg4MDg4MDcyAA0QLi9kaW1fY29yZV9iZy5qcxtfX3diZ19jYWxsX2E0MTBlYjRiNTllZDU5NjUAGBAuL2RpbV9jb3JlX2JnLmpzG19fd2JnX2NhbGxfZmM5MmZlZTYxMzdkNDUyZAAfEC4vZGltX2NvcmVfYmcuanMaX193YmdfZ2V0XzY5YTFhZTZjZmJmMjAyNTYADRAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX3NldF9jNTRkYjk1NmU4YjYzMDI2ABgQLi9kaW1fY29yZV9iZy5qcxtfX3diZ19rZXlzXzEwNWY1YzA4NTc4OThmODQABhAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX3NldF9zdHJpbmdzXzM1MGVmZTVmNDI1ODVkMzAACBAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX2tleV80Y2M2ZGExYjQ0OTFjNGE5AAYQLi9kaW1fY29yZV9iZy5qcxxfX3diZ19wYXJ0c180MjZjNTFhZDY2MWY3NjFlAAYQLi9kaW1fY29yZV9iZy5qcx5fX3diZ19zZXRfa2V5X2RjNzc0MDlmMzU4YTU3N2YACBAuL2RpbV9jb3JlX2JnLmpzHl9fd2JnX3N0cmluZ3NfZjFlZTcyMGI2Y2E5NWRmMgAGEC4vZGltX2NvcmVfYmcuanMgX193Ymdfc2V0X3BhcnRzX2MwNmRkMTRjNWEzMzQ1NzEACBAuL2RpbV9jb3JlX2JnLmpzHV9fd2JnX1N0cmluZ18zMjEwOWFkMjhlMjdlMTEwAAYQLi9kaW1fY29yZV9iZy5qcyRfX3diZ19zZXRfdGV4dF9kYXRhXzU5MjU1ZDc2ZjA5NmU2NDYACBAuL2RpbV9jb3JlX2JnLmpzJ19fd2JnX2FkZEV2ZW50TGlzdGVuZXJfY2VkNzExZGNjMGU1MzdhYgAdEC4vZGltX2NvcmVfYmcuanMjX193Ymdfc2V0QXR0cmlidXRlXzRlZjAxNTE3YzY0MGRjOGQAHRAuL2RpbV9jb3JlX2JnLmpzKl9fd2JnX3JlbW92ZUV2ZW50TGlzdGVuZXJfNGEzMTI1ZGRlMmY0NDE2OQAdEC4vZGltX2NvcmVfYmcuanMlX193YmdfY3JlYXRlVGV4dE5vZGVfYzNkYjYyYjRjZmMzODFiMgANEC4vZGltX2NvcmVfYmcuanMmX193YmdfcmVtb3ZlQXR0cmlidXRlX2UyODRhZTllMmIzNTU1YWEACBAuL2RpbV9jb3JlX2JnLmpzIF9fd2JnX3RleHRfZGF0YV9lODgwYmY3NDE4MTIyOTMxAAYQLi9kaW1fY29yZV9iZy5qcyFfX3diZ19ob29rX2luZGV4XzcyN2VkMmNkNDVhNWQyYTAAIBAuL2RpbV9jb3JlX2JnLmpzHV9fd2JnX3JlbmRlcl85YWJkYTQ1YzlhNGYxNmMxAAYQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19jb250cm9sbGVyc18wNjVhMjhkYTI5N2RlZWFhAAYQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19yZW5kZXJfcm9vdF8wYmM4YjIxMDBhNTQxZDQ1AAYQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19zdHlsZV9xdWV1ZV9lNDI0MTQ0NDViNjBhNDYwAAYQLi9kaW1fY29yZV9iZy5qcx5fX3diZ191cGRhdGVkXzJkYjJiNjQ1ZGMxYWE1MmIABhAuL2RpbV9jb3JlX2JnLmpzJF9fd2JnX2RpbV9jb25uZWN0ZWRfMDk3OGY2YTlmZjM4OWRjZAAJEC4vZGltX2NvcmVfYmcuanMkX193Ymdfc2V0X3Byb3BzX3Jhd19mNzIwMDk5ZDc3MTFiZmRhAAgQLi9kaW1fY29yZV9iZy5qcyVfX3diZ19hZG9wdGVkX3NoZWV0c18zY2U1MzUyNWQ2OWEyYjUwAAYQLi9kaW1fY29yZV9iZy5qcyVfX3diZ19zZXRfaG9va19pbmRleF9kNTFmZDg1MTdjZmUyZTVmACEQLi9kaW1fY29yZV9iZy5qcyVfX3diZ191cGRhdGVfcHJvbWlzZV8wZTZjNTc4NTkzNjYwMTM2AAYQLi9kaW1fY29yZV9iZy5qcyZfX3diZ19zZXRfY29udHJvbGxlcnNfNDk5NWM3MWQzOWJjMzU2ZQAIEC4vZGltX2NvcmVfYmcuanMmX193Ymdfc2V0X3JlbmRlcl9yb290X2QxMzViMGZiYzk5ZjlhYzEACBAuL2RpbV9jb3JlX2JnLmpzJl9fd2JnX3NldF9zdHlsZV9xdWV1ZV8wZGI4NjBmM2EzYzM2YWViAAgQLi9kaW1fY29yZV9iZy5qcydfX3diZ19zZXRfaGFzX3JlbmRlcmVkX2FmYWNlZjE5ODYxN2RmNGUAERAuL2RpbV9jb3JlX2JnLmpzKF9fd2JnX3NldF9kaW1fY29ubmVjdGVkX2U2M2FkYjg4MTIwNmVkNmQAERAuL2RpbV9jb3JlX2JnLmpzKV9fd2JnX3NldF9hZG9wdGVkX3NoZWV0c19jZTZhYjQwMjhhYzFhM2MxAAgQLi9kaW1fY29yZV9iZy5qcylfX3diZ19zZXRfdXBkYXRlX3Byb21pc2VfNmRhMGY2N2IxMmQ5ZjY0NAAIEC4vZGltX2NvcmVfYmcuanMrX193YmdfaGFzX3JlcXVlc3RlZF91cGRhdGVfMjljZTA5MzBlY2Q4ODE0OAAJEC4vZGltX2NvcmVfYmcuanMnX193YmdfY3JlYXRlUmVuZGVyUm9vdF9lMjJmZDk3MGVkYmFjOWY2AAYQLi9kaW1fY29yZV9iZy5qcy9fX3diZ19zZXRfaGFzX3JlcXVlc3RlZF91cGRhdGVfNzY0NjUzNWE4N2Y1MWRmYQAREC4vZGltX2NvcmVfYmcuanMcX193YmdfaG9va3NfNTlkZjBhNDgwZDNjY2Q0YwAGEC4vZGltX2NvcmVfYmcuanMgX193Ymdfc2V0X2hvb2tzXzk5MzM0NTJiZmYwYzJlYTcACBAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX3NldF90X3ZhbHVlXzkyZjZhM2JmOGQ1ODhmMmUACBAuL2RpbV9jb3JlX2JnLmpzI19fd2JnX2RpbV90eXBlX3Jhd19iZTcxYjJkNzllYjlmMDI3AAYQLi9kaW1fY29yZV9iZy5qcyNfX3diZ19zZXRfdF9yZXN1bHRfOTliNTFjYmEzOTEzMzI5MwAIEC4vZGltX2NvcmVfYmcuanMjX193Ymdfc2V0X3RfdmFsdWVzX2U4ZDkwNDE3ZDI2NDA1NzMACBAuL2RpbV9jb3JlX2JnLmpzJF9fd2JnX3NldF90X3N0cmluZ3NfNWNhNmViYmFiODEwNDJiYQAIEC4vZGltX2NvcmVfYmcuanMnX193Ymdfc2V0X2RpbV90eXBlX3Jhd19jMmFkMDZiNTcwN2JlZDgyABEQLi9kaW1fY29yZV9iZy5qcxxfX3diZ190X2tleV82MTc3YTBlOWUwOTU1ZjNkAAYQLi9kaW1fY29yZV9iZy5qcx5fX3diZ190X3ZhbHVlXzk5YjQwYmM3MGFhYTg5MWMABhAuL2RpbV9jb3JlX2JnLmpzH19fd2JnX3RfcmVzdWx0XzgxNWVkOWQ0OGU0N2MyZmYABhAuL2RpbV9jb3JlX2JnLmpzH19fd2JnX3RfdmFsdWVzXzFlMWM1OTgwMWRjNWQ3ZjIABhAuL2RpbV9jb3JlX2JnLmpzIF9fd2JnX3NldF90X2tleV8yYzEwZDNkMWEzNzY1N2Y4AAgQLi9kaW1fY29yZV9iZy5qcyBfX3diZ190X3N0cmluZ3NfM2Y3YzdkZjQ3ZjM4OTFlOAAGEC4vZGltX2NvcmVfYmcuanMhX193YmdfYXR0cl9ncm91cF9kOGI4MzcyOWJlMjRhZjczAAYQLi9kaW1fY29yZV9iZy5qcyFfX3diZ19ub2RlX2luZGV4XzhlZDAxNmUwNzg2MDFiYzMAIBAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX2FycmF5X3N0YXRlXzc0MmVkYzA4ZDg3ZmJlYjQABhAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX2NoaWxkX3N0YXRlX2MxMjQzYjM3NjkxNGM4MWEABhAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX3NldF9lbGVtZW50X2Y3MWU5ZDcwNjczZDRkMWUACBAuL2RpbV9jb3JlX2JnLmpzI19fd2JnX3NldF9saXN0ZW5lcl85ZDM3ZWY3ZGZlMmU1ZWNjAAgQLi9kaW1fY29yZV9iZy5qcyNfX3diZ19zZXRfcmF3X3RleHRfMDI5NDlkOWNlMGRiZDVmZgAREC4vZGltX2NvcmVfYmcuanMjX193YmdfdmFsdWVfcHJlZml4X2E1ZDUwYjQxYjBmYjdlZDEABhAuL2RpbV9jb3JlX2JnLmpzI19fd2JnX3ZhbHVlX3N1ZmZpeF83OTgzZWQyY2YzY2RmYzAxAAYQLi9kaW1fY29yZV9iZy5qcyRfX3diZ19zZXRfY29tbWl0dGVkXzI2MGRlNTg0MzNlMGIzMjYACBAuL2RpbV9jb3JlX2JnLmpzJV9fd2JnX3NldF9hdHRyX2dyb3VwX2ViYTAyMzdmYzk1NGIxZmUACBAuL2RpbV9jb3JlX2JnLmpzJV9fd2JnX3NldF9ub2RlX2luZGV4X2VmNDRjYjU0NDZjZTgyZTIAIRAuL2RpbV9jb3JlX2JnLmpzJl9fd2JnX3NldF9hcnJheV9zdGF0ZV8xNTJkNmI4NTg5NjJmMmIyAAgQLi9kaW1fY29yZV9iZy5qcyZfX3diZ19zZXRfY2hpbGRfc3RhdGVfNTQ2ODQxODE3ZmU0NmI2ZgAIEC4vZGltX2NvcmVfYmcuanMnX193Ymdfc2V0X3ZhbHVlX3ByZWZpeF84ZGQ2NWFkY2ExMzY3OTBkAAgQLi9kaW1fY29yZV9iZy5qcydfX3diZ19zZXRfdmFsdWVfc3VmZml4XzEyMWM1MzVkOTk1NmQ1Y2MACBAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX2VuZF9mNTFhMTE1MzM3Zjk3NWI5AAYQLi9kaW1fY29yZV9iZy5qcxtfX3diZ19raW5kX2IzOTBiYTZiYjc5OWQ0YzkACRAuL2RpbV9jb3JlX2JnLmpzG19fd2JnX25hbWVfNjUxMTkxMzRkZDdmYTljMgAGEC4vZGltX2NvcmVfYmcuanMcX193Ymdfc3RhcnRfYjIyOWU1ZDZkYmU5MTIwMAAGEC4vZGltX2NvcmVfYmcuanMeX193YmdfZWxlbWVudF80OWZlYThkMTZiNDZmZWU2AAYQLi9kaW1fY29yZV9iZy5qcx5fX3diZ19zZXRfZW5kX2M1MDZlYjRmZGZhYjBlODYACBAuL2RpbV9jb3JlX2JnLmpzH19fd2JnX2xpc3RlbmVyXzVhMmFmOWY3NGMzZjJmMDcABhAuL2RpbV9jb3JlX2JnLmpzH19fd2JnX3NldF9raW5kXzEyZDQzN2U2YWIyOWY5M2UAERAuL2RpbV9jb3JlX2JnLmpzH19fd2JnX3NldF9uYW1lXzdhYzUzNzcyNmEzNTMyOTYACBAuL2RpbV9jb3JlX2JnLmpzIF9fd2JnX2NvbW1pdHRlZF8zZmQxNDYzMWY5ZjZkZDkxAAYQLi9kaW1fY29yZV9iZy5qcyBfX3diZ19zZXRfc3RhcnRfNGYyZDljY2I3NWU1M2U2NQAIEC4vZGltX2NvcmVfYmcuanMdX193YmdfU3RyaW5nX2NlNTMyODZmNTQ5N2IxNjUAFRAuL2RpbV9jb3JlX2JnLmpzHl9fd2JnX3Jlc29sdmVfZWRmNTYyMDk5MDAwZDU0NgAGEC4vZGltX2NvcmVfYmcuanMpX193YmdfaW5zdGFuY2VvZl9FbGVtZW50XzA1ZGJiMjJkZWQ1OTQzNDMACRAuL2RpbV9jb3JlX2JnLmpzI19fd2JnX2dldEF0dHJpYnV0ZV9jN2I4MGQ0MDEwMjg0NTYxACoQLi9kaW1fY29yZV9iZy5qcyNfX3diZ19zZXRBdHRyaWJ1dGVfZjc1MzE3YjJiNWNhYmZiNAArEC4vZGltX2NvcmVfYmcuanMkX193Ymdfc2V0X2lubmVySFRNTF9hOWQzYTI2Nzk2N2I1MTE3AB4QLi9kaW1fY29yZV9iZy5qcyZfX3diZ19yZW1vdmVBdHRyaWJ1dGVfNzM1ZjI1YTgwMWE3MDFlMQAeEC4vZGltX2NvcmVfYmcuanMoX193YmdfZ2V0QXR0cmlidXRlTmFtZXNfZWMyNDRjMWY1MDQ0ZGNkNwAGEC4vZGltX2NvcmVfYmcuanMeX193YmdfdGFnTmFtZV83NzViYjA1NjE5YTVjNTJmABUQLi9kaW1fY29yZV9iZy5qcxtfX3diZ193YXJuXzIyOGZmMjI1NzM4NGQyOTUADxAuL2RpbV9jb3JlX2JnLmpzG19fd2JnX3dhcm5fNDI3MDI3NDRiMjI4NGI2ZgAIEC4vZGltX2NvcmVfYmcuanMcX193YmdfZXJyb3JfZDFmYzAxOTM2MTBlMGUzOQAPEC4vZGltX2NvcmVfYmcuanMiX193YmdfY3JlYXRlUmFuZ2VfZDk0YWI5NWYyOWEzYzQzNwAGEC4vZGltX2NvcmVfYmcuanMkX193YmdfYWN0aXZlRWxlbWVudF82YzMwZmU3ZmRhMzNlZjUxAAkQLi9kaW1fY29yZV9iZy5qcyRfX3diZ19jcmVhdGVFbGVtZW50X2RlNGEzMWVkMmZiMjUyYmUAGRAuL2RpbV9jb3JlX2JnLmpzJV9fd2JnX2NyZWF0ZVRleHROb2RlXzJiNDhjM2ZjNzVkZmNjNjcAGRAuL2RpbV9jb3JlX2JnLmpzJ19fd2JnX2NyZWF0ZVRyZWVXYWxrZXJfZDhiNGNlMjgyNGZjOGQxMwAsEC4vZGltX2NvcmVfYmcuanMsX193YmdfaW5zdGFuY2VvZl9TaGFkb3dSb290X2NkNzgxNTllMDNmZWQ4ODQACRAuL2RpbV9jb3JlX2JnLmpzH19fd2JnX25leHROb2RlX2U3OTJlMDY5ZTg4ODA4NjUACRAuL2RpbV9jb3JlX2JnLmpzHl9fd2JnX2NvbnRlbnRfNmZlZDkzY2ExZmQyOWYwNgAGEC4vZGltX2NvcmVfYmcuanMaX193YmdfZ2V0XzQ3ZDRhOWFlNTk1NWM3NzEAGRAuL2RpbV9jb3JlX2JnLmpzJl9fd2JnX2luc3RhbmNlb2ZfTm9kZV8wMWJiZjUxNzk4NTFiNDZiAAkQLi9kaW1fY29yZV9iZy5qcyBfX3diZ19ub2RlVmFsdWVfMzFkZDljMDY3MDE1ODhjYgAVEC4vZGltX2NvcmVfYmcuanMhX193YmdfcGFyZW50Tm9kZV9mZTE1YmNjMjZkZjQyODU2AAkQLi9kaW1fY29yZV9iZy5qcyJfX3diZ19hcHBlbmRDaGlsZF9kYmY3YWQyZjQ4NDEzNTYwAA0QLi9kaW1fY29yZV9iZy5qcyJfX3diZ19pc0Nvbm5lY3RlZF9jNTI5NjU1YjAyZDAwOWU3AAkQLi9kaW1fY29yZV9iZy5qcyFfX3diZ19pc1NhbWVOb2RlXzFlZGE5NmI4NDgyMTU5NmUAExAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX25leHRTaWJsaW5nXzkxMTM2ZGM3YThlYzliMDkACRAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX3JlbW92ZUNoaWxkX2QyZGM2ZmMxZDZkYjg5NmIADRAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX2dldFJvb3ROb2RlXzZkZTA5NzE4OTU1OTk4MWQABhAuL2RpbV9jb3JlX2JnLmpzI19fd2JnX2luc2VydEJlZm9yZV8xMGFiMGMxOWI0NjNjMTJiABgQLi9kaW1fY29yZV9iZy5qcyZfX3diZ19zZXRfdGV4dENvbnRlbnRfMDE3N2IyYTZkOTI5M2MyYwAeEC4vZGltX2NvcmVfYmcuanMgX193YmdfY2xvbmVOb2RlXzcwMjQ5YzhiZWVkODhlZTMAHBAuL2RpbV9jb3JlX2JnLmpzH19fd2JnX2NvbnRhaW5zXzc0M2FhN2M5NDQ5OWMyNjkAExAuL2RpbV9jb3JlX2JnLmpzH19fd2JnX25vZGVUeXBlXzVjNTA1MGM2NTcxYzM0NjMACRAuL2RpbV9jb3JlX2JnLmpzIl9fd2JnX3NldEVuZEFmdGVyX2RlYWM3MzY5NmNiNTRjZWIACBAuL2RpbV9jb3JlX2JnLmpzI19fd2JnX3NldEVuZEJlZm9yZV85ZWJiNTk1NGUwOTgwYjBkAAgQLi9kaW1fY29yZV9iZy5qcyVfX3diZ19kZWxldGVDb250ZW50c19hODAxYjcxZDU5MmRkNjg0AA8QLi9kaW1fY29yZV9iZy5qcyRfX3diZ19zZXRTdGFydEFmdGVyX2M2NTJmZmQ2ODM1N2NmMDQACBAuL2RpbV9jb3JlX2JnLmpzJV9fd2JnX3NldFN0YXJ0QmVmb3JlXzk0NjFlZTQ1ZGZkMDIxYzIACBAuL2RpbV9jb3JlX2JnLmpzG19fd2JnX2NhbGxfNDBiMDA4YmEzMmY3Mzk5MQANEC4vZGltX2NvcmVfYmcuanMcX193YmdfcGFyc2VfYzNmNzJiNWEyNGY4M2MwMQAaEC4vZGltX2NvcmVfYmcuanMgX193Ymdfc3RyaW5naWZ5XzBhMGZiZjJlZjcyMjM4MGEABhAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX25ld18zN2ViNDVhYWY1ZWViODIwABsQLi9kaW1fY29yZV9iZy5qcxlfX3diZ19vZl8wMjdlYjE1MzcxYWFjOTMyAAYQLi9kaW1fY29yZV9iZy5qcxlfX3diZ19vZl80Y2MzNzNiZWYxZjcxNWE0ABgQLi9kaW1fY29yZV9iZy5qcx5fX3diZ19pc0FycmF5X2JjZjEzNzZkMGQ3MzJkMDgACRAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX25ld183ODdiOWZiMzMwZDU1ZDc4ABoQLi9kaW1fY29yZV9iZy5qcxlfX3diZ19pc18yMjQ4ZmYyYjU3NWQ2MGM3ABMQLi9kaW1fY29yZV9iZy5qcxpfX3diZ19uZXdfY2Q0MzQ4MjkwYWZhZTU4NgAbEC4vZGltX2NvcmVfYmcuanMyX193Ymdfc3RhdGljX2FjY2Vzc29yX0dMT0JBTF9USElTXzAwM2VlODMzYWY5Njk5ZmMADBAuL2RpbV9jb3JlX2JnLmpzK19fd2JnX3N0YXRpY19hY2Nlc3Nvcl9TRUxGXzUzYmIyMDQ1NzQwMTQ1M2QADBAuL2RpbV9jb3JlX2JnLmpzLV9fd2JnX3N0YXRpY19hY2Nlc3Nvcl9HTE9CQUxfZTQyOTNmYjIyY2JlNzdkYQAMEC4vZGltX2NvcmVfYmcuanMtX193Ymdfc3RhdGljX2FjY2Vzc29yX1dJTkRPV19iNWUwODEwYmZlY2I3ZmViAAwQLi9kaW1fY29yZV9iZy5qcxpfX3diZ19nZXRfMjA4MGM0OTAxNWUzNTI1NAANEC4vZGltX2NvcmVfYmcuanMaX193YmdfaGFzXzJjNGQ1Y2YyNWVjOGMxY2YAExAuL2RpbV9jb3JlX2JnLmpzGl9fd2JnX3NldF8yNzkzNDc5ODg4MzI5Y2I2AC0QLi9kaW1fY29yZV9iZy5qcxpfX3diZ19uZXdfMDJhMTJjYmUzZGI3OTVhZgAbEC4vZGltX2NvcmVfYmcuanMdX193YmdfY29uY2F0XzNkMDBjNmM3MDIxMmQ1YzQADRAuL2RpbV9jb3JlX2JnLmpzHV9fd2JnX2xlbmd0aF9lODNlODE5ZjQ4Yzc3NGU0AAkQLi9kaW1fY29yZV9iZy5qcydfX3diZ19fX3diaW5kZ2VuX3Rocm93XzRjODhkOGJmMjY0ZmQ5ODQAABAuL2RpbV9jb3JlX2JnLmpzKl9fd2JnX19fd2JpbmRnZW5faXNfZmFsc3lfZDg2NGI2MjM1MDBhZTY1ZAAJEC4vZGltX2NvcmVfYmcuanMqX193YmdfX193YmluZGdlbl9qc3ZhbF9lcV8zOGQ3YmZiZTRjYzg0MDM5ABMQLi9kaW1fY29yZV9iZy5qcytfX3diZ19fX3diaW5kZ2VuX2lzX29iamVjdF84Yjk2OGMzYWI4ZTk2NTk1AAkQLi9kaW1fY29yZV9iZy5qcytfX3diZ19fX3diaW5kZ2VuX2lzX3N0cmluZ19mYzQ1NmZlZTVkMzMxN2RlAAkQLi9kaW1fY29yZV9iZy5qcyxfX3diZ19fX3diaW5kZ2VuX251bWJlcl9nZXRfOTM0YjY0MGQwODg5YWY3OAAVEC4vZGltX2NvcmVfYmcuanMsX193YmdfX193YmluZGdlbl9zdHJpbmdfZ2V0XzdjZThlZWU3ZmQzMjc1NDUAFRAuL2RpbV9jb3JlX2JnLmpzLV9fd2JnX19fd2JpbmRnZW5fYm9vbGVhbl9nZXRfNGYxYmFmOWEwMGJlM2M3NAAJEC4vZGltX2NvcmVfYmcuanMtX193YmdfX193YmluZGdlbl9pc19mdW5jdGlvbl83NDFmZjJiYjYxMjgzNmY1AAkQLi9kaW1fY29yZV9iZy5qcy5fX3diZ19fX3diaW5kZ2VuX2lzX3VuZGVmaW5lZF9iZTViMzQyNDlmZjFmYzE1AAkQLi9kaW1fY29yZV9iZy5qczZfX3diZ19fX3diaW5kZ2VuX2lzX251bGxfb3JfdW5kZWZpbmVkX2ZiOTZhZjkzYzc1NDYwYWUACRAuL2RpbV9jb3JlX2JnLmpzJF9fd2JnX193YmdfY2JfdW5yZWZfMDk3MzY4NzlhM2Y2NzU1OQAPEC4vZGltX2NvcmVfYmcuanMfX193YmluZGdlbl9pbml0X2V4dGVybnJlZl90YWJsZQAWEC4vZGltX2NvcmVfYmcuanMjX193YmluZGdlbl9nZW5lcmljXzAwMDAwMDAwMDAwMDAwMDEAGhAuL2RpbV9jb3JlX2JnLmpzI19fd2JpbmRnZW5fZ2VuZXJpY18wMDAwMDAwMDAwMDAwMDAyAC4QLi9kaW1fY29yZV9iZy5qcyNfX3diaW5kZ2VuX2dlbmVyaWNfMDAwMDAwMDAwMDAwMDAwMwAaA7sDuQMDAAEDAAMKAAAHAgMDEgUEAwQCBAICBy8AAzACAAAUAQcxAAEDAgMCAgwDDAAUAwIHAgMAAAMKAAAACgMBAwAyFAoHAgoHFAcHCjMiBzQABxQKNQcCCgACBAEDAAc2FDc4BQoABwMKBQADAgMDBwcKBQcFEhIDAw4DAwAKAAAAAQAHBQICAAcDAQUKAgoBAAcFEjk7PQIKBw4FBAQECiUjJAQDAwcWBAEDBQ4AAAAEBwMAAAcKAwADAgMHBwAABwMKBwAAAAQEAAEAAwMDAgMEEh8AAwIDAwUDAAIBAgMAAwUWAQQFAgQHAgMAAkICQwACRAMDAABFRgEEAgIFBQMARyYmBQEFJycAFxcXFxcEDQ0CDgUFDgMMAQMAAAAiGQEBAQEBAQEDAQEFAwgFBQUFBQAABgYGBgUFAgIEBQUFAwUDBAMCCgIMDAICAAICAA4BAwIAAgICDw8PDwICAAAAAAABAwEBAQEBAQUAAAAAAAAAAAAAAAAAGwEFBQUFBQUFAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQECAQEBAQAAAgAEAgJIAAAADAwABQUWDAEBARYDBwQSAEkECQJwAWpqbwCECAUDAQARBhkDfwFBgIDAAAt/AEG4xsEAC38AQejHwQALB4oGKwZtZW1vcnkCAA1hZGRDb250cm9sbGVyAKoDC2JlZ2luUmVuZGVyAPsDB2Nzc1RleHQAkAMPY3VycmVudEluc3RhbmNlAJwECWVuZFJlbmRlcgDRBAtmbHVzaFN0eWxlcwCwAxNnZXRTa2lwRm9jdXNSZXN0b3JlANIEDWhvc3RDb25uZWN0ZWQArwMQaG9zdERpc2Nvbm5lY3RlZACtAwhob3N0SW5pdAD8AwRodG1sALMDC2luaXRSdW50aW1lAP0DBWtleWVkALQDCm1lcmdlUHJvcHMA9QIPcGFyc2VBdHRyaWJ1dGVzANcDCHJlYWRQcm9wAMIDEHJlbW92ZUNvbnRyb2xsZXIAzwMGcmVuZGVyAKQDDnJlbmRlckNoaWxkcmVuANgDDXJlcXVlc3RVcGRhdGUA2QMSc2V0Q3VycmVudEluc3RhbmNlAP4DE3NldFNraXBGb2N1c1Jlc3RvcmUAtAIIc2V0U3RhdGUAmwMKdW5zYWZlSFRNTADaAwl1c2VFZmZlY3QAqwMHdXNlTWVtbwCaAwZ1c2VSZWYApgMIdXNlU2NvcGUArgMIdXNlU3RhdGUApQMIdXNlU3R5bGUAsQMPX19hYm9ydF9oYW5kbGVyAwEVX19pbnN0YW5jZV90ZXJtaW5hdGVkAwI9d2FzbV9iaW5kZ2VuX19jb252ZXJ0X19jbG9zdXJlc19fX19faW52b2tlX19oNGIwYjVhYjhlNjJhOTI3MgCVAxFfX3diaW5kZ2VuX21hbGxvYwC5AhJfX3diaW5kZ2VuX3JlYWxsb2MAzgIPX193YmluZGdlbl9mcmVlAOUDFV9fd2JpbmRnZW5fZXh0ZXJucmVmcwEBF19fZXh0ZXJucmVmX3RhYmxlX2FsbG9jAM8BFF9fd2JpbmRnZW5fZXhuX3N0b3JlAOQDGl9fd2JpbmRnZW5fZGVzdHJveV9jbG9zdXJlAIIDGV9fZXh0ZXJucmVmX3RhYmxlX2RlYWxsb2MAiwIQX193YmluZGdlbl9zdGFydACgAQnYAQEAQQELaZUC7gOhAckB3AL4A/ICtAHIA8QDxwPGA8MD1ATJA9ME1QTFA4gCogGPAsAC6wHAAsgCvALtAYYCpQLeAZsCvALoAZMC5QH1AbUCwQLCAoEC+QGXArUCggK1AsMCggK2AoIC9AGDAoQCtwKXAsEC5AGYAsECuALEAp8C9gHRA9ID0wPUA80BkwOI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IANB0ABqIBRB2I/AAEEIEIACQQEhBiADKAJUIQcCQCADKAJQQQFxBEAgFBDbAwwBCyADIAc2AnggA0HYAWoQ2wMgA0H4AGogAygCZCADKAJoEPkCIAMoAnRBKGwhBiADKAJwIQcDQCAGIggEQCAGQShrIQYgBy0AJCAHQShqIQdBAUcNAQsLIANBADYChAEgA0KAgICAwAA3AnwgA0EANgKQASADQoCAgIDAADcCiAECQAJAAkACQAJAIAgNACADIANB+ABqEL4ENgKUASADQQA2AqABIANCgICAgMAANwKYASADQcgAaiADQZQBahDgAiADKAJMIQcgAygCSEEBcQ0DIAMgBzYCpAEDQCADQdgBaiIEIANBpAFqEJ4CIAMoAtwBIQcgAygC2AEiCUECRg0DIAlBAXEEQCADIAc2AswBAkAgA0HMAWoiBRC/BEH//wNxQQhHDQAgBCAFEOsCIAMgAygC4AE2ArwBIAMgAygC3AFBACADKALYAUGAgICAeEcbNgK4ASADQbgBakHoj8AAEI8DIAQQ4QNFDQAgA0GYAWogB0Hwj8AAEPcCDAILIANBzAFqENsDDAELCyADKAKgASEEIAMoApwBIQcgAyADKAKYATYC4AEgAyAHNgLcASADIAc2AtgBIAMgByAEQQJ0aiIENgLkAQNAAkAgBCAHRwRAIAMgB0EEajYC3AEgAyAHKAIANgKsASADQUBrIANBrAFqEL8DIAMoAkBBAXENAUGskMAAQQ8QiQMhBwwECyADQdgBahCmAiADQSBqIANBlAFqEOACIAMoAiQhByADKAIgQQFxDQQgAyAHNgKoAUEAIQVBACEGA0AgA0HYAWogA0GoAWoQngIgAygC3AEhBwJAAkAgAygC2AEiBEECRg0AAkACQCAEQQFxBEAgAyAHNgKsASADQawBahC/BEH//wNxQQFrDgMCBAEECyADQagBahDbAyADQaQBahDbAyADQZQBahDbAwwHCyADQbgBaiADQawBahDrAgJAIAMoArgBQYCAgIB4Rg0AIANB4AFqIANBwAFqKAIAIgQ2AgAgAyADKQK4ATcD2AEgA0HYAWoQogQgBEUNAEEAIQYMAwsgBkEBcUUEQCADKAKEASIEIAMoAnxGBEAgA0H8AGpBgJDAABDQAgsgAygCgAEgBEECdGogBTYCACADIARBAWo2AoQBCyAGQQFzIQYMAgsgAyADQawBahC9BDYCsAEgAyADQbABaiIEEKUENgLUASADQQA2AtABIAMgBDYCzAEDQCADQRhqIANBzAFqEKkCAkACQCADKAIYQQFxBEAgAyADKAIcNgK0ASADQdgBaiADQbQBahCgAiADQRBqAn8gAygC2AFBgICAgHhHBEAgA0HAAWogA0HgAWooAgAiBzYCACADIAMpAtgBNwO4ASADKAK8AQwBC0EAIQcgA0EANgLAASADQoCAgIAQNwO4AUEBCyAHEJcDIANB2AFqIAMoAhAgAygCFBDIASADLQDYASIEQQJGDQIgBEEBcUUNAQwCCyADQbABahDbAwwECyADKALcASEHIAMoApABIgQgAygCiAFGBEAgA0GIAWpBnJDAABDPAgsgAygCjAEgBEEDdGoiCiAFNgIEIAogBzYCACADIARBAWo2ApABIANBCGogA0GsAWoiBCADKAK8ASADKALAARCzAiADKAIIQQFxRQ0AIAMoAgwhByADQbgBahCiBCADQbQBahDbAyADQbABahDbAyAEENsDDAILIANBuAFqEKIEIANBtAFqENsDDAALAAsgA0GoAWoQ2wMMBgsgBUEBaiEFIANBrAFqENsDDAALAAsgAyADKAJENgKwASADEMwENgK0ASADIANBtAFqQQFBABDqAjYCuAEgA0E4aiADQbABaiADQbgBaiIEIANBrAFqEPMBIAMoAjwhBwJAIAMoAjhBAXEEQCAEENsDDAELIAMgBzYCzAEgA0HMAWoQ2wMgA0G4AWoiBBDbAyADIANBtAFqQQFBABDqAjYCuAEgA0EwaiADQbABaiAEIANBrAFqEPMBIAMoAjQhByADKAIwQQFxBEAgBBDbAwwBCyADIAc2AswBIANBzAFqENsDIANBuAFqIgQQ2wMgA0EoaiADQbABaiIFIANBrAFqIgYQmgIgAygCLCEHIAMoAihBAXENACADIAc2ArgBIAQQ2wMgA0G0AWoQ2wMgBRDbAyAGENsDIAMoAtwBIQcgAygC5AEhBAwBCwsgA0G0AWoQ2wMgA0GwAWoQ2wMMAQsgCEEARyELIAMQ6wM2ApgBIAMgAygCfDYCwAEgAyADKAKAASIENgK4ASADIAQ2ArwBIAMgBCADKAKEAUECdGoiCTYCxAEgAygCcCIKIAMoAnRBKGxqIQwDQCAK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cQ0CIAYgCFgNBiAHIAYgCH0iBn0gBlYNBiACIANPDQFBACADIAJBgM7AABDiAgALIABBADYCAA8LIAEgA2ohCwJAAkACQANAIAMgCWpFDQEgCUEBayIJIAtqIgotAABBOUYNAAsgCiAKLQAAQQFqOgAAIAMgCWpBAWoiBSADTQ0BIAUgAyADQcDDwAAQ4gIACwJAIANFBEBBMSEJDAELIAFBMToAAEEwIQkgA0EBayIKRSAKRXINACABQQFqQTAgCvwLAAsgBEEBasEiBCAFwUwgAiADTXINASALIAk6AAAgA0EBaiEDDAELIAlBf0YNACAJQX9zIgVFDQAgCkEBakEwIAX8CwALIAIgA0kNAgwDCyACIANPDQJBACADIAJBkM7AABDiAgALIABBADYCAA8LQQAgAyACQfDNwAAQ4gIACyAAIAQ7AQggACADNgIEIAAgATYCAA8LIABBADYCAAvqAgEFfwJAIAFBzf97QRAgACAAQRBNGyIAa08NACAAQRAgAUELakF4cSABQQtJGyIEakEMahCmASICRQ0AIAJBCGshAQJAIABBAWsiAyACcUUEQCABIQAMAQsgAkEEayIFKAIAIgZBeHEgAiADakEAIABrcUEIayICIABBACACIAFrQRBNG2oiACABayICayEDIAZBA3EEQCAAIAMgACgCBEEBcXJBAnI2AgQgACADaiIDIAMoAgRBAXI2AgQgBSACIAUoAgBBAXFyQQJyNgIAIAEgAmoiAyADKAIEQQFyNgIEIAEgAhC8AQwBCyABKAIAIQEgACADNgIEIAAgASACajYCAAsCQCAAKAIEIgFBA3FFDQAgAUF4cSICIARBEGpNDQAgACAEIAFBAXFyQQJyNgIEIAAgBGoiASACIARrIgRBA3I2AgQgACACaiICIAIoAgRBAXI2AgQgASAEELwBCyAAQQhqIQMLIAMLkgMBCH8jAEEgayICJAACQAJAAkACQAJAIAEoAgBBAUYEQCABQQhqIQMgASgCPCEEIAEoAjghBSABKAI0IQYgASgCMCEHIAEoAiRBf0YNASAAIAMgByAGIAUgBEEAELsBDAULIAEtAA4NAyABKAI0IQUgASgCMCEJIAEoAgQhAyABLQAMIQQCQANAIAJBEGogAyAJIAUQqgIgAigCECIGRQ0DIAIoAhQhCCACIAY2AhggAiAGIAhq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AgQgAkEQaiQAC0ABA39BBCEFAkAgA0UNACABKAIAIgZFDQAgACACNgIEIAAgASgCBDYCACADIAZsIQRBCCEFCyAAIAVqIAQ2AgALRwEBfyMAQRBrIgUkACAFQQhqIAAgASACIAMgBBDRASAFKAIIIgBBgYCAgHhHBEAgACAFKAIMQdSmwAAQzgMACyAFQRBqJAALRwEBfyMAQRBrIgMkACABKAIAJQEgAigCACUBEBggA0EIahCpAyADKAIMIQEgACADKAIIQQFxNgIAIAAgATYCBCADQRBqJAALPAEBfyMAQRBrIgIkACACIAEoAgAlARCZASAAIAIoAgAEfiAAIAIrAwg5AwhCAQVCAAs3AwAgAkEQaiQAC0UBAX8jAEEgayIDJAAgAyACNgIcIAMgATYCGCADIAI2AhQgA0EIaiADQRRqQcilwAAQiQIgACADKQMINwMAIANBIGokAAurcQMmfxR+AXwgASgCCCIMQYCAgAFxIQIgACsDACE8AkACQCAMQYCAgIABcUUEQCABIAJBAEchDyMAQYABayIIJAAgPL0hMQJ/QQMgPJlEAAAAAAAA8H9hDQAaQQIgMUKAgICAgICA+P8AgyIpQoCAgICAgID4/wBRDQAaIDFC/////////weDIitCgICAgICAgAiEIDFCAYZC/v///////w+DIDFCNIinQf8PcSIGGyIoQgGDISogKVAEQEEEICtQDQEaIAZBswhrIQZCASEpICpQDAELQoCAgICAgIAgIChCAYYgKEKAgICAgICACFEiABshKEICQgEgABshKUHLd0HMdyAAGyAGaiEGICpQCyEAIAggBjsBeCAIICk3A3AgCEIBNwNoIAggKDcDYCAIIAA6AHoCfwJAAkACQAJAIABB/wFxIgFBAU0EQCAIQSBqIQogCEEPaiEEIwBB4ABrIgEkAAJAAkACfwJAAkACQAJAAkACQAJAIAhB4ABqIgApAwAiKFBFBEAgACkDCCIpUA0BIAApAxAiKlANAiAqIChCf4VWDQMgKCApVA0EICggKnwiKkKAgICAgICAgCBaDQUgASAALwEYIgA7ATggASAoICl9Iis3AzAgASArICp5IimGIi0gKYgiLDcDQCArICxSDQkgASAAOwE4IAEgKDcDMCABICggKUI/gyIrhiIsICuIIis3A0AgKCArUg0JQaB/IAAg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xAQACyABIAI2AgQgASADNgIAIABBhKnAADYCBCAAIAE2AgALzwIAAkAgACACTQRAIAAgAU0gASACS3INASMAQTBrIgIkACACIAE2AgQgAiAANgIAIAJBAjYCDCACQcjawAA2AgggAkICNwIUIAIgAkEEaq1CgICAgMAAhDcDKCACIAKtQoCAgIDAAIQ3AyAgAiACQSBqNgIQIAJBCGogAxCZAwALIwBBMGsiASQAIAEgAjYCBCABIAA2AgAgAUECNgIMIAFB9NnAADYCCCABQgI3AhQgASABQQRqrUKAgICAwACENwMoIAEgAa1CgICAgMAAhDcDICABIAFBIGo2AhAgAUEIaiADEJkDAAsjAEEwayIAJAAgACACNgIEIAAgATYCACAAQQI2AgwgAEGU2sAANgIIIABCAjcCFCAAIABBBGqtQoCAgIDAAIQ3AyggACAArUKAgICAwACENwMgIAAgAEEgajYCECAAQQhqIAMQmQMAC0IBAX8jAEEgayIDJAAgA0EANgIQIANBATYCBCADQgQ3AgggAyABNgIcIAMgADYCGCADIANBGGo2AgAgAyACEJkDAAs8AQJ/IwBB0ABrIgUkACAFQRBqIgYgASACIAMgBBCqASAFQQRqIAYQwAEgACAFKQIENwMAIAVB0ABqJAALPgEBfyAAKAIIIgQgACgCAEYEQCAAIAMQzwILIAAoAgQgBEEDdGoiAyACNgIEIAMgATYCACAAIARBAWo2AggLQAEBfyMAQRBrIgIkACABKAIAJQEQfSACQQhqEKkDIAIoAgwhASAAIAIoAghBAXE2AgAgACABNgIEIAJBEGokAAs/AQJ/QQQhAgNAIAIEQCAAKAAAIQMgACABKAAANgAAIAEgAzYAACABQQRqIQEgAEEEaiEAIAJBAWshAgwBCwsLQAEBfyMAQRBrIgIkACACQQhqIAEoAgAlARBYIAIgAigCCCACKAIMEPUDIAAgAigCACACKAIEEI0DIAJBEGokAAs4AQF/IwBBEGsiAyQAIANBADYCDCADIAIgA0EMahDMAiAAIAEgAygCACADKAIEELkDIANBEGokAAtCAgF/AW8jAEEQayIDJAAgACgCACADQQhqIAEgAhDHAiUBIAMoAgggAygCDBBnIQQQzwEiACAEJgEgA0EQaiQAIAALQAEBfyMAQRBrIgIkACACQQhq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NgIAIAUgATYCBCAAQRBqJAAlASADKAIIIAMoAgwQdyADQRBqJAALNQEBfyMAQRBrIgEkACABIAAoAgAiACgCADYCDCABIAAoAgg2AgggAUEIahCeBCABQRBqJAALDQAgACABIAJBBBDYBAs0AQF/QQEhAgJAIAEoAgBBAUcEQEEAIQIMAQsgAUEEahCcAyEBCyAAIAE2AgQgACACNgIACyoBAn8DQCADIgJBCEcEQCACQQRqIQMgACACaigCACABRw0BCwsgAkEIRwtLAQF/AkAgABCNBEUEQEECIAAoAgAlARCbASIBQQBHIAFB////B0YbQf8BcUECRg0BCxDNBA8LIAAQigRFBEAgABCpBA8LIAAQnAMLPAIBfwFvIwBBEGsiAiQAIAJBCGogACABEMcCIAIoAgggAigCDBCHASEDEM8BIgAgAyYBIAJBEGokACAACw0AIAAgASACQQgQ2AQLMwEBfwJAIABFDQAgASgCACICBEAgACACEQUACyABKAIEIgJFDQAgACABKAIIIAIQ4wMLCx4AIAIEQCACIAEQvAQhAQsgACACNgIEIAAgATYCAAs3AQF/IwBBIGsiASQAIAFBADYCGCABQQE2AgwgAUHQw8EANgIIIAFCBDcCECABQQhqIAAQmQMACw8AQbDZwABBqNnAABDbBAs0AQJ/IwBBEGsiASQAIAEgADYCDEEDEIYEIgIlASAAJQEQMSABQQxqENsDIAFBEGokACACCyoBAX8jAEEQayIDJAAgA0EIaiACIAAgARDsASADKAIIIANBEGokAEEBRgstAQF/IwBBEGsiASQAIAEgAEEIazYCDCABQQxqIgAQlAIgABC3AyABQRBqJAALPAIBfwFvIwBBEGsiAiQAIAJBCGogACABEMcCIAIoAgggAigCDBCjASEDEM8BIgAgAyYBIAJBEGokACAAC+IDAgV/A34gACgCDEUEQEEADwsCfyMAQUBqIgMkACADQThqQgA3AwAgA0IANwMwIAMgAEEQaiIEKQMIIgg3AyggAyAEKQMAIgk3AyAgAyAIQvPK0cunjNmy9ACFNwMYIAMgCELt3pHzlszct+QAhTcDECADIAlC4eSV89bs2bzsAIU3AwggAyAJQvXKzYPXrNu38wCFNwMAIAMgAhCjAyADIAEgAhDSASADEMUBIQggA0FAayQAQQAhBCMAQRBrIgMkACADIAI2AgQgAyABNgIAIAhCGYhC/wCDQoGChIiQoMCAAX4hCiADIAA2AgwgACgCBCICIAincSEBIAMgAzYCCCAAKAIAIQADQCAAIAFqKQAAIgkgCoUiCEJ/hSAIQoGChIiQoMCAAX2DQoCBgoSIkKDAgH+DIQgCQAJAA0AgCFAiB0UEQCADQQhqIgQoAgAiBSgCACAFKAIEIAQoAgQoAgAgCHqnQQN2IAFqIAJxIgRBBHRrQRBrIgUoAgQgBSgCCBC2Aw0CIAhCAX0gCIMhCAwBCwsgCSAJQgGGg0KAgYKEiJCgwIB/g1ANAQsgA0EQaiQAQQAgACAEQQR0ayAHGwwCCyABIAZBCGoiBmogAnEhAQwACwALIgBBEGtBACAAGws3AQF+IAAgAikDAEKAgYKEiJCgwIB/gyIEQgBSNgIAIAAgASgCBCADKAIAIAR6p0EDdmpxNgIEC7MBAQJ/IwBBEGsiACQAIAEoAgBB+KjAAEELIAEoAgQoAgwRBAAhAyAAQQhqIgJBADoABSACIAM6AAQgAiABNgIAIAIiAS0ABCECIAEtAAUEQCABAn9BASACQQFxDQAaIAEoAgAiAS0ACkGAAXFFBEAgASgCAEGEwMAAQQIgASgCBCgCDBEEAAwBCyABKAIAQYPAwABBASABKAIEKAIMEQQACyICOgAECyACQQFxIABBEGokAAtBAQF/IwBBEGsiAyQAIANBCGogASACENsCIAMoAgghASAAIAMoAgwiAjYCCCAAIAE2AgQgACACNgIAIANBEGokAAswAQF/AkAgASgCACICBEAgASgCBCEBDAELIAFBBGoQ2wMLIAAgATYCBCAAIAI2AgALKgEDfyAAKAIAIgIgASgCACIDckUhBCACRSADRXIEfyAEBSAAIAEQ3QMLC/cJAQp/IwBBEGsiCCQAEM8BIgIgACYBEM8BIgYgASYBIwBB4ABrIgMkACADIAY2AiAgAyACNgIcIAMgA0HfAGoiAjYCTCADIAI2AkggAyACNgJEIAMgA0EgajYCQCADIAI2AjwgAyACNgI4IAMgAjYCNCADIANBHGo2AjAgA0EkaiEGIANBMGoiAigCACgCACEEIAIoAhAoAgAhBSMAQZABayICJAAgAiAFNgIMIAIgBDYCCCACIAJBCGpBABCABDYCHCACQeAAaiACQRxqEKACAkAgAigCYEGAgICAeEcEQCACQRhqIAJB6ABqKAIANgIAIAIgAikCYDcDEAwBCyACQQA2AhggAkKAgICAEDcDEAsgAkEcahDbAwJAIAJBCGoQpQRBAUYEQCAGIAIpAxA3AgAgBkEIaiACQRhqKAIANgIADAELIAJBDGoiBBClBCEFIAJBADYCKCACIAU2AiQgAkEANgIgIAIgBDYCHAJAA0ACQCACQSxqIAJBHGoQogICQAJAIAIoAixBAUYEQCACKAIwIQogAiACKAI0NgI4IAJBOGoiBRCJBEUNASACIAVB0I3AAEEMENICNgKAASACQYIINgJgIAJBgAFqIgQgAkHgAGoiBxDoAyAHENsDIAQQ2wNFDQEgAiAFQYCPwABBBxDSAjYCgAEgByAEEKACIAJBACACKAJoIAIoAmAiB0GAgICAeEYiBRs2AlAgAkEBIAIoAmQgBRs2AkwgAkEAIAcgBRsiBTYCSCAEENsDDAILIAYgAikDEDcCACAGQQhqIAJBGGooAgA2AgAMBQsgAkHgAGoiBSACQThqIgcQ2gIgAikDYFAEQCACQYABaiIEIAcQ6AIgAkECNgJ8IAJBAjYCZCACQfCOwAA2AmAgAkIBNwJsIAIgBDYCeCACIAJB+ABqNgJoIAJB1ABqIgcgBRDiASAEEKIEIAIoAlggAigCXBCAAyEEIAcQogQMBAsgAkHIAGogAkE4ahDoAiACKAJIIgVBgICAgHhGDQELIAIgAigCUCIENgJEIAIgAigCTCIHNgJAIAIgBTYCPCACQRBqIgUgByAEEOcDIAJBPGoQogQgAiACQQhqIApBAWoQgAQ2AlQgAkHgAGogAkHUAGoQoAIgBQJ/IAIoAmBBgICAgHhHBEAgAkGIAWogAkHoAGooAgAiBDYCACACIAIpAmA3A4ABIAIoAoQBDAELQQAhBCACQQA2AogBIAJCgICAgBA3A4ABQQELIAQQ5wMgAkGAAWoQogQgAkHUAGoQ2wMgAkE4ahDbAwwBCwsgAigCTCEECyAGQYCAgIB4NgIAIAYgBDYCBCACQThqENsDIAJBEGoQogQLIAJBDGoQ2wMgAkEIahDbAyACQZABaiQAIAgCfyADKAIkIgJBgICAgHhGBEBBACECIAMoAighBkEBDAELIANBEGogAygCKCIGIAMoAiwiBBDuAgJ/IAMoAhBBAXEEQCADKAIUIQkgAyAENgJYIAMgBjYCVCADIAI2AlAgA0HQAGoQogRBAAwBCyADIAQ2AjggAyAGNgI0IAMgAjYCMCADQQhqIANBMGpBmIvAABCJAiADKAIMIQkgAygCCAshAkEAIQZBAAs2AgwgCCAGNgIIIAggCTYCBCAIIAI2AgAgA0HgAGokACAIKAIAIAgoAgQgCCgCCCAIKAIMIAhBEGokAAtxAQV/IwBBEGsiAiQAIAIQ6wMiBDYCDCACQQxqIQUjAEEQayIDJAADQCAAIAFHBEAgAyAAKAIAIABBBGooAgAQiQM2AgwgBSADQQxqIgYQ7wMgAEEIaiEAIAYQ2wMMAQsLIANBEGokACACQRBqJAAgBAssAgF/AXwjAEEQayIBJAAgASAAKAIAJQEQPjkDCCABQQhqKwMAIAFBEGokAAswAQF/IAFBCGsiAiACKAIAQQFqIgI2AgAgAkUEQAALIAAgATYCBCAAQeSkwAA2AgALLgAgACgCACIAIAFqLAAAQQBOBH8gACkDAEKAgYKEiJCgwIB/g3qnQQN2BSABCws3AQF/IwBBEGsiAyQAIAMgABDPASIAIAImASABIAAQlQIgAygCACADKAIEIAMoAgggA0EQaiQACygAIAEoAgAEQCACEM8EAAsgAUF/NgIAIAAgATYCBCAAIAFBBGo2AgALLQEBfyABIAJBkJDAAEEJELkDIQMgACACQQlrNgIEIAAgAUEJakEAIAMbNgIACywBAX8gACgCCCECIABBARCsAyABIAAoAgQgACgCCGoQ3QEgACACQQFqNgIIC/wBAgJ/AX4jAEEQayICJAAgAkEBOwEMIAIgATYCCCACIAA2AgQjAEEQayIBJAAgAkEEaiIAKQIAIQQgASAANgIMIAEgBDcCBCMAQRBrIgAkACABQQRqIgEoAgAiAigCDCEDAkACQAJAAkAgAigCBA4CAAECCyADDQFBASECQQAhAwwCCyADDQAgAigCACICKAIEIQMgAigCACECDAELIABBgICAgHg2AgAgACABNgIMIABBzKjAACABKAIEIAEoAggiAC0ACCAALQAJENoBAAsgACADNgIEIAAgAjYCACAAQbCowAAgASgCBCABKAIIIgAtAAggAC0ACRDaAQALiQUBCH8jAEEQayIGJAAQzwEiAiAAJgEQzwEiBCABJgEjAEFAaiIDJAAgAyAENgIYIAMgAjYCFCADIANBP2oiAjYCOCADIAI2AjQgAyACNgIwIAMgA0EYajYCLCADIAI2AiggAyACNgIkIAMgAjYCICADIANBFGo2AhwjAEEQayIHJAAgB0EIaiEJIANBHGoiAigCACgCACEEIAIoAhAoAgAhBSMAQUBqIgIkACACIAU2AhggAiAENgIUIAJBCGoQrQJBASEIIAIoAgwhBCACKAIIQQFxRQRAIAIgBDYCHCACQSBqIAJBHGoiBEH8ksAAQQUQ8AEgAiAEEKwENgIsIAIgAkEsaiACKAIkIAIoAigQ0gI2AjAgAiACQTBqIgQQiQQEfyAEQYGTwABBDBDSAgVBgAgLNgI0AkAgAkE0aiACQRhqENUBRQRAQQAhCCACQTBqQaiPwABBBRDSAiEEDAELIAJBgAg2AjwgAiACQRRqIAJBPGoiBRCcAiACKAIEIQQgAigCAEEBcUUEQCACIAQ2AjggBRDbAyACEOwDNgI8IAVBqI/AAEEFIAJBOGoQuwIgBUGBk8AAQQwgAkEYahC7AiACQSxqIAIoAiQgAigCKCAFELsCIAUQ2wNBACEIDAELIAJBPGoQ2wMLIAJBNGoQ2wMgAkEwahDbAyACQSxqENsDIAJBIGoQogQgAkEcahDbAwsgAkEYahDbAyACQRRqENsDIAkgBDYCBCAJIAg2AgAgAkFAayQAIAcoAgwhAiADQQhqIgQgBygCCDYCACAEIAI2AgQgB0EQaiQAIAYgAygCCCADKAIMEKIDIANBQGskACAGKAIAIAYoAgQgBigCCCAGQRBqJAAL2gYBCn8jAEEQayIJJAAQzwEiBCAAJgEQzwEiBiADJgEjAEHgAGsiBSQAIAUgATYCICAFIAQ2AhwgBSACNgIkIAUgBjYCKCAFIAVB3wBqIgE2AlggBSABNgJUIAUgATYCUCAFIAVBKGo2AkwgBSABNgJIIAUgATYCRCAFIAVBJGo2AkAgBSAFQSBqNgI8IAUgATYCOCAFIAE2AjQgBSABNgIwIAUgBUEcajYCLCMAQdAAayIGJAAgBkEANgIkIAYgBUEsaiIBKAIAKAIAIgI2AiggBkEsaiIEIAEoAhAoAgAgASgCFCgCABCNAyAGQQA2AjggBiABKAIgKAIAIgE2AjwgBigCLEGAgICAeEYEQCAGQRBqIAZBOGoQjgMgBigCECEFIAYoAhQhByAGQQhqIAQQ9gIgBigCCCECIAYoAgwhBCAGIAZBJGoQjgMgBigCACIBIAIgARsiAiAFIAIbIgVBASAFGyAGKAIEIAQgARsgByACG0EAIAUbEMEEAAsgBkHIAGogBkE0aigCADYCACAGIAYpAiw3A0AgBkEYaiEMIwBBIGsiBCQAIAQgATYCDCAEIAI2AgggBCAEQQhqEKwENgIQIAQgBEEQaiAGQUBrIgcoAgQgBygCCBDSAjYCFAJAAkACQAJAAkACQAJAIARBDGoQiAQiCgRAIARBgAg2AhwgBCAKIARBHGoiCyAEQRRqEJICQQEhCCAEKAIEIQEgBCgCAEEBcUUNASALENsDDAMLIAQgATYCGAwBCyAEIAE2AhggBEEcahDbAwsgBEEUaiILKAIAJQEgBEEYaiIIKAIAJQEQiAFFBEAgBEEQaiINIAcoAgQgBygCCCAIELsCIAQgAhDgATYCHCAEQRxqENsDIAgQ2wMgCxDbAyANENsDIAoNAgwECyAEQRhqENsDQQAhCAsgBEEUahDbAyAEQRBqENsDIApFDQEgBEEMahDbAwwBCyAEQQxqENsDDAELIAcQogQgBEEIahDbAwwBCyAHEKIEQQAhCAsgDCABNgIEIAwgCDYCACAEQSBqJAAgBUEQaiAGKQMYNwMAIAZB0ABqJAAgBUEIaiAFKAIQIAUoAhQQygMgCSAFKQMINwIAIAVB4ABqJAAgCSgCACAJKAIEIAlBEGokAAspAQF/IAAoAgAiAEGACE8gAEGECElxBH8gAAUQzwEiASAAJQEmASABCwsmAQF/IAAoAggiAyABTQRAIAEgAyACEI0CAAsgACgCBCABQQxsagtAAQFvIAAQvANFBEAgARC8A0UEQCAAKAIAJQEgASgCACUBEJIBIQIQzwEiACACJgEgAA8LIAAQnAMPCyABEJwDCx0AIAAoAgAlASABBH8gASgCAAVBAAslARByQQBHCyYBAX8jAEEQayIBJAAgASAAQQhrNgIMIAFBDGoQlAIgAUEQaiQACyYBAX8jAEEQayIBJAAgASAAQQhrNgIMIAFBDGoQtwMgAUEQaiQACyYAIAAgATYCCCAAIAJBACABQQFxIgEbNgIEIABBACACIAEbNgIACycBAX8jAEEQayICJAAgAiABNgIMIAAgAkEMakEEENIBIAJBEGokAAuoAgEEfyMAQRBrIgUkABDPASIEIAAmARDPASIGIAEmASMAQdAAayIDJAAgAyAGNgIUIAMgBDYCECADIAI2AhggAyADQc8AaiICNgJIIAMgAjYCRCADIAI2AkAgAyADQRhqNgI8IAMgAjYCOCADIAI2AjQgAyACNgIwIAMgA0EUajYCLCADIAI2AiggAyACNgIkIAMgAjYCICADIANBEGo2AhwjAEEQayICJAAgAkEIaiADQRxqIgQoAgAoAgAgBCgCECgCACAEKAIgKAIAQQBHEK0BIAIoAgwhBCADQQhqIgYgAigCCDYCACAGIAQ2AgQgAkEQaiQAIAMgAygCCCADKAIMEMoDIAUgAykDADcCACADQdAAaiQAIAUoAgAgBSgCBCAFQRBqJAALngUBDH8jAEEQayIGJAAQzwEiASAAJgEjAEEgayIDJAAgAyABNgIIIAMgA0EfaiIBNgIYIAMgATYCFCADIAE2AhAgAyADQQhqNgIMIwBBEGsiByQAIAdBCGohCSADQQxqKAIAKAIAIQIjAEFAaiIBJAAgASACNgIcIAFBEGoQrQJBASEIIAEoAhQhAgJAIAEoAhBBAXENACABIAI2AiAgAUEkaiABQSBqIgJB/JLAAEEFEPABIAEgAhCsBDYCMCABIAEoAiggASgCLBCJAzYCNCABQThqIQIjAEEQayIEJAAgAUEwaiIKKAIAJQEgAUE0aiILKAIAJQEQjwEhDCAEQQhqEKkDQQEhBQJAIAQoAghBAXEEQCACIAQoAgw2AgQMAQtBACEFIAIgDEEARzoAAQsgAiAFOgAAIARBEGokAAJAIAEtADhBAUYNACABLQA5RQRAIAIgCiALIAFBHGoQkQIgAS0AOEEBRg0BCyABQQhqIAFBMGoiBCABQTRqIgUQnQIgASgCDCECIAEoAghBAXEEQCAFENsDIAQQ2wMgAUEkahCiBCABQSBqENsDDAILIAEgAjYCOCABQThqIgQoAgAlASABQSBqIggoAgAlASABQTRqIgUoAgAlARCFASEAEM8BIgIgACYBIAUQ2wMgAUEwahDbAyABQSRqEKIEIAgQ2wMgBBDbA0EAIQgMAQsgASgCPCECIAFBNGoQ2wMgAUEwahDbAyABQSRqEKIEIAFBIGoQ2wMLIAFBHGoQ2wMgCSACNgIEIAkgCDYCACABQUBrJAAgBygCDCEBIAMgBygCCDYCACADIAE2AgQgB0EQaiQAIAYgAygCACADKAIEEKIDIANBIGokACAGKAIAIAYoAgQgBigCCCAGQRBqJAAL5gMBCn8jAEEQayIEJAAQzwEiASAAJgEjAEEgayICJAAgAiABNgIIIAIgAkEfaiIBNgIYIAIgATYCFCACIAE2AhAgAiACQQhqNgIMIwBBEGsiBSQAIAVBCGohCCACQQxqKAIAKAIAIQYjAEEwayIBJAAgASAGNgIMIAEQrQJBASEDIAEoAgQhBwJAAkAgASgCAEEBcQ0AIAEgBzYCECABQRRqIAFBEGoiA0H8ksAAQQUQ8AEgASADEKwENgIgIAEgAUEgaiABKAIYIAEoAhwQ0gIiBzYCJCABQSRqEJ0ERQRAIAEQ7AMiBzYCKCABIAFBDGoQjAQiCQR/IAMQnAMFIAYLNgIsIAFBKGoiA0G0j8AAQQcgAUEsaiIGELsCIAFBIGoiCiABKAIYIAEoAhwgAxC7AiAGENsDIAFBJGoQ2wMgChDbAyABQRRqEKIEIAFBEGoQ2wNBACEDIAlFDQIMAQsgAUEgahDbAyABQRRqEKIEIAFBEGoQ2wNBACEDCyABQQxqENsDCyAIIAc2AgQgCCADNgIAIAFBMGokACAFKAIMIQEgAiAFKAIINgIAIAIgATYCBCAFQRBqJAAgBCACKAIAIAIoAgQQogMgAkEgaiQAIAQoAgAgBCgCBCAEKAIIIARBEGokAAtIAQJ/IwBBEGsiASQAIAEgADoADyABQQ9qIQBBAEHskcAAKAIAEQEAIgJFBEBB8IvAABC9AgALIAIgAC0AADoAACABQRBqJAALHwAgAEEwa0EKSSAAQd8BcUHBAGtBGklyIABB3wBGcgstAQF+QbDHwQApAwAhAUGwx8EAQgA3AwAgACABQiCIPgIEIAAgAadBAUY2AgAL9AEBBX8jAEEQayIFJAAQzwEiAyAAJgEQzwEiBCABJgEjAEFAaiICJAAgAiAENgIYIAIgAzYCFCACIAJBP2oiAzYCOCACIAM2AjQgAiADNgIwIAIgAkEYajYCLCACIAM2AiggAiADNgIkIAIgAzYCICACIAJBFGo2AhwjAEEQayIDJAAgA0EIaiACQRxqIgQoAgAoAgAgBCgCECgCABDhASADKAIMIQQgAkEIaiIGIAMoAgg2AgAgBiAENgIEIANBEGokACACIAIoAgggAigCDBDKAyAFIAIpAwA3AgAgAkFAayQAIAUoAgAgBSgCBCAFQRBqJAALugkBDH8jAEEQayIJJAAQzwEiAyAAJgEQzwEiBiABJgEjAEFAaiIEJAAgBCAGNgIYIAQgAzYCFCAEIARBP2oiAzYCOCAEIAM2AjQgBCADNgIwIAQgBEEYajYCLCAEIAM2AiggBCADNgIkIAQgAzYCICAEIARBFGo2AhwjAEEQayIKJAAgCkEIaiELIARBHGoiAygCACgCACEGIAMoAhAoAgAhAyMAQeAAayICJAAgAiADNgIwIAIgBjYCLCACQSBqEK0CQQEhDCACKAIkIQYCQCACKAIgQQFxBEAgBiEDDAELIAIgBjYCNCACQThqIAJBNGoiA0H8ksAAQQUQ8AEgAiADEKwENgJEIAIgAkHEAGogAigCPCIFIAIoAkAiAxDSAjYCSCACIAJByABqIggQiQQEfyAIQYGTwABBDBDSAgVBgAgLNgJMQYMIIQggAkHIAGoiBxCJBARAIAIgB0GNk8AAQRQQ0gI2AlxBgghBgwggAkHcAGoiBxCdBBshCCAHENsDCwJAAkACQAJAIAIgAkHEAGogAkHMAGogAkEwahDVAQR/IAJByABqIgMQiQQEQCACIANBoZPAAEEHENICNgJQIAJB0ABqIgcQiAQiAwRAIAJBgAg2AlwgAkEYaiADIAJB3ABqIg0QnAJBASEFIAIoAhwhAyACKAIYQQFxBEAgDRDbAyAHENsDDAQLIAIgAzYCVCACQdQAahDbAyACQdwAahDbAwsgAkHQAGoQ2wMLIAJBgAg2AlwgAkEQaiACQSxqIAJB3ABqIgcQnAJBASEFIAIoAhQhAyACKAIQQQFxBEAgBxDbAwwCCyACIAM2AlAgAkHcAGoiBRDbAyACEOwDNgJUIAJB1ABqIgNBgZPAAEEMIAJBMGoQuwIgA0Ghk8AAQQcgAkHQAGoiBxC7AiACIAg2AlwgA0GNk8AAQRQgBRC7AiAFENsDIAJBxABqIAIoAjwgAigCQCADELsCIAMQ2wMgBxDbAyACKAJAIQMgAigCPAUgBQsgAxDSAjYCVCACIAJB1ABqIghBjZPAAEEUENICNgJcIAJB3ABqIgUQnQQhAyAFENsDIAMNASACQYIINgJcIAhBjZPAAEEUIAUQuwIgBRDbAyACEOwDIgM2AlggAiACKAI8IAIoAkAQiQM2AlwgAkHYAGpBqJPAAEELIAUQuwIgBRDbAyACQQhqIAYgAxDhASACKAIIQQFxRQ0CIAIoAgwhAyAIENsDQQAhBQsgAkHMAGoQ2wMgAkHIAGoQ2wMgAkHEAGoQ2wMgAkE4ahCiBCAFRQ0DIAJBNGoQ2wMMAwsgAkHUAGoQ2wMgAkHMAGoQ2wMgAkHIAGoQ2wMgAkHEAGoQ2wMgAkE4ahCiBCACQTRqENsDDAELIAJB1ABqENsDIAJBzABqENsDIAJByABqENsDIAJBxABqENsDIAJBOGoQogQLQQAhDAsgAkEwahDbAyACQSxqENsDIAsgAzYCBCALIAw2AgAgAkHgAGokACAKKAIMIQMgBEEIaiIGIAooAgg2AgAgBiADNgIEIApBEGokACAEIAQoAgggBCgCDBDKAyAJIAQpAwA3AgAgBEFAayQAIAkoAgAgCSgCBCAJQRBqJAALJAEBfyAAKAIAIAAoAggiAmsgAUkEQCAAIAIgAUEBQQEQ2AILC9gFAQp/IwBBEGsiBSQAEM8BIgEgACYBIwBBMGsiAiQAIAIgATYCGCACIAJBL2oiATYCKCACIAE2AiQgAiABNgIgIAIgAkEYajYCHCMAQRBrIgYkACAGQQhqIQggAkEcaigCACgCACEDIwBB8ABrIgEkACABIAM2AiQgA0EAEMoEIAEgAUEkaiIEEKwENgIoIAEgBBCxAjYCLCABIAFBLGoiBBClBDYCOCABQQA2AjQgASAENgIwAkADQCABQRhqIAFBMGoQqQIgASgCGEEBcUUNASABIAEoAhw2AjwgASABQTxqQaiTwABBCxDSAjYCQCABQcQAaiABQUBrEKACAkACQCABKAJEQYCAgIB4RwRAIAFB2ABqIAFBzABqKAIAIgM2AgAgASABKQJENwNQIAEgAUEoaiABKAJUIAMQ0gI2AmAgASABQeAAaiIJQaGTwABBBxDSAjYCZCABQeQAaiIKEIgEIgMEQCABQYAINgJsIAlBoZPAAEEHIAFB7ABqIgQQuwIgBBDbAyABQYAINgJsIAFBEGogAyAEEJwCIAEoAhQhAyABKAIQQQFxBEAgBBDbAyAKENsDIAkQ2wMgAUHQAGoQogQMBAsgASADNgJoIAFB6ABqENsDIAFB7ABqENsDCyABQeQAahDbAyABQeAAahDbAyABQdAAahCiBAwBCyABQQhqIAFBPGpB8JXAAEEQEPcBIAEoAghBAXFFDQAgASgCDCEDDAELIAFBQGsQ2wMgAUE8ahDbAwwBCwsgAUFAaxDbAyABQTxqENsDQQEhBwsgAUEsahDbAyABQShqENsDIAFBJGoQ2wMgCCADNgIEIAggBzYCACABQfAAaiQAIAYoAgwhASACQRBqIgMgBigCCDYCACADIAE2AgQgBkEQaiQAIAJBCGogAigCECACKAIUEMoDIAUgAikDCDcCACACQTBqJAAgBSgCACAFKAIEIAVBEGokAAv5CgILfwF+IwBBEGsiByQAEM8BIgEgACYBIwBBMGsiBCQAIAQgATYCGCAEIARBL2oiATYCKCAEIAE2AiQgBCABNgIgIAQgBEEYajYCHCMAQRBrIggkACAIQQhqIQkgBEEcaigCACgCACEDIwBBoAFrIgEkACABIAM2AiggAUGglsAAQQ4Q+AI2AiwgAUEgaiEKAkACQAJAAkBBAEHQlMAAKAIAEQEAIgIEQCACKAIAIgVB/////wdPDQNBASELIAIgBUEBajYCACACKAIEQQFGDQFBACELDAILQfCLwAAQvQIACyACQQhqEJwDIQYgAigCAEEBayEFCyACIAU2AgAgCiAGNgIEIAogCzYCAAwBC0Hgl8AAENAEAAtBASECAkAgASgCIEEBcUUEQEGulsAAQRsQiQMhAwwBCyABIAEoAiQ2AjAgASABQShqEKYENgI0IAEgAUE0aiICEKUENgJAIAFBADYCPCABIAI2AjgDQCABQRhqIAFBOGoQqQICQAJAAkACQAJ/AkACQCABKAIYQQFxBEAgASABKAIcNgJEIAFBgAFqIAFBxABqEKACAkAgASgCgAFBgICAgHhHBEAgAUHQAGogAUGIAWooAgA2AgAgASABKQKAATcDSAwBCyABQQA2AlAgAUKAgICAEDcDSAsgAUEQaiABQShqIAFBxABqEJ0CIAEoAhQhAyABKAIQQQFxDQQgASADNgJUIAEgAUHUAGoiAxCLBAR/IANByZbAAEEDENICBUGACAs2AlggAUH0AGogAUHYAGoQoAIgASgCdCIDQYCAgIB4RwRAIAFBiAFqIAFB/ABqKAIAIgI2AgAgASABKQJ0NwOAASACDQMgAUGAAWoQogQLIAEoAkwgASgCUEEtEIcDDQEgAUECNgKEASABQbSXwAA2AoABIAFCATcCjAEgAUECNgKcASABIAFBmAFqNgKIASABIAFByABqNgKYASABQfQAaiABQYABaiICEOIBIAFB8ABqIAFB/ABqKAIAIgM2AgAgASABKQJ0NwNoIAEoAmwgAxCJAyEDIAFB6ABqEKIEIAEgAzYCgAEgAigCACUBEGEgAhDbAwwHCyABQTRqENsDIAFBMGoQ2wNBACECDAgLIAFB3ABqIAFByABqEIcCIAEoAmAhAiABKAJkDAELIAEgASkCeCIMNwJgIAEgAzYCXCAMpyECIAxCIIinCyEFIwBBEGsiAyQAIAFBLGooAgAgA0EIaiACIAUQxwIlASADKAIIIAMoAgwQbCEAEM8BIgIgACYBIANBEGokACABIAI2AoABIAFBgAFqIgIQjAQhAyACENsDIANFDQIgARDsAzYCaCABIAEoAmAgASgCZBCJAzYCgAEgAUHoAGoiBUHJlsAAQQMgAhC7AiACENsDIAVB1JfAAEEJIAFB1ABqIgYQuwIgAUGACDYCgAEgAUEIaiABQTBqIAIgBRCSAiABKAIMIQMgASgCCEEBcUUNASACENsDIAUQ2wMgAUHcAGoQogQgAUHYAGoQ2wMgBhDbAwsgAUHIAGoQogQgAUHEAGoQ2wMgAUE0ahDbAyABQTBqENsDQQEhAgwECyABIAM2AnQgAUH0AGoQ2wMgAUGAAWoQ2wMgAUHoAGoQ2wMLIAFB3ABqEKIECyABQdgAahDbAyABQdQAahDbAyABQcgAahCiBCABQcQAahDbAwwACwALIAFBLGoQ2wMgAUEoahDbAyAJIAM2AgQgCSACNgIAIAFBoAFqJAAgCCgCDCEBIARBEGoiAyAIKAIINgIAIAMgATYCBCAIQRBqJAAgBEEIaiAEKAIQIAQoAhQQygMgByAEKQMINwIAIARBMGokACAHKAIAIAcoAgQgB0EQaiQAC8QDAQl/IwBBEGsiBSQAEM8BIgEgACYBIwBBMGsiAiQAIAIgATYCGCACIAJBL2oiATYCKCACIAE2AiQgAiABNgIgIAIgAkEYajYCHCMAQRBrIgYkACAGQQhqIQcgAkEcaigCACgCACEDIwBBMGsiASQAIAEgAzYCGEEBIQggA0EBEMoEIAFBEGogAUEYahDyAQJAIAEoAhBBAXEEQCABKAIUIQQMAQsgASABQRhqIgMQnAMQ4AE2AiAgAUEgahDbAyABIAMQsQI2AhwgASABQRxqIgMQpQQ2AiggAUEANgIkIAEgAzYCIAJAA0AgAUEIaiABQSBqEKkCIAEoAghBAXFFDQEgASABKAIMNgIsIAEgAUEsaiIDQfiUwABBDRD3ASABKAIAIAEoAgQhBCADENsDQQFxRQ0ACyABQRxqENsDDAELIAFBHGoQ2wNBACEICyABQRhqENsDIAcgBDYCBCAHIAg2AgAgAUEwaiQAIAYoAgwhASACQRBqIgQgBigCCDYCACAEIAE2AgQgBkEQaiQAIAJBCGogAigCECACKAIUEMoDIAUgAikDCDcCACACQTBqJAAgBSgCACAFKAIEIAVBEGokAAu+AQEFfyMAQRBrIgMkABDPASICIAAmASMAQTBrIgEkACABIAI2AhggASABQS9qIgI2AiggASACNgIkIAEgAjYCICABIAFBGGo2AhwjAEEQayICJAAgAkEIaiABQRxqKAIAKAIAEKsBIAIoAgwhBCABQRBqIgUgAigCCDYCACAFIAQ2AgQgAkEQaiQAIAFBCGogASgCECABKAIUEMoDIAMgASkDCDcCACABQTBqJAAgAygCACADKAIEIANBEGokAAv5BAELfyMAQRBrIgUkABDPASIBIAAmASMAQTBrIgMkACADIAE2AhggAyADQS9qIgE2AiggAyABNgIkIAMgATYCICADIANBGGo2AhwjAEEQayIGJAAgBkEIaiEKIANBHGooAgAoAgAhAiMAQUBqIgEkACABIAI2AhQgAUEIahCtAkEBIQIgASgCDCEIIAEoAghBAXFFBEAgASAINgIYIAFBHGogAUEYaiICQfCXwABBCxDwASABIAIQrAQ2AiggASABQRRqQYCPwABBBxDSAjYCLCABIAFBKGoiCSABKAIgIgQgASgCJCIHENICNgIwIAFBMGogAUEsaiILEP8DBEAgCSAEIAcgCxC7AiABIAIQqwQ2AjQgAUE0aiICEPQDRQRAIAgQ6wMiCRCTBCACENsDIAEgCTYCNAsgARDsAzYCOCABIAQgBxCJAzYCPCABQThqIgJB4pPAAEEIIAFBPGoiBBC7AiAEENsDIAJBgI/AAEEHIAFBLGoQuwIgAkGvlMAAQQkgAUEUahC7AiABQYMIQYIIIAFBMGoQnQQbNgI8IAJBkJTAAEENIAQQuwIgBBDbAyABIAFBNGoiBxCcAzYCPCAEIAIQ7wMgBBDbAyACENsDIAcQ2wMLIAFBMGoQ2wMgAUEsahDbAyABQShqENsDIAFBHGoQogQgAUEYahDbA0EAIQILIAFBFGoQ2wMgCiAINgIEIAogAjYCACABQUBrJAAgBigCDCEBIANBEGoiAiAGKAIINgIAIAIgATYCBCAGQRBqJAAgA0EIaiADKAIQIAMoAhQQygMgBSADKQMINwIAIANBMGokACAFKAIAIAUoAgQgBUEQaiQACyQAQQAgACgCABEBACIARQRAQfCLwAAQvQIACyAAIAEgAhDfAwu3KAIafwF+EM8BIgIgACYBEM8BIgQgASYBIwBBMGsiDSQAIA0gBDYCCCANIAI2AgQgDSANQS9qIgI2AiggDSACNgIkIA0gAjYCICANIA1BCGo2AhwgDSACNgIYIA0gAjYCFCANIAI2AhAgDSANQQRqNgIMIA1BDGoiAigCACgCACEEIAIoAhAoAgAhAiMAQdAAayIGJAAgBiACNgIMIAYgBDYCCAJAAkAgBkEIaiICEIkEBEAgBiACQbuPwABBAxDSAjYCQCAGQUBrIgIQjAQgAhDbA0UNAQsgBkEwaiAGQQhqEKACIAYoAjBBgICAgHhHBEAgBkHIAGogBkE4aigCADYCACAGIAYpAjA3A0AgBiAGKQJENwIkIAYgBkEkakEBEK8CNgIYIAZBGGoiAiAGQQxqEPECIQQgAhDbAyAGQUBrEKIEDAILIAZBCGogBkEMahDxAiEEDAELIAZB3JLAACAGQQhqELUDIgI2AhAgBkEQahCMBEUEQCAGIAI2AhQgBkEUaiICIAZBDGoQ8QIhBCACENsDDAELIAZBJGogBkEIahDVAiAGQRhqIRIgBigCKCECIAYoAiwhE0EAIQQjAEHwAWsiAyQAAkAgE0UEQCASQYCAgIB4NgIADAELIANBKGogAhCHAiACIBNBDGxqIQpBASEFA0ACQAJAIAgEQCACIApHDQEMAgsgBSAKIAJrQQxuTw0BIAQgBWohBCACIAVBDGxqIQILIANBAjYCzAEgA0H4nsAANgLIASADQgE3AtQBIANBBDYCUCADIARBAWs2AqABIAMgA0HMAGo2AtABIAMgA0GgAWo2AkwgA0GwAWogA0HIAWoQ4gEgA0HoAWogA0G4AWooAgAiBTYCACADIAMpArABNwPgASADQShqIgggAygC5AEgBRDnAyADQeABahCiBCAIIAIoAgQgAigCCBDnA0EBIQggBEEBaiEEIAJBDGohAkEAIQUMAQsLIANBNGogA0EoaiIXEIcCIANByAFqIRQgAygCLCEPIANBMGoiGCgCACEOIwBB0ABrIgskACALQThqIA5BAUEBQcCMwAAQrgIgC0EANgJMIAsgCykDODcCRCAPQQJqIRBBACAOayEZA0ACQCAHIA9qIRYgByAZaiEaQQAhDCAQIQJBAiEKIAchCANAAkACQCAOIAgiEUsEQCAIIA9qLQAAQTxHIAhBAWoiCCAOT3INAiAIIA9qLQAAQd8BcUHBAGtB/wFxQRlLDQIgDCEEIAIhCSAKIQUDQCAFIBpqRQ0DIAcgCWotAAAiFUEwa0H/AXFBCk8gFUFfcUHBAGtB/wFxQRlLcUUEQCAEQQFqIQQgCUEBaiEJIAVBAWohBQwBCwsgFUEtRw0CA0AgBCAHaiIVQQJqIgUgDk8NAiAEIBZqQQJqLQAAIglBLUYgCUEwa0H/AXFBCklyRSAJQd8BcUHBAGtB/wFxQRlLcQ0CIARBAWohBAwACwALIAtBMGogByAPIA5B1JvAABCwAiALQcQAaiALKAIwIAsoAjQQ5wMgFEEIaiALQcwAaigCADYCACAUIAspAkQ3AgAgC0HQAGokAAwDCyALQShqIAUgDyAOQfSbwAAQsAIgC0EgaiALKAIoIAsoAixBPhDUASALKAIgQQFxRQ0AIAsoAiQiCUUNACAOIAcgCWogBGoiG0EBaksEQCAJIBZqIARqQQFqLQAAQS9HDQEgC0EYaiAFIAkgFWoiCkEBaiAPIA5BlJzAABDqASALQRBqIAsoAhggCygCHBDKASALKAIUIQkgCygCECEMIAtBCGogCCAFIA8gDkGknMAAEOoBIAsoAgwhBCALKAIIIQUgCyAHIBEgDyAOQbScwAAQ6gEgC0HEAGoiAiALKAIAIAsoAgQQ5wMgAkE8EJgDIAIgBSAEEOcDIAIgDCAJEOcDIAJBhJ3AAEGHncAAEO8CIAIgBSAEEOcDIAJBPhCYAyAKQQNqIQcMBAsgG0EBaiAOQYScwAAQjQIACyAMQQFqIQwgAkEBaiECIApBAWohCgwACwALCyAXEKIEIBggA0HQAWooAgAiCDYCACADIAMpAsgBNwMoIANBADYCSCADQoCAgIDAADcCQCADKAIsIQdBACEEIwBB8ABrIgIkACACQQA2AkggAkKAgICAwAA3AkAgAkHkAGohECACQdgAaiERA0ACQCACQThqIAQgByAIQcyZwAAQsAIgAkEwaiACKAI4IAIoAjxB3JnAAEEDEOQCAkACQCACKAIwQQFxBEAgBCACKAI0IARqIgkgBCAJSRshCiAJQQFrIQUCQANAIAVBAWogBE0NASAFIAhPDQMgBSAHaiAFQQFrIQUtAAAQqAMNAAsgBUECaiEKCyACQShqIAlBA2oiBSAHIAhB8JnAABCwAiACQSBqIAIoAiggAigCLEH9ABDUASACKAIgQQFxRSAJIApNcg0CIAIoAiQgBWoiDCAFTQ0CIAxBAWoiBCAITw0CIAQgB2otAABB/QBHDQIgAkEYaiAKIAxBAmoiBCAHIAhBhJrAABDqASACQcwAaiACKAIYIAIoAhwQqwIgAkEQaiAKIAkgByAIQZSawAAQ6gEgESACKAIQIAIoAhQQqwIgAkEIaiAFIAwgByAIQaSawAAQ6gEgECACKAIIIAIoAgwQqwIgAigCSCIKIAIoAkBGBEAjAEEQayIFJAAgBUEIaiACQUBrIgkgCSgCAEEBQQRBJBDRASAFKAIIIglBgYCAgHhHBEAgCSAFKAIMQbSawAAQzgMACyAFQRBqJAALIAIoAkQgCkEkbGogAkHMAGpBJPwKAAAgAiAKQQFqNgJIDAQLIBQgAikCQDcCACAUQQhqIAJByABqKAIANgIAIAJB8ABqJAAMAgsgBSAIQeCZwAAQjQIACyAJQQFqIQQMAQsLIAMoAsgBIQUgAyADKALMASICIAMoAtABQSRsIgRqNgJYIAMgBTYCVCADIAI2AlAgAyACNgJMIANBvAFqIQwgA0HMAWohCANAAkACQAJAAkACQAJAIAQEQCADIAJBJGoiBTYCUCACKAIAIgdBgICAgHhHDQELIwBBEGsiBSQAIAUgA0HMAGoiAjYCDCACKAIMIAIoAgQiBGtBJG4hAgNAIAIEQCAEEKIEIARBDGoQogQgBEEYahCiBCACQQFrIQIgBEEkaiEEDAELCyMAQRBrIgIkACACIAVBDGooAgAiBCgCADYCDCACIAQoAgg2AgggAkEIakEEQSQQ1AIgAkEQaiQAIAVBEGokACADKAJIIQQgAygCRCECIAMgAygCQDYC0AEgAyACNgLMASADIAI2AsgBIAMgAiAEQRhsIgRqNgLUAQNAIARFDQIgAyACQRhqIgU2AswBIAIoAgAiCEGAgICAeEYNAiADIAIpAgQ3AlAgAyAINgJMIANB6AFqIAJBFGooAgAiCzYCACADIAIpAgw3A+ABIANBsAFqIQkgAygCLCEIIANBMGoiDigCACEMIAMoAuQBIRBBACEKQQEhByMAQbABayICJAAgAkEgQQFBAUHAjMAAEK4CIAJBADYCFCACIAIpAwA3AgwgAkEYaiIPIAggDCADQcwAaiIRKAIEIBEoAggQqgEgAkHYAGogD0HAAPwKAAAgCyAQaiELA0ACQCAHRQ0AIAIgB0EBazYCmAEgAkGkAWogAkHYAGoQwAEgAigCpAFFDQAgCCAKaiEHIAIoAqwBIQogAkEMaiIPIAcgCCACKAKoAWoQ7wIgDyAQIAsQ7wIgAigCmAEhBwwBCwsgAkEMaiAIIApqIAggDGoQ7wIgCUEIaiACQRRqKAIANgIAIAkgAikCDDcCACACQbABaiQAIANBKGoQogQgDiADQbgBaigCADYCACADIAMpArABNwMoIARBGGshBCADQeABahCiBCAREKIEIAUhAgwACwALIAMgAikCBDcCYCADIAc2AlwgA0HwAGogAkEUaigCADYCACADIAIpAgw3A2ggA0GAAWogAkEgaigCADYCACADIAIpAhg3A3ggA0ECNgLMASADQbyewAA2AsgBIANCATcC1AEgA0ECNgLkASADIANB4AFqNgLQASADIANB+ABqNgLgASADQbABaiADQcgBahDiASADQZgBaiADQbgBaiIHKAIAIgI2AgAgAyADKQKwATcDkAEgA0EgaiADKAKUASACEJACIAMoAiAhAiADIAMoAiQiCjYCzAEgAyACNgLIASACQQFxBEAgCBDbAwwDCyADIAo2ArABIwBBEGsiAiQAIANBsAFqIgooAgAlARCCASEAEM8BIhAgACYBIAJBCGoQqQNBASEJIANBGGoiEQJ/IAIoAghBAXEEQCACKAIMDAELQQAhCSAQCzYCBCARIAk2AgAgAkEQaiQAIAMoAhghAiADIAMoAhwiCTYCzAEgAyACNgLIASACQQFxRQ0BIAgQ2wMgChDbAwwCCyMA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ATYCCCACIAJBH2oiATYCGCACIAE2AhQgAiABNgIQIAIgAkEIajYCDCACQQxqKAIAKAIAIQQjAEEQayIDJAAgAyAENgIMAkACQAJ/AkBBAEHQlMAAKAIAEQEAIgEEQCABKAIADQMgAUF/NgIAIAEoAgQNAUEADAILIANBDGoQ2wNB8IvAABC9AgALIAFBCGoQ2wMgASgCAEEBagshBSABIAQ2AgggAUEBNgIEIAEgBTYCACADQRBqJAAMAQtB1JTAABDPBAALIAJBIGokAAuSAQEEfxDPASIBIAAmASMAQSBrIgIkACACIAE2AgggAiACQR9qIgE2AhggAiABNgIUIAIgATYCECACIAJBCGo2AgwgAkEMaigCACgCACEDIwBBEGsiASQAIAEgAzYCDAJAIAFBDGoiBBCdBEUEQEEAIAEQ/wEgBBDbAwwBC0EBIAMQ/wELIAFBEGokACACQSBqJAALDAAgACABEOgDQQFzCxwBAW8gACgCACUBIAEQAiECEM8BIgAgAiYBIAALDwAgACgCACABKAIAEJYECxIAIAAoAgAlASABKAIAJQEQSQsSACAAKAIAJQEgASgCACUBEEoLDwAgACgCACABKAIAEJkECw8AIAAoAgAgASgCABCbBAsRAQF/EOwDIgElASAAEDYgAQtiAQF/AkACQCAAQQRrKAIAIgJBeHEiA0EEQQggAkEDcSICGyABak8EQCACQQAgAyABQSdqSxsNASAAELIBDAILQZSpwABBLkHEqcAAEOMCAAtB1KnAAEEuQYSqwAAQ4wIACwsMACAAQQAgABCLBBsLDwAgACgCACUBEJcBQQBHCw8AIAAoAgAlARCYAUEARwsPACAAKAIAJQEQnAFBAEcLDwAgACgCACUBEJ0BQQBHCw8AIAAoAgAlARCeAUEARwsPAEHY2sAAQSsgABDjAgALDAAgACUBIAElARAMCwwAIAAlASABJQEQEQsMACAAJQEgASUBECULDAAgACUBIAElARAmCwwAIAAlASABJQEQJwsMACAAJQEgASUBECsLDAAgACUBIAElARBCCwwAIAAlASABJQEQRgsMACAAJQEgASUBEEsLDAAgACUBIAElARBMCwwAIAAlASABJQEQUgsMACAAJQEgASUBEFULDAAgACUBIAElARBXC9kBAgV/AW8jAEEQayIBJAAjAEEQayIAJAACQEEAQeiSwAAoAgARAQAiAgRAIABBCGogAkHglcAAEPwCIAAoAgwhAiAAIAAoAggQ/QIgACgCBCEEIAAoAgAhAyACIAIoAgBBAWs2AgAgA0ECRw0BC0Hwi8AAEL0CAAsgASADNgIAIAEgBDYCBCAAQRBqJAACfyABKAIAQQFxBEAgASgCBAwBCyABQbGVwABBLxCJAzYCDCABQQxqIgAoAgAlARBjIAAQ2wNBgQgLIQAgAUEQaiQAIAAlASAAEIsCCw0AIAAoAgAlARCVAUULCwAgAEEEQQQQ1AILCwAgAEEEQQgQ1AILCwAgAEEEQQwQ1AILQAECfyAAKAIIIQIgACgCBCEBA0AgAgRAIAEQ2wMgAUEIahCiBCACQQFrIQIgAUEUaiEBDAELCyAAQQRBFBDUAgsLACAAQQFBARDUAgs0AQJ/IAAoAgghASAAKAIEIQIDQCABBEAgAUEBayEBIAIQogQgAkEMaiECDAELCyAAEKAECzQBAn8gACgCCCEBIAAoAgQhAgNAIAEEQCABQQFrIQEgAhDbAyACQQRqIQIMAQsLIAAQngQLCwAgACgCACUBEAQLGgEBbyAAKAIAJQEQCyEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQDiEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQECEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQEiEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQHSEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQHiEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQLyEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQNyEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQOCEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQOSEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQOiEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQPCEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQPSEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQPyEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQRCEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQRSEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQTSEBEM8BIgAgASYBIAALCwAgACgCACUBEE4LGgEBbyAAKAIAJQEQTyEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQUCEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQUSEBEM8BIgAgASYBIAALGgEBbyAAKAIAJQEQViEBEM8BIgAgASYBIAALGwACfyABQQlPBEAgASAAEL8BDAELIAAQpgELCxoBAW8gACgCACUBEF8hARDPASIAIAEmASAACxoBAW8gACgCACUBEGshARDPASIAIAEmASAACwsAIAAoAgAlARB6CxsBAW8gACgCACUBEIQBIQEQzwEiACABJgEgAAsuAQF/IwBBEGsiAiQAIAJBCGogACABEMcCIAIoAgggAigCDBCUASACQRBqJAAACwwAIAAgASkCADcDAAsOACABQdiqwABBBRDmAwsaACAAIAFByMvBACgCACIAQcwAIAAbEQAAAAsLACACIAAgARCzAQsOACABQd7FwQBBGBCzAQsOACABQbzFwQBBIBCzAQsKACAAJQEgARAjCwoAIAAlASABECgLCgAgACUBIAEQKQsKACAAJQEgARAuCwwAQeCSwABBCBD4AgsJAEEBQQAQ8QMLCQAgAEEANgIACxMAIABCgICAgNAMQfDYwAAQ3AQLEwAgAEKAgICA4AxB8NjAABDcBAtkAQN/IwBBEGsiACQAQQBB6JLAACgCABEBACIBRQRAQfCLwAAQvQIACyAAQQhqIAFB7JLAABCWAyAAKAIMIQEgACgCCCICENwDIAJBADYCACABIAEoAgBBAWo2AgAgAEEQaiQACwUAELsDCwcAQaDHwQALBwBBiMfBAAsHAEGUx8EACwIAC0cBAX8jAEEQayIDJAAgA0EIaiAAIAAoAgBBAUEEIAIQ0QEgAygCCCIAQYGAgIB4RwRAIAAgAygCDCABEM4DAAsgA0EQaiQACzYBAX8gASgCACIEQf////8HTwRAIAIQ0AQACyABIARBAWo2AgAgACABNgIEIAAgASADajYCAAtKAQF/IwBBIGsiAyQAIANBGGogAUEQaikCADcDACADQRBqIAFBCGopAgA3AwAgAyABKQIANwMIIAAgAiADQQhqELcBIANBIGokAAtvAgJ/AX4gAigCAEUEQCMAQRBrIgUkAAJ/AkAgAEUNACAAKAIAIABBADYCAEUNACAAKAIEDAELIAQgAxCvAgshACACKQIAIQcgASAANgIAIAJBATYCACAFIAc3AgggBUEIahDcAyAFQRBqJAALIAELNAEBfyMAQSBrIgIkACACQQA2AhggAkEBNgIMIAIgATYCCCACQgQ3AhAgAkEIaiAAEJkDAAtFAQF/IwBBMGsiAyQAIANBATYCDCADIAI2AgggA0IBNwIUIAMgA0Evaq0gAYQ3AyAgAyADQSBqNgIQIANBCGogABCZAwALC4bFAQ0AQYCAwAALpQsvcnVzdGMvZWQ2MWU3ZDdlMjQyNDk0ZmI3MDU3ZjI2NTczMDBkOWU3N2JiNGZjYi9saWJyYXJ5L2NvcmUvc3JjL2NlbGwvbGF6eS5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9mbHQyZGVjL3N0cmF0ZWd5L2dyaXN1LnJzAHNyYy9ob3N0LnJzAGxpYnJhcnkvYWxsb2Mvc3JjL2ZtdC5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9kaXlfZmxvYXQucnMAc3JjL2Nzcy5ycwAvaG9tZS9yYWp1Ly5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2Yvd2FzbS1iaW5kZ2VuLTAuMi4xMzAvc3JjL2NvbnZlcnQvc2xpY2VzLnJzAC9ydXN0Yy9lZDYxZTdkN2UyNDI0OTRmYjcwNTdmMjY1NzMwMGQ5ZTc3YmI0ZmNiL2xpYnJhcnkvYWxsb2Mvc3JjL3N0ci5ycwAvcnVzdGMvZWQ2MWU3ZDdlMjQyNDk0ZmI3MDU3ZjI2NTczMDBkOWU3N2JiNGZjYi9saWJyYXJ5L2NvcmUvc3JjL2l0ZXIvdHJhaXRzL2l0ZXJhdG9yLnJzAC9ydXN0Yy9lZDYxZTdkN2UyNDI0OTRmYjcwNTdmMjY1NzMwMGQ5ZTc3YmI0ZmNiL2xpYnJhcnkvY29yZS9zcmMvc3RyL3BhdHRlcm4ucnMAL2hvbWUvcmFqdS8uY2FyZ28vcmVnaXN0cnkvc3JjL2luZGV4LmNyYXRlcy5pby0xOTQ5Y2Y4YzZiNWI1NTdmL3dhc20tYmluZGdlbi0wLjIuMTMwL3NyYy9jYWNoZS9pbnRlcm4ucnMAbGlicmFyeS9jb3JlL3NyYy9udW0vZmx0MmRlYy9zdHJhdGVneS9kcmFnb24ucnMAbGlicmFyeS9jb3JlL3NyYy9udW0vYmlnbnVtLnJzAHNyYy9kb20ucnMAL3J1c3RjL2VkNjFlN2Q3ZTI0MjQ5NGZiNzA1N2YyNjU3MzAwZDllNzdiYjRmY2IvbGlicmFyeS9zdGQvc3JjL3RocmVhZC9sb2NhbC5ycwAvaG9tZS9yYWp1Ly5jYXJnby9yZWdpc3RyeS9zcmMvaW5kZXguY3JhdGVzLmlvLTE5NDljZjhjNmI1YjU1N2YvanMtc3lzLTAuMy4xMDcvc3JjL2Z1dHVyZXMvanNwaS5ycwAvcnVzdGMvZWQ2MWU3ZDdlMjQyNDk0ZmI3MDU3ZjI2NTczMDBkOWU3N2JiNGZjYi9saWJyYXJ5L2FsbG9jL3NyYy9zdHJpbmcucnMAc3JjL3RlbXBsYXRlLnJzAGxpYnJhcnkvY29yZS9zcmMvdW5pY29kZS9wcmludGFibGUucnMAL3J1c3RjL2VkNjFlN2Q3ZTI0MjQ5NGZiNzA1N2YyNjU3MzAwZDllNzdiYjRmY2IvbGlicmFyeS9hbGxvYy9zcmMvc2xpY2UucnMAL3J1c3QvZGVwcy9oYXNoYnJvd24tMC4xNS41L3NyYy9yYXcvbW9kLnJzAGxpYnJhcnkvY29yZS9zcmMvZm10L21vZC5ycwAvcnVzdGMvZWQ2MWU3ZDdlMjQyNDk0ZmI3MDU3ZjI2NTczMDBkOWU3N2JiNGZjYi9saWJyYXJ5L2FsbG9jL3NyYy9yYXdfdmVjL21vZC5ycwBsaWJyYXJ5L2NvcmUvc3JjL251bS9mbHQyZGVjL21vZC5ycwAvcnVzdC9kZXBzL2RsbWFsbG9jLTAuMi4xMC9zcmMvZGxtYWxsb2MucnMAbGlicmFyeS9zdGQvc3JjL2FsbG9jLnJzAGxpYnJhcnkvY29yZS9zcmMvdW5pY29kZS91bmljb2RlX2RhdGEucnMAzwAQAGoAAAA7AQAADgBBsIvAAAu7GgEAAAAHAAAACAAAAGNsb3N1cmUgaW52b2tlZCByZWN1cnNpdmVseSBvciBhZnRlciBiZWluZyBkcm9wcGVkAADvAhAATwAAABkBAAAZAAAA3AEQAE8AAADlBQAAFAAAANwBEABPAAAA5QUAACEAAADcARAATwAAANkFAAAhAAAAgwEQAFgAAADrBwAACQAAAKIDEABLAAAA6AEAABcA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AIMCAACsAQAArQEAAK4BAACIAgAArwEAALABAACxAQAAigIAALIBAACLAgAAswEAALQBAAC1AQAAtgEAALcBAACSAgAAuAEAALkBAAC8AQAAvQEAAMQBAADGAQAAxQEAAMYBAADHAQAAyQEAAMgBAADJAQAAygEAAMwBAADLAQAAzAEAAM0BAADOAQAAzwEAANABAADRAQAA0gEAANMBAADUAQAA1QEAANYBAADXAQAA2AEAANkBAADaAQAA2wEAANwBAADeAQAA3wEAAOABAADhAQAA4gEAAOMBAADkAQAA5QEAAOYBAADnAQAA6AEAAOkBAADqAQAA6wEAAOwBAADtAQAA7gEAAO8BAADxAQAA8wEAAPIBAADzAQAA9AEAAPUBAAD2AQAAlQEAAPcBAAC/AQAA+AEAAPkBAAD6AQAA+wEAAPwBAAD9AQAA/gEAAP8BAAAAAgAAAQIAAAICAAADAgAABAIAAAUCAAAGAgAABwIAAAgCAAAJAgAACgIAAAsCAAAMAgAADQIAAA4CAAAPAgAAEAIAABECAAASAgAAEwIAABQCAAAVAgAAFgIAABcCAAAYAgAAGQIAABoCAAAbAgAAHAIAAB0CAAAeAgAAHwIAACACAACeAQAAIgIAACMCAAAkAgAAJQIAACYCAAAnAgAAKAIAACkCAAAqAgAAKwIAACwCAAAtAgAALgIAAC8CAAAwAgAAMQIAADICAAAzAgAAOgIAAGUsAAA7AgAAPAIAAD0CAACaAQAAPgIAAGYsAABBAgAAQgIAAEMCAACAAQAARAIAAIkCAABFAgAAjAIAAEYCAABHAgAASAIAAEkCAABKAgAASwIAAEwCAABNAgAATgIAAE8CAABwAwAAcQMAAHIDAABzAwAAdgMAAHcDAAB/AwAA8wMAAIYDAACsAwAAiAMAAK0DAACJAwAArgMAAIoDAACvAwAAjAMAAMwDAACOAwAAzQMAAI8DAADOAwAAkQMAALEDAACSAwAAsgMAAJMDAACzAwAAlAMAALQDAACVAwAAtQMAAJYDAAC2AwAAlwMAALcDAACYAwAAuAMAAJkDAAC5AwAAmgMAALoDAACbAwAAuwMAAJwDAAC8AwAAnQMAAL0DAACeAwAAvgMAAJ8DAAC/AwAAoAMAAMADAAChAwAAwQMAAKMDAADDAwAApAMAAMQDAAClAwAAxQMAAKYDAADGAwAApwMAAMcDAACoAwAAyAMAAKkDAADJAwAAqgMAAMoDAACrAwAAywMAAM8DAADXAwAA2AMAANkDAADaAwAA2wMAANwDAADdAwAA3gMAAN8DAADgAwAA4QMAAOIDAADjAwAA5AMAAOUDAADmAwAA5wMAAOgDAADpAwAA6gMAAOsDAADsAwAA7QMAAO4DAADvAwAA9AMAALgDAAD3AwAA+AMAAPkDAADyAwAA+gMAAPsDAAD9AwAAewMAAP4DAAB8AwAA/wMAAH0DAAAABAAAUAQAAAEEAABRBAAAAgQAAFIEAAADBAAAUwQAAAQEAABUBAAABQQAAFUEAAAGBAAAVgQAAAcEAABXBAAACAQAAFgEAAAJBAAAWQQAAAoEAABaBAAACwQAAFsEAAAMBAAAXAQAAA0EAABdBAAADgQAAF4EAAAPBAAAXwQAABAEAAAwBAAAEQQAADEEAAASBAAAMgQAABMEAAAzBAAAFAQAADQEAAAVBAAANQQAABYEAAA2BAAAFwQAADcEAAAYBAAAOAQAABkEAAA5BAAAGgQAADoEAAAbBAAAOwQAABwEAAA8BAAAHQQAAD0EAAAeBAAAPgQAAB8EAAA/BAAAIAQAAEAEAAAhBAAAQQQAACIEAABCBAAAIwQAAEMEAAAkBAAARAQAACUEAABFBAAAJgQAAEYEAAAnBAAARwQAACgEAABIBAAAKQQAAEkEAAAqBAAASgQAACsEAABLBAAALAQAAEwEAAAtBAAATQQAAC4EAABOBAAALwQAAE8EAABgBAAAYQQAAGIEAABjBAAAZAQAAGUEAABmBAAAZwQAAGgEAABpBAAAagQAAGsEAABsBAAAbQQAAG4EAABvBAAAcAQAAHEEAAByBAAAcwQAAHQEAAB1BAAAdgQAAHcEAAB4BAAAeQQAAHoEAAB7BAAAfAQAAH0EAAB+BAAAfwQAAIAEAACBBAAAigQAAIsEAACMBAAAjQQAAI4EAACPBAAAkAQAAJEEAACSBAAAkwQAAJQEAACVBAAAlgQAAJcEAACYBAAAmQQAAJoEAACbBAAAnAQAAJ0EAACeBAAAnwQAAKAEAAChBAAAogQAAKMEAACkBAAApQQAAKYEAACnBAAAqAQAAKkEAACqBAAAqwQAAKwEAACtBAAArgQAAK8EAACwBAAAsQQAALIEAACzBAAAtAQAALUEAAC2BAAAtwQAALgEAAC5BAAAugQAALsEAAC8BAAAvQQAAL4EAAC/BAAAwAQAAM8EAADBBAAAwgQAAMMEAADEBAAAxQQAAMYEAADHBAAAyAQAAMkEAADKBAAAywQAAMwEAADNBAAAzgQAANAEAADRBAAA0gQAANMEAADUBAAA1QQAANYEAADXBAAA2AQAANkEAADaBAAA2wQAANwEAADdBAAA3gQAAN8EAADgBAAA4QQAAOIEAADjBAAA5AQAAOUEAADmBAAA5wQAAOgEAADpBAAA6gQAAOsEAADsBAAA7QQAAO4EAADvBAAA8AQAAPEEAADyBAAA8wQAAPQEAAD1BAAA9gQAAPcEAAD4BAAA+QQAAPoEAAD7BAAA/AQAAP0EAAD+BAAA/wQAAAAFAAABBQAAAgUAAAMFAAAEBQAABQUAAAYFAAAHBQAACAUAAAkFAAAKBQAACwUAAAwFAAANBQAADgUAAA8FAAAQBQAAEQUAABIFAAATBQAAFAUAABUFAAAWBQAAFwUAABgFAAAZBQAAGgUAABsFAAAcBQAAHQUAAB4FAAAfBQAAIAUAACEFAAAiBQAAIwUAACQFAAAlBQAAJgUAACcFAAAoBQAAKQUAACoFAAArBQAALAUAAC0FAAAuBQAALwUAADEFAABhBQAAMgUAAGIFAAAzBQAAYwUAADQFAABkBQAANQUAAGUFAAA2BQAAZgUAADcFAABnBQAAOAUAAGgFAAA5BQAAaQUAADoFAABqBQAAOwUAAGsFAAA8BQAAbAUAAD0FAABtBQAAPgUAAG4FAAA/BQAAbwUAAEAFAABwBQAAQQUAAHEFAABCBQAAcgUAAEMFAABzBQAARAUAAHQFAABFBQAAdQUAAEYFAAB2BQAARwUAAHcFAABIBQAAeAUAAEkFAAB5BQAASgUAAHoFAABLBQAAewUAAEwFAAB8BQAATQUAAH0FAABOBQAAfgUAAE8FAAB/BQAAUAUAAIAFAABRBQAAgQUAAFIFAACCBQAAUwUAAIMFAABUBQAAhAUAAFUFAACFBQAAVgUAAIYFAACgEAAAAC0AAKEQAAABLQAAohAAAAItAACjEAAAAy0AAKQQAAAELQAApRAAAAUtAACmEAAABi0AAKcQAAAHLQAAqBAAAAgtAACpEAAACS0AAKoQAAAKLQAAqxAAAAstAACsEAAADC0AAK0QAAANLQAArhAAAA4tAACvEAAADy0AALAQAAAQLQAAsRAAABEtAACyEAAAEi0AALMQAAATLQAAtBAAABQtAAC1EAAAFS0AALYQAAAWLQAAtxAAABctAAC4EAAAGC0AALkQAAAZLQAAuhAAABotAAC7EAAAGy0AALwQAAAcLQAAvRAAAB0tAAC+EAAAHi0AAL8QAAAfLQAAwBAAACAtAADBEAAAIS0AAMIQAAAiLQAAwxAAACMtAADEEAAAJC0AAMUQAAAlLQAAxxAAACctAADNEAAALS0AAKATAABwqwAAoRMAAHGrAACiEwAAcqsAAKMTAABzqwAApBMAAHSrAAClEwAAdasAAKYTAAB2qwAApxMAAHerAACoEwAAeKsAAKkTAAB5qwAAqhMAAHqrAACrEwAAe6sAAKwTAAB8qwAArRMAAH2rAACuEwAAfqsAAK8TAAB/qwAAsBMAAICrAACxEwAAgasAALITAACCqwAAsxMAAIOrAAC0EwAAhKsAALUTAACFqwAAthMAAIarAAC3EwAAh6sAALgTAACIqwAAuRMAAImrAAC6EwAAiqsAALsTAACLqwAAvBMAAIyrAAC9EwAAjasAAL4TAACOqwAAvxMAAI+rAADAEwAAkKsAAMETAACRqwAAwhMAAJKrAADDEwAAk6sAAMQTAACUqwAAxRMAAJWrAADGEwAAlqsAAMcTAACXqwAAyBMAAJirAADJEwAAmasAAMoTAACaqwAAyxMAAJurAADMEwAAnKsAAM0TAACdqwAAzhMAAJ6rAADPEwAAn6sAANATAACgqwAA0RMAAKGrAADSEwAAoqsAANMTAACjqwAA1BMAAKSrAADVEwAApasAANYTAACmqwAA1xMAAKerAADYEwAAqKsAANkTAACpqwAA2hMAAKqrAADbEwAAq6sAANwTAACsqwAA3RMAAK2rAADeEwAArqsAAN8TAACvqwAA4BMAALCrAADhEwAAsasAAOITAACyqwAA4xMAALOrAADkEwAAtKsAAOUTAAC1qwAA5hMAALarAADnEwAAt6sAAOgTAAC4qwAA6RMAALmrAADqEwAAuqsAAOsTAAC7qwAA7BMAALyrAADtEwAAvasAAO4TAAC+qwAA7xMAAL+rAADwEwAA+BMAAPETAAD5EwAA8hMAAPoTAADzEwAA+xMAAPQTAAD8EwAA9RMAAP0TAACJHAAAihwAAJAcAADQEAAAkRwAANEQAACSHAAA0hAAAJMcAADTEAAAlBwAANQQAACVHAAA1RAAAJYcAADWEAAAlxwAANcQAACYHAAA2BAAAJkcAADZEAAAmhwAANoQAACbHAAA2xAAAJwcAADcEAAAnRwAAN0QAACeHAAA3hAAAJ8cAADfEAAAoBwAAOAQAAChHAAA4RAAAKIcAADiEAAAoxwAAOMQAACkHAAA5BAAAKUcAADlEAAAphwAAOYQAACnHAAA5xAAAKgcAADoEAAAqRwAAOkQAACqHAAA6hAAAKscAADrEAAArBwAAOwQAACtHAAA7RAAAK4cAADuEAAArxwAAO8QAACwHAAA8BAAALEcAADxEAAAshwAAPIQAACzHAAA8xAAALQcAAD0EAAAtRwAAPUQAAC2HAAA9hAAALccAAD3EAAAuBwAAPgQAAC5HAAA+RAAALocAAD6EAAAvRwAAP0QAAC+HAAA/hAAAL8cAAD/EAAAAB4AAAEeAAACHgAAAx4AAAQeAAAFHgAABh4AAAceAAAIHgAACR4AAAoeAAALHgAADB4AAA0eAAAOHgAADx4AABAeAAARHgAAEh4AABMeAAAUHgAAFR4AABYeAAAXHgAAGB4AABkeAAAaHgAAGx4AABweAAAdHgAAHh4AAB8eAAAgHgAAIR4AACIeAAAjHgAAJB4AACUeAAAmHgAAJx4AACgeAAApHgAAKh4AACseAAAsHgAALR4AAC4eAAAvHgAAMB4AADEeAAAyHgAAMx4AADQeAAA1HgAANh4AADceAAA4HgAAOR4AADoeAAA7HgAAPB4AAD0eAAA+HgAAPx4AAEAeAABBHgAAQh4AAEMeAABEHgAARR4AAEYeAABHHgAASB4AAEkeAABKHgAASx4AAEweAABNHgAATh4AAE8eAABQHgAAUR4AAFIeAABTHgAAVB4AAFUeAABWHgAAVx4AAFgeAABZHgAAWh4AAFseAABcHgAAXR4AAF4eAABfHgAAYB4AAGEeAABiHgAAYx4AAGQeAABlHgAAZh4AAGceAABoHgAAaR4AAGoeAABrHgAAbB4AAG0eAABuHgAAbx4AAHAeAABxHgAAch4AAHMeAAB0HgAAdR4AAHYeAAB3HgAAeB4AAHkeAAB6HgAAex4AAHweAAB9HgAAfh4AAH8eAACAHgAAgR4AAIIeAACDHgAAhB4AAIUeAACGHgAAhx4AAIgeAACJHgAAih4AAIseAACMHgAAjR4AAI4eAACPHgAAkB4AAJEeAACSHgAAkx4AAJQeAACVHgAAnh4AAN8AAACgHgAAoR4AAKIeAACjHgAApB4AAKUeAACmHgAApx4AAKgeAACpHgAAqh4AAKseAACsHgAArR4AAK4eAACvHgAAsB4AALEeAACyHgAAsx4AALQeAAC1HgAAth4AALceAAC4HgAAuR4AALoeAAC7HgAAvB4AAL0eAAC+HgAAvx4AAMAeAADBHgAAwh4AAMMeAADEHgAAxR4AAMYeAADHHgAAyB4AAMkeAADKHgAAyx4AAMweAADNHgAAzh4AAM8eAADQHgAA0R4AANIeAADTHgAA1B4AANUeAADWHgAA1x4AANgeAADZHgAA2h4AANseAADcHgAA3R4AAN4eAADfHgAA4B4AAOEeAADiHgAA4x4AAOQeAADlHgAA5h4AAOceAADoHgAA6R4AAOoeAADrHgAA7B4AAO0eAADuHgAA7x4AAPAeAADxHgAA8h4AAPMeAAD0HgAA9R4AAPYeAAD3HgAA+B4AAPkeAAD6HgAA+x4AAPweAAD9HgAA/h4AAP8eAAAIHwAAAB8AAAkfAAABHwAACh8AAAIfAAALHwAAAx8AAAwfAAAEHwAADR8AAAUfAAAOHwAABh8AAA8fAAAHHwAAGB8AABAfAAAZHwAAER8AABofAAASHwAAGx8AABMfAAAcHwAAFB8AAB0fAAAVHwAAKB8AACAfAAApHwAAIR8AACofAAAiHwAAKx8AACMfAAAsHwAAJB8AAC0fAAAlHwAALh8AACYfAAAvHwAAJx8AADgfAAAwHwAAOR8AADEfAAA6HwAAMh8AADsfAAAzHwAAPB8AADQfAAA9HwAANR8AAD4fAAA2HwAAPx8AADcfAABIHwAAQB8AAEkfAABBHwAASh8AAEIfAABLHwAAQx8AAEwfAABEHwAATR8AAEUfAABZHwAAUR8AAFsfAABTHwAAXR8AAFUfAABfHwAAVx8AAGgfAABgHwAAaR8AAGEfAABqHwAAYh8AAGsfAABjHwAAbB8AAGQfAABtHwAAZR8AAG4fAABmHwAAbx8AAGcfAACIHwAAgB8AAIkfAACBHwAAih8AAIIfAACLHwAAgx8AAIwfAACEHwAAjR8AAIUfAACOHwAAhh8AAI8fAACHHwAAmB8AAJAfAACZHwAAkR8AAJofAACSHwAAmx8AAJMfAACcHwAAlB8AAJ0fAACVHwAAnh8AAJYfAACfHwAAlx8AAKgfAACgHwAAqR8AAKEfAACqHwAAoh8AAKsfAACjHwAArB8AAKQfAACtHwAApR8AAK4fAACmHwAArx8AAKcfAAC4HwAAsB8AALkfAACxHwAAuh8AAHAfAAC7HwAAcR8AALwfAACzHwAAyB8AAHIfAADJHwAAcx8AAMofAAB0HwAAyx8AAHUfAADMHwAAwx8AANgfAADQHwAA2R8AANEfAADaHwAAdh8AANsfAAB3HwAA6B8AAOAfAADpHwAA4R8AAOofAAB6HwAA6x8AAHsfAADsHwAA5R8AAPgfAAB4HwAA+R8AAHkfAAD6HwAAfB8AAPsfAAB9HwAA/B8AAPMfAAAmIQAAyQMAACohAABrAAAAKyEAAOUAAAAyIQAATiEAAGAhAABwIQAAYSEAAHEhAABiIQAAciEAAGMhAABzIQAAZCEAAHQhAABlIQAAdSEAAGYhAAB2IQAAZyEAAHchAABoIQAAeCEAAGkhAAB5IQAAaiEAAHohAABrIQAAeyEAAGwhAAB8IQAAbSEAAH0hAABuIQAAfiEAAG8hAAB/IQAAgyEAAIQhAAC2JAAA0CQAALckAADRJAAAuCQAANIkAAC5JAAA0yQAALokAADUJAAAuyQAANUkAAC8JAAA1iQAAL0kAADXJAAAviQAANgkAAC/JAAA2SQAAMAkAADaJAAAwSQAANskAADCJAAA3CQAAMMkAADdJAAAxCQAAN4kAADFJAAA3yQAAMYkAADgJAAAxyQAAOEkAADIJAAA4iQAAMkkAADjJAAAyiQAAOQkAADLJAAA5SQAAMwkAADmJAAAzSQAAOckAADOJAAA6CQAAM8kAADpJAAAACwAADAsAAABLAAAMSwAAAIsAAAyLAAAAywAADMsAAAELAAANCwAAAUsAAA1LAAABiwAADYsAAAHLAAANywAAAgsAAA4LAAACSwAADksAAAKLAAAOiwAAAssAAA7LAAADCwAADwsAAANLAAAPSwAAA4sAAA+LAAADywAAD8sAAAQLAAAQCwAABEsAABBLAAAEiwAAEIsAAATLAAAQywAABQsAABELAAAFSwAAEUsAAAWLAAARiwAABcsAABHLAAAGCwAAEgsAAAZLAAASSwAABosAABKLAAAGywAAEssAAAcLAAATCwAAB0sAABNLAAAHiwAAE4sAAAfLAAATywAACAsAABQLAAAISwAAFEsAAAiLAAAUiwAACMsAABTLAAAJCwAAFQsAAAlLAAAVSwAACYsAABWLAAAJywAAFcsAAAoLAAAWCwAACksAABZLAAAKiwAAFosAAArLAAAWywAACwsAABcLAAALSwAAF0sAAAuLAAAXiwAAC8sAABfLAAAYCwAAGEsAABiLAAAawIAAGMsAAB9HQAAZCwAAH0CAABnLAAAaCwAAGksAABqLAAAaywAAGwsAABtLAAAUQIAAG4sAABxAgAAbywAAFACAABwLAAAUgIAAHIsAABzLAAAdSwAAHYsAAB+LAAAPwIAAH8sAABAAgAAgCwAAIEsAACCLAAAgywAAIQsAACFLAAAhiwAAIcsAACILAAAiSwAAIosAACLLAAAjCwAAI0sAACOLAAAjywAAJAsAACRLAAAkiwAAJMsAACULAAAlSwAAJYsAACXLAAAmCwAAJksAACaLAAAmywAAJwsAACdLAAAniwAAJ8sAACgLAAAoSwAAKIsAACjLAAApCwAAKUsAACmLAAApywAAKgsAACpLAAAqiwAAKssAACsLAAArSwAAK4sAACvLAAAsCwAALEsAACyLAAAsywAALQsAAC1LAAAtiwAALcsAAC4LAAAuSwAALosAAC7LAAAvCwAAL0sAAC+LAAAvywAAMAsAADBLAAAwiwAAMMsAADELAAAxSwAAMYsAADHLAAAyCwAAMksAADKLAAAyywAAMwsAADNLAAAziwAAM8sAADQLAAA0SwAANIsAADTLAAA1CwAANUsAADWLAAA1ywAANgsAADZLAAA2iwAANssAADcLAAA3SwAAN4sAADfLAAA4CwAAOEsAADiLAAA4ywAAOssAADsLAAA7SwAAO4sAADyLAAA8ywAAECmAABBpgAAQqYAAEOmAABEpgAARaYAAEamAABHpgAASKYAAEmmAABKpgAAS6YAAEymAABNpgAATqYAAE+mAABQpgAAUaYAAFKmAABTpgAAVKYAAFWmAABWpgAAV6YAAFimAABZpgAAWqYAAFumAABcpgAAXaYAAF6mAABfpgAAYKYAAGGmAABipgAAY6YAAGSmAABlpgAAZqYAAGemAABopgAAaaYAAGqmAABrpgAAbKYAAG2mAACApgAAgaYAAIKmAACDpgAAhKYAAIWmAACGpgAAh6YAAIimAACJpgAAiqYAAIumAACMpgAAjaYAAI6mAACPpgAAkKYAAJGmAACSpgAAk6YAAJSmAACVpgAAlqYAAJemAACYpgAAmaYAAJqmAACbpgAAIqcAACOnAAAkpwAAJacAACanAAAnpwAAKKcAACmnAAAqpwAAK6cAACynAAAtpwAALqcAAC+nAAAypwAAM6cAADSnAAA1pwAANqcAADenAAA4pwAAOacAADqnAAA7pwAAPKcAAD2nAAA+pwAAP6cAAECnAABBpwAAQqcAAEOnAABEpwAARacAAEanAABHpwAASKcAAEmnAABKpwAAS6cAAEynAABNpwAATqcAAE+nAABQpwAAUacAAFKnAABTpwAAVKcAAFWnAABWpwAAV6cAAFinAABZpwAAWqcAAFunAABcpwAAXacAAF6nAABfpwAAYKcAAGGnAABipwAAY6cAAGSnAABlpwAAZqcAAGenAABopwAAaacAAGqnAABrpwAAbKcAAG2nAABupwAAb6cAAHmnAAB6pwAAe6cAAHynAAB9pwAAeR0AAH6nAAB/pwAAgKcAAIGnAACCpwAAg6cAAISnAACFpwAAhqcAAIenAACLpwAAjKcAAI2nAABlAgAAkKcAAJGnAACSpwAAk6cAAJanAACXpwAAmKcAAJmnAACapwAAm6cAAJynAACdpwAAnqcAAJ+nAACgpwAAoacAAKKnAACjpwAApKcAAKWnAACmpwAAp6cAAKinAACppwAAqqcAAGYCAACrpwAAXAIAAKynAABhAgAAracAAGwCAACupwAAagIAALCnAACeAgAAsacAAIcCAACypwAAnQIAALOnAABTqwAAtKcAALWnAAC2pwAAt6cAALinAAC5pwAAuqcAALunAAC8pwAAvacAAL6nAAC/pwAAwKcAAMGnAADCpwAAw6cAAMSnAACUpwAAxacAAIICAADGpwAAjh0AAMenAADIpwAAyacAAMqnAADLpwAAZAIAAMynAADNpwAA0KcAANGnAADWpwAA16cAANinAADZpwAA2qcAANunAADcpwAAmwEAAPWnAAD2pwAAIf8AAEH/AAAi/wAAQv8AACP/AABD/wAAJP8AAET/AAAl/wAARf8AACb/AABG/wAAJ/8AAEf/AAAo/wAASP8AACn/AABJ/wAAKv8AAEr/AAAr/wAAS/8AACz/AABM/wAALf8AAE3/AAAu/wAATv8AAC//AABP/wAAMP8AAFD/AAAx/wAAUf8AADL/AABS/wAAM/8AAFP/AAA0/wAAVP8AADX/AABV/wAANv8AAFb/AAA3/wAAV/8AADj/AABY/wAAOf8AAFn/AAA6/wAAWv8AAAAEAQAoBAEAAQQBACkEAQACBAEAKgQBAAMEAQArBAEABAQBACwEAQAFBAEALQQBAAYEAQAuBAEABwQBAC8EAQAIBAEAMAQBAAkEAQAxBAEACgQBADIEAQALBAEAMwQBAAwEAQA0BAEADQQBADUEAQAOBAEANgQBAA8EAQA3BAEAEAQBADgEAQARBAEAOQQBABIEAQA6BAEAEwQBADsEAQAUBAEAPAQBABUEAQA9BAEAFgQBAD4EAQAXBAEAPwQBABgEAQBABAEAGQQBAEEEAQAaBAEAQgQBABsEAQBDBAEAHAQBAEQEAQAdBAEARQQBAB4EAQBGBAEAHwQBAEcEAQAgBAEASAQBACEEAQBJBAEAIgQBAEoEAQAjBAEASwQBACQEAQBMBAEAJQQBAE0EAQAmBAEATgQBACcEAQBPBAEAsAQBANgEAQCxBAEA2QQBALIEAQDaBAEAswQBANsEAQC0BAEA3AQBALUEAQDdBAEAtgQBAN4EAQC3BAEA3wQBALgEAQDgBAEAuQQBAOEEAQC6BAEA4gQBALsEAQDjBAEAvAQBAOQEAQC9BAEA5QQBAL4EAQDmBAEAvwQBAOcEAQDABAEA6AQBAMEEAQDpBAEAwgQBAOoEAQDDBAEA6wQBAMQEAQDsBAEAxQQBAO0EAQDGBAEA7gQBAMcEAQDvBAEAyAQBAPAEAQDJBAEA8QQBAMoEAQDyBAEAywQBAPMEAQDMBAEA9AQBAM0EAQD1BAEAzgQBAPYEAQDPBAEA9wQBANAEAQD4BAEA0QQBAPkEAQDSBAEA+gQBANMEAQD7BAEAcAUBAJcFAQBxBQEAmAUBAHIFAQCZBQEAcwUBAJoFAQB0BQEAmwUBAHUFAQCcBQEAdgUBAJ0FAQB3BQEAngUBAHgFAQCfBQEAeQUBAKAFAQB6BQEAoQUBAHwFAQCjBQEAfQUBAKQFAQB+BQEApQUBAH8FAQCmBQEAgAUBAKcFAQCBBQEAqAUBAIIFAQCpBQEAgwUBAKoFAQCEBQEAqwUBAIUFAQCsBQEAhgUBAK0FAQCHBQEArgUBAIgFAQCvBQEAiQUBALAFAQCKBQEAsQUBAIwFAQCzBQEAjQUBALQFAQCOBQEAtQUBAI8FAQC2BQEAkAUBALcFAQCRBQEAuAUBAJIFAQC5BQEAlAUBALsFAQCVBQEAvAUBAIAMAQDADAEAgQwBAMEMAQCCDAEAwgwBAIMMAQDDDAEAhAwBAMQMAQCFDAEAxQwBAIYMAQDGDAEAhwwBAMcMAQCIDAEAyAwBAIkMAQDJDAEAigwBAMoMAQCLDAEAywwBAIwMAQDMDAEAjQwBAM0MAQCODAEAzgwBAI8MAQDPDAEAkAwBANAMAQCRDAEA0QwBAJIMAQDSDAEAkwwBANMMAQCUDAEA1AwBAJUMAQDVDAEAlgwBANYMAQCXDAEA1wwBAJgMAQDYDAEAmQwBANkMAQCaDAEA2gwBAJsMAQDbDAEAnAwBANwMAQCdDAEA3QwBAJ4MAQDeDAEAnwwBAN8MAQCgDAEA4AwBAKEMAQDhDAEAogwBAOIMAQCjDAEA4wwBAKQMAQDkDAEApQwBAOUMAQCmDAEA5gwBAKcMAQDnDAEAqAwBAOgMAQCpDAEA6QwBAKoMAQDqDAEAqwwBAOsMAQCsDAEA7AwBAK0MAQDtDAEArgwBAO4MAQCvDAEA7wwBALAMAQDwDAEAsQwBAPEMAQCyDAEA8gwBAFANAQBwDQEAUQ0BAHENAQBSDQEAcg0BAFMNAQBzDQEAVA0BAHQNAQBVDQEAdQ0BAFYNAQB2DQEAVw0BAHcNAQBYDQEAeA0BAFkNAQB5DQEAWg0BAHoNAQBbDQEAew0BAFwNAQB8DQEAXQ0BAH0NAQBeDQEAfg0BAF8NAQB/DQEAYA0BAIANAQBhDQEAgQ0BAGINAQCCDQEAYw0BAIMNAQBkDQEAhA0BAGUNAQCFDQEAoBgBAMAYAQChGAEAwRgBAKIYAQDCGAEAoxgBAMMYAQCkGAEAxBgBAKUYAQDFGAEAphgBAMYYAQCnGAEAxxgBAKgYAQDIGAEAqRgBAMkYAQCqGAEAyhgBAKsYAQDLGAEArBgBAMwYAQCtGAEAzRgBAK4YAQDOGAEArxgBAM8YAQCwGAEA0BgBALEYAQDRGAEAshgBANIYAQCzGAEA0xgB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BgYCBwYIBwkRChwLGQwaDRAODA8EEAMSEhMJFgEXBBgBGQMaBxsBHAIfFiADKwMtCy4BMAQxAjIBpwSpAqoEqwj6AvsF/QL+A/8JrXh5i42iMFdYi4yQHN0OD0tM+/wuLz9cXV/ihI2OkZKpsbq7xcbJyt7k5f8ABBESKTE0Nzo7PUlKXYSOkqmxtLq7xsrOz+TlAAQNDhESKTE0OjtFRklKXmRlhJGbncnOzw0RKTo7RUlXW1xeX2RljZGptLq7xcnf5OXwDRFFSWRlgISyvL6/1dfw8YOFi6Smvr/Fx8/a20iYvc3Gzs9JTk9XWV5fiY6Psba3v8HGx9cRFhdbXPb3/v+AbXHe3w4fbm8cHV99fq6vTbu8FhceH0ZHTk9YWlxefn+1xdTV3PDx9XJzj3R1liYuL6evt7/Hz9ffmgBAl5gwjx/Oz9LUzv9OT1pbBwgPECcv7u9ubzc9P0JFkJFTZ3XIydDR2Nnn/v8AIF8igt8EgkQIGwQGEYGsDoCrBR8IgRwDGQgBBC8ENAQHAwEHBgcRClAPEgdVBwMEHAoJAwgDBwMCAwMDDAQFAwsGAQ4VBU4HGwdXBwIGFwxQBEMDLQMBBBEGDww6BB0lXyBtBGolgMgFgrADGgaC/QNZBxYJGAkUDBQMagYKBhoGWQcrBUYKLAQMBAEDMQssBBoGCwOArAYKBi8xgPQIPAMPAz4FOAgrBYL/ERgILxEtAyEPIQ+AjASCmhYLFYiUBS8FOwcCDhgJgL4idAyA1hqBEAWA4QnyngM3CYFcFIC4CIDdFTsDCgY4CEYIDAZ0Cx4DWgRZCYCDGBwKFglMBICKBqukDBcEMaEEgdomBwwFBYCmEIH1BwEgKgZMBICNBIC+AxsDDw0AAAD+AxAAJQAAABoAAAA2AAAA/gMQACUAAAAKAAAAKwAAAGF0dGVtcHQgdG8gZGl2aWRlIGJ5IHplcm8AAAC0YRAAGQAAAAAAAAAEAAAABAAAAGkAAABpbmRleCBvdXQgb2YgYm91bmRzOiB0aGUgbGVuIGlzICBidXQgdGhlIGluZGV4IGlzIAAA6GEQACAAAAAIYhAAEgAAAD09IT1tYXRjaGVzYXNzZXJ0aW9uIGBsZWZ0ICByaWdodGAgZmFpbGVkCiAgbGVmdDogCiByaWdodDogADdiEAAQAAAAR2IQABcAAABeYhAACQAAACByaWdodGAgZmFpbGVkOiAKICBsZWZ0OiAAAAA3YhAAEAAAAIBiEAAQAAAAkGIQAAkAAABeYhAACQAAAFJlZkNlbGwgYWxyZWFkeSBtdXRhYmx5IGJvcnJvd2VkLi5SZWZDZWxsIGFscmVhZHkgYm9ycm93ZWQAACxiEAAuYhAAMGIQAAIAAAACAAAABwBBkMbBAAspAgAAAD8AAAACAAAAQAAAAAIAAABBAAAAAgAAAEIAAAAAAAAAQwAAAEkAQcTGwQALAQQAfAlwcm9kdWNlcnMCCGxhbmd1YWdlAQRSdXN0AAxwcm9jZXNzZWQtYnkDBXJ1c3RjHTEuOTEuMSAoZWQ2MWU3ZDdlIDIwMjUtMTEtMDcpBndhbHJ1cwYwLjI3LjMMd2FzbS1iaW5kZ2VuEzAuMi4xMzAgKGM5M2I4YWU4NCkAaw90YXJnZXRfZmVhdHVyZXMGKw9tdXRhYmxlLWdsb2JhbHMrE25vbnRyYXBwaW5nLWZwdG9pbnQrC2J1bGstbWVtb3J5KwhzaWduLWV4dCsPcmVmZXJlbmNlLXR5cGVzKwptdWx0aXZhbHVl";

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
        cryptoManager = new exports.CryptoManager(encryptionKey);
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
          const pathParts = path.split("/").filter(Boolean);
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
          const pathParts = path.split("/").filter(Boolean);
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
          const pathParts = path.split("/").filter(Boolean);
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
        const pathParts = path.split("/").filter(Boolean);
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
          const pathParts = path.split("/").filter(Boolean);
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
          const pathParts = path.split("/").filter(Boolean);
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
  function define({ tag, component: CustomFunctionalComponent }) {
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
          result = CustomFunctionalComponent(componentProps, sharedDependencies);
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
    return CustomFunctionalComponent;
  }
  initRuntime(define);

  // src/wasm/index.ts
  init_crypto_manager();

  exports.AsyncronousStateManager = async_manager_default;
  exports.DimElement = DimElement;
  exports.StorageManager = storage_manager_default;
  exports.css = css;
  exports.debouncedDispatcher = debouncedDispatcher;
  exports.define = define;
  exports.html = html2;
  exports.keyed = keyed2;
  exports.renderChildren = renderChildren2;
  exports.unsafeCSS = unsafeCSS;
  exports.unsafeHTML = unsafeHTML2;
  exports.useEffect = useEffect2;
  exports.useFS = useFS;
  exports.useLazyScope = useLazyScope;
  exports.useMemo = useMemo2;
  exports.useRef = useRef2;
  exports.useScope = useScope2;
  exports.useState = useState2;
  exports.useStore = useStore;
  exports.useStyle = useStyle2;
  exports.useViewTransition = useViewTransition;
  exports.viewTransitionStyles = viewTransitionStyles;

  return exports;

})({});
//# sourceMappingURL=dim.global.js.map
//# sourceMappingURL=dim.global.js.map
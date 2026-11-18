/**
 * DimTest — tiny classic-script harness for uncompiled Dim apps.
 *
 * Can load before window.Dim so a splash appears during boot. Does not
 * modify Dim. Exposes window.DimTest and writes window.__DIM_TEST__ after run().
 *
 * Chrome owned here: toolbar (JS/WASM reload toggle, Rerun, impl label),
 * splash, report + optional coverage.
 *
 * Optional live line coverage (when DimTest.cover.register is used by a
 * test-only instrumenter): window.__DIM_COV__ + Coverage block in the report.
 *
 * Optional iframe AUT driver: DimTest.open(url) fetches the page (default
 * srcdoc + isolation: IDB suffix, localStorage wrap, SW register no-op),
 * then returns a page object with shadow-piercing query/click/fill/wait.
 *
 *   <script src=".../dim.test.global.js"></script>
 *   <script> DimTest.splash("Loading Dim…"); </script>
 *   <script src=".../dim.global.js"></script>
 *   …
 *   DimTest.run();
 */
(function (global) {
  "use strict";

  var suite = [];
  var fixtureRoot = null;
  var styleInjected = false;
  var shellBuilt = false;
  var runInFlight = false;
  var splashVisible = false;
  /** @type {Array<{ close: function(): void }>} */
  var openPages = [];
  var pageSeq = 0;
  /** @type {Record<string, { lines: number[], hits: Record<number, number> }>} */
  var coverFiles = {};
  /** @type {Record<string, boolean>} */
  var coverExpanded = {};
  /** @type {Record<string, boolean>} */
  var testExpanded = {};

  function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== typeof b) return false;
    if (a === null || b === null) return a === b;
    if (typeof a !== "object") return false;
    if (Array.isArray(a) !== Array.isArray(b)) return false;
    if (Array.isArray(a)) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) {
        if (!deepEqual(a[i], b[i])) return false;
      }
      return true;
    }
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (var j = 0; j < aKeys.length; j++) {
      var key = aKeys[j];
      if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  function formatValue(value) {
    try {
      return typeof value === "string" ? JSON.stringify(value) : String(value);
    } catch (e) {
      return String(value);
    }
  }

  function fail(message) {
    var err = new Error(message);
    err.name = "AssertionError";
    throw err;
  }

  function expect(actual) {
    return {
      toBe: function (expected) {
        if (!Object.is(actual, expected)) {
          fail(
            "Expected " +
              formatValue(actual) +
              " to be " +
              formatValue(expected),
          );
        }
      },
      toEqual: function (expected) {
        if (!deepEqual(actual, expected)) {
          fail(
            "Expected " +
              formatValue(actual) +
              " to equal " +
              formatValue(expected),
          );
        }
      },
      toBeTruthy: function () {
        if (!actual) {
          fail("Expected " + formatValue(actual) + " to be truthy");
        }
      },
      toContain: function (substring) {
        var haystack = actual == null ? "" : String(actual);
        if (haystack.indexOf(substring) === -1) {
          fail(
            "Expected " +
              formatValue(haystack) +
              " to contain " +
              formatValue(substring),
          );
        }
      },
      toBeGreaterThan: function (n) {
        if (!(actual > n)) {
          fail(
            "Expected " +
              formatValue(actual) +
              " to be greater than " +
              formatValue(n),
          );
        }
      },
    };
  }

  function getFixtureRoot() {
    if (fixtureRoot && fixtureRoot.isConnected) return fixtureRoot;
    fixtureRoot = document.getElementById("dim-test-root");
    if (!fixtureRoot) {
      fixtureRoot = document.createElement("div");
      fixtureRoot.id = "dim-test-root";
      fixtureRoot.setAttribute("hidden", "");
      document.body.appendChild(fixtureRoot);
    }
    return fixtureRoot;
  }

  function closeAllPages() {
    while (openPages.length) {
      var page = openPages.pop();
      try {
        if (page && typeof page.close === "function") page.close();
      } catch (e) {}
    }
  }

  function clearFixture() {
    closeAllPages();
    var root = getFixtureRoot();
    root.innerHTML = "";
  }

  function mount(tag, props) {
    clearFixture();
    var el = document.createElement(tag);
    if (props !== undefined) {
      el.props = props;
    }
    getFixtureRoot().appendChild(el);
    var wait =
      el.updateComplete && typeof el.updateComplete.then === "function"
        ? el.updateComplete
        : Promise.resolve();
    return wait.then(function () {
      return el;
    });
  }

  function shadowText(el) {
    var root = el && el.shadowRoot;
    var text = root ? root.textContent || "" : "";
    return text.replace(/\s+/g, " ").trim();
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function isElement(value) {
    return !!(value && value.nodeType === 1);
  }

  function collectDeep(root, selector, out) {
    if (!root) return;
    var nodes;
    try {
      nodes = root.querySelectorAll(selector);
    } catch (e) {
      return;
    }
    for (var i = 0; i < nodes.length; i++) {
      out.push(nodes[i]);
    }
    var all;
    try {
      all = root.querySelectorAll("*");
    } catch (e2) {
      return;
    }
    for (var j = 0; j < all.length; j++) {
      var host = all[j];
      if (host.shadowRoot) collectDeep(host.shadowRoot, selector, out);
    }
  }

  function pierceAll(doc, selector) {
    var out = [];
    if (!doc) return out;
    collectDeep(doc, selector, out);
    return out;
  }

  function pierceOne(doc, selector, index) {
    var all = pierceAll(doc, selector);
    var i = index == null ? 0 : index;
    return all[i] || null;
  }

  function resolveEl(doc, selectorOrEl, opts) {
    if (isElement(selectorOrEl)) return selectorOrEl;
    var index = opts && opts.index != null ? opts.index : 0;
    return pierceOne(doc, String(selectorOrEl || ""), index);
  }

  function deepText(el) {
    if (!el) return "";
    var parts = [];
    function walk(node) {
      if (!node) return;
      // 3 = text, 1 = element, 11 = document fragment / ShadowRoot
      if (node.nodeType === 3) {
        parts.push(node.textContent || "");
        return;
      }
      if (node.nodeType !== 1 && node.nodeType !== 11) return;
      if (node.nodeType === 1) {
        var tag = (node.tagName || "").toUpperCase();
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return;
      }
      if (node.shadowRoot) walk(node.shadowRoot);
      var kids = node.childNodes;
      for (var i = 0; i < kids.length; i++) walk(kids[i]);
    }
    walk(el);
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  function clickHost(el) {
    if (!el) throw new Error("DimTest.page.click: element missing");
    var btn =
      (el.shadowRoot && el.shadowRoot.querySelector("button")) || el;
    btn.click();
  }

  function fillHost(el, value) {
    if (!el) throw new Error("DimTest.page.fill: element missing");
    var input =
      (el.shadowRoot && el.shadowRoot.querySelector("input, textarea")) ||
      (el.matches && el.matches("input, textarea") ? el : null) ||
      (el.querySelector && el.querySelector("input, textarea"));
    if (!input) throw new Error("DimTest.page.fill: input/textarea missing");
    input.value = value == null ? "" : String(value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function flushEl(el) {
    if (!el) return Promise.resolve();
    function once() {
      if (el.updateComplete && typeof el.updateComplete.then === "function") {
        return el.updateComplete;
      }
      return Promise.resolve();
    }
    return once()
      .then(function () {
        return sleep(0);
      })
      .then(once)
      .then(function () {
        return new Promise(function (resolve) {
          requestAnimationFrame(function () {
            requestAnimationFrame(resolve);
          });
        });
      });
  }

  function flushTree(el) {
    var chain = flushEl(el);
    try {
      var root = el && el.getRootNode && el.getRootNode();
      if (root && root.host) {
        chain = chain.then(function () {
          return flushTree(root.host);
        });
      }
    } catch (e) {}
    return chain;
  }

  function isolationBootstrap(runId, seed) {
    var seedJson = JSON.stringify(seed || {});
    return (
      "(function(){" +
      "var RUN=" +
      JSON.stringify(String(runId || "0")) +
      ";" +
      "var SEED=" +
      seedJson +
      ";" +
      "var LIVE='DimDatabase';" +
      "var PREFIX='__dimtest_'+RUN+'_';" +
      "try{" +
      "var origOpen=indexedDB.open.bind(indexedDB);" +
      "indexedDB.open=function(name,version){" +
      "var next=name;" +
      "if(name===LIVE)next=LIVE+'_e2e_'+RUN;" +
      "else if(name&&String(name).indexOf('_e2e_')<0)next=String(name)+'_e2e_'+RUN;" +
      "return origOpen(next,version);" +
      "};" +
      "}catch(e){}" +
      "try{" +
      "var store=window.localStorage;" +
      "var wrap={" +
      "getItem:function(k){return store.getItem(PREFIX+k);}," +
      "setItem:function(k,v){store.setItem(PREFIX+k,v);}," +
      "removeItem:function(k){store.removeItem(PREFIX+k);}," +
      "clear:function(){" +
      "var keys=[];" +
      "for(var i=0;i<store.length;i++){var key=store.key(i);if(key&&key.indexOf(PREFIX)===0)keys.push(key);}" +
      "for(var j=0;j<keys.length;j++)store.removeItem(keys[j]);" +
      "}," +
      "key:function(i){var n=0;for(var i2=0;i2<store.length;i2++){var key=store.key(i2);if(key&&key.indexOf(PREFIX)===0){if(n===i)return key.slice(PREFIX.length);n++;}}return null;}," +
      "get length(){var n=0;for(var i=0;i<store.length;i++){var key=store.key(i);if(key&&key.indexOf(PREFIX)===0)n++;}return n;}" +
      "};" +
      "try{Object.defineProperty(window,'localStorage',{configurable:true,get:function(){return wrap;}});}catch(e2){window.localStorage=wrap;}" +
      "try{var sk;for(sk in SEED){if(Object.prototype.hasOwnProperty.call(SEED,sk)&&SEED[sk]!=null)wrap.setItem(sk,String(SEED[sk]));}}catch(eSeed){}" +
      "}catch(e3){}" +
      "try{" +
      "if(navigator.serviceWorker){" +
      "navigator.serviceWorker.register=function(){return Promise.resolve({unregister:function(){return Promise.resolve(true);}});};" +
      "}" +
      "}catch(e4){}" +
      "})();"
    );
  }

  function injectIsolation(html, baseHref, runId, seed) {
    var baseTag = '<base href="' + String(baseHref).replace(/"/g, "&quot;") + '">';
    var boot =
      "<script>" + isolationBootstrap(runId, seed) + "<\/script>";
    var inject = baseTag + boot;
    if (/<head[^>]*>/i.test(html)) {
      return html.replace(/<head[^>]*>/i, function (m) {
        return m + inject;
      });
    }
    if (/<html[^>]*>/i.test(html)) {
      return html.replace(/<html[^>]*>/i, function (m) {
        return m + "<head>" + inject + "</head>";
      });
    }
    return "<!DOCTYPE html><html><head>" + inject + "</head><body>" + html + "</body></html>";
  }

  function makePage(iframe) {
    var closed = false;

    function doc() {
      return iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document);
    }

    function win() {
      return iframe.contentWindow;
    }

    function ensureOpen() {
      if (closed) throw new Error("DimTest.page: iframe already closed");
      var d = doc();
      if (!d) throw new Error("DimTest.page: contentDocument unavailable");
      return d;
    }

    function query(selector, opts) {
      return resolveEl(ensureOpen(), selector, opts || {});
    }

    function queryAll(selector) {
      return pierceAll(ensureOpen(), selector);
    }

    function click(selectorOrEl, opts) {
      var el = resolveEl(ensureOpen(), selectorOrEl, opts || {});
      return flushTree(el).then(function () {
        clickHost(el);
        return flushTree(el);
      });
    }

    function fill(selectorOrEl, value, opts) {
      var el = resolveEl(ensureOpen(), selectorOrEl, opts || {});
      fillHost(el, value);
      // Dim setState is async — flush so subsequent click sees new values.
      return flushTree(el);
    }

    function text(selectorOrEl, opts) {
      if (selectorOrEl == null) {
        return deepText(ensureOpen().body || ensureOpen().documentElement);
      }
      var el = resolveEl(ensureOpen(), selectorOrEl, opts || {});
      return deepText(el);
    }

    function wait(selectorOrFn, timeoutMs) {
      var timeout = timeoutMs || 20000;
      var start = Date.now();
      function tick() {
        if (closed) {
          return Promise.reject(new Error("DimTest.page.wait: iframe closed"));
        }
        var d = doc();
        var value;
        try {
          if (typeof selectorOrFn === "function") {
            value = selectorOrFn(d, win());
          } else {
            value = pierceOne(d, String(selectorOrFn || ""), 0);
          }
        } catch (e) {
          value = null;
        }
        if (value) return Promise.resolve(value);
        if (Date.now() - start >= timeout) {
          var label =
            typeof selectorOrFn === "function"
              ? "condition"
              : String(selectorOrFn || "condition");
          return Promise.reject(
            new Error("DimTest.page.wait: timeout waiting for " + label),
          );
        }
        return sleep(50).then(tick);
      }
      return tick();
    }

    function close() {
      if (closed) return;
      closed = true;
      var idx = openPages.indexOf(page);
      if (idx >= 0) openPages.splice(idx, 1);
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }

    var page = {
      iframe: iframe,
      get window() {
        return win();
      },
      get document() {
        return doc();
      },
      query: query,
      queryAll: queryAll,
      click: click,
      fill: fill,
      text: text,
      wait: wait,
      close: close,
    };
    openPages.push(page);
    return page;
  }

  function open(url, opts) {
    opts = opts || {};
    var timeout = opts.timeout || 30000;
    var ready = opts.ready || "body";
    var visible = !!opts.visible;
    var mode = opts.mode || "srcdoc";
    pageSeq += 1;
    var runId =
      Date.now().toString(36) +
      "_" +
      pageSeq +
      "_" +
      Math.random().toString(36).slice(2, 8);

    var iframe = document.createElement("iframe");
    iframe.setAttribute("title", "DimTest page");
    iframe.setAttribute("data-dim-test-page", runId);
    if (visible) {
      iframe.style.cssText =
        "display:block;width:min(100%,420px);height:640px;border:1px solid #cbd5e1;border-radius:8px;margin:1rem auto;background:#fff;";
      var stage = document.getElementById("dim-test-stage");
      if (stage) stage.appendChild(iframe);
      else document.body.appendChild(iframe);
    } else {
      iframe.setAttribute("hidden", "");
      iframe.style.cssText =
        "position:absolute;left:-9999px;width:320px;height:480px;border:0;";
      getFixtureRoot().appendChild(iframe);
    }

    var absolute = new URL(url, location.href);
    var baseHref = absolute.href.replace(/[^/]*$/, "");
    var seed = opts.seed || {};
    try {
      if (seed["dim-boilerplate-impl"] == null) {
        var impl =
          (document.documentElement &&
            document.documentElement.dataset &&
            document.documentElement.dataset.dimRuntime) ||
          "";
        if (!impl) {
          try {
            impl = localStorage.getItem("dim-boilerplate-impl") || "";
          } catch (eLs) {}
        }
        if (impl === "js" || impl === "wasm") {
          seed["dim-boilerplate-impl"] = impl;
        }
      }
    } catch (eSeed) {}

    function waitReady(page) {
      return page.wait(ready, timeout).then(function () {
        return page;
      });
    }

    if (mode === "src") {
      iframe.src = absolute.href;
      var pageSrc = makePage(iframe);
      return waitReady(pageSrc);
    }

    return fetch(absolute.href)
      .then(function (res) {
        if (!res.ok) {
          throw new Error(
            "DimTest.open: failed to fetch " + absolute.href + " (" + res.status + ")",
          );
        }
        return res.text();
      })
      .then(function (html) {
        iframe.srcdoc = injectIsolation(html, baseHref, runId, seed);
        var page = makePage(iframe);
        return waitReady(page);
      });
  }

  function scriptPathFromCurrent() {
    try {
      var script = document.currentScript;
      if (!script || !script.src) return "(inline)";
      var srcUrl = new URL(script.src, location.href);
      var pageDir = location.pathname.replace(/[^/]*$/, "");
      if (srcUrl.pathname.indexOf(pageDir) === 0) {
        return srcUrl.pathname.slice(pageDir.length) || "(inline)";
      }
      return srcUrl.pathname.replace(/^\//, "") || "(inline)";
    } catch (e) {
      return "(inline)";
    }
  }

  function test(name, fn) {
    suite.push({ name: name, fn: fn, file: scriptPathFromCurrent() });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function basename(path) {
    var parts = String(path || "").split("/");
    return parts[parts.length - 1] || path || "";
  }

  function createTreeRoot() {
    return { kind: "dir", name: "", path: "", children: {} };
  }

  function ensureDir(node, name, path) {
    if (!node.children[name]) {
      node.children[name] = {
        kind: "dir",
        name: name,
        path: path,
        children: {},
      };
    }
    return node.children[name];
  }

  function ensureFile(node, name, path) {
    if (!node.children[name] || node.children[name].kind !== "file") {
      node.children[name] = {
        kind: "file",
        name: name,
        path: path,
        children: {},
      };
    }
    return node.children[name];
  }

  function sortedChildren(node) {
    var dirs = [];
    var files = [];
    var other = [];
    var keys = Object.keys(node.children || {});
    for (var i = 0; i < keys.length; i++) {
      var child = node.children[keys[i]];
      if (child.kind === "dir") dirs.push(child);
      else if (child.kind === "file") files.push(child);
      else other.push(child);
    }
    function byName(a, b) {
      return String(a.name).localeCompare(String(b.name));
    }
    dirs.sort(byName);
    files.sort(byName);
    other.sort(byName);
    return dirs.concat(files, other);
  }

  function insertPathLeaf(root, path, leaf) {
    var parts = String(path || "")
      .split("/")
      .filter(function (p) {
        return p !== "";
      });
    if (!parts.length) {
      root.children[leaf.name || "(file)"] = leaf;
      return;
    }
    var node = root;
    var accum = [];
    for (var i = 0; i < parts.length - 1; i++) {
      accum.push(parts[i]);
      node = ensureDir(node, parts[i], accum.join("/"));
    }
    var fileName = parts[parts.length - 1];
    leaf.kind = leaf.kind || "file";
    leaf.name = leaf.name || fileName;
    leaf.path = leaf.path || path;
    if (!leaf.children) leaf.children = {};
    node.children[fileName] = leaf;
  }

  function isExpanded(map, path, defaultExpanded) {
    if (Object.prototype.hasOwnProperty.call(map, path)) {
      return Boolean(map[path]);
    }
    return Boolean(defaultExpanded);
  }

  function uniqueSortedLines(lines) {
    var seen = {};
    var out = [];
    for (var i = 0; i < lines.length; i++) {
      var n = Number(lines[i]);
      if (!n || seen[n]) continue;
      seen[n] = true;
      out.push(n);
    }
    out.sort(function (a, b) {
      return a - b;
    });
    return out;
  }

  function compactLineRanges(lines) {
    if (!lines || !lines.length) return "";
    var parts = [];
    var start = lines[0];
    var prev = lines[0];
    for (var i = 1; i <= lines.length; i++) {
      var cur = lines[i];
      if (cur === prev + 1) {
        prev = cur;
        continue;
      }
      parts.push(start === prev ? String(start) : start + "–" + prev);
      start = cur;
      prev = cur;
    }
    return parts.join(", ");
  }

  function coverRegister(file, executableLines) {
    var lines = uniqueSortedLines(executableLines || []);
    if (!lines.length) return;
    var existing = coverFiles[file];
    if (existing) {
      var merged = existing.lines.concat(lines);
      existing.lines = uniqueSortedLines(merged);
      return;
    }
    coverFiles[file] = { lines: lines, hits: {} };
  }

  function coverHit(file, line) {
    var entry = coverFiles[file];
    if (!entry) {
      coverFiles[file] = { lines: [line], hits: {} };
      entry = coverFiles[file];
    }
    var n = Number(line);
    if (!n) return;
    entry.hits[n] = (entry.hits[n] || 0) + 1;
  }

  function coverResetHits() {
    var paths = Object.keys(coverFiles);
    for (var i = 0; i < paths.length; i++) {
      coverFiles[paths[i]].hits = {};
    }
  }

  function coverSummary() {
    var files = [];
    var hit = 0;
    var total = 0;
    var paths = Object.keys(coverFiles).sort();
    for (var i = 0; i < paths.length; i++) {
      var path = paths[i];
      var entry = coverFiles[path];
      var fileHit = 0;
      var uncovered = [];
      for (var j = 0; j < entry.lines.length; j++) {
        var ln = entry.lines[j];
        if (entry.hits[ln]) fileHit += 1;
        else uncovered.push(ln);
      }
      var fileTotal = entry.lines.length;
      if (!fileTotal) continue;
      hit += fileHit;
      total += fileTotal;
      files.push({
        path: path,
        hit: fileHit,
        total: fileTotal,
        pct: Math.round((fileHit / fileTotal) * 100),
        uncovered: uncovered,
      });
    }
    return {
      files: files,
      hit: hit,
      total: total,
      pct: total ? Math.round((hit / total) * 100) : 0,
    };
  }

  function currentImpl() {
    var fromDom =
      document.documentElement && document.documentElement.dataset
        ? document.documentElement.dataset.dimRuntime
        : "";
    if (fromDom === "js" || fromDom === "wasm") return fromDom;
    try {
      var q = new URLSearchParams(location.search || "").get("impl") || "";
      q = String(q).toLowerCase();
      if (q === "js" || q === "wasm") return q;
    } catch (e) {}
    return "js";
  }

  function setImpl(next) {
    if (next !== "js" && next !== "wasm") return;
    try {
      var url = new URL(location.href);
      url.searchParams.set("impl", next);
      location.href = url.toString();
    } catch (e) {
      location.search = "?impl=" + next;
    }
  }

  function ensureStyles() {
    if (styleInjected) return;
    styleInjected = true;
    var style = document.createElement("style");
    style.id = "dim-test-styles";
    style.textContent =
      "@keyframes dim-test-spin{to{transform:rotate(360deg)}}" +
      "@keyframes dim-test-pulse{0%,100%{opacity:1}50%{opacity:.45}}" +
      "@keyframes dim-test-in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}" +
      "@keyframes dim-test-bar{from{background-position:0 0}to{background-position:40px 0}}" +
      "@keyframes dim-test-pop{0%{transform:scale(.85);opacity:0}70%{transform:scale(1.06)}100%{transform:scale(1);opacity:1}}" +
      "@keyframes dim-test-splash-glow{0%,100%{box-shadow:0 0 0 0 rgba(2,156,253,.25)}50%{box-shadow:0 0 0 12px rgba(2,156,253,0)}}" +
      "html,body{margin:0;min-height:100%}" +
      "#dim-test-shell{font-family:system-ui,sans-serif;min-height:100vh;display:flex;flex-direction:column;background:#e2e8f0;color:#0f172a}" +
      "#dim-test-shell .dim-test-bar{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem .65rem;padding:.75rem 1.1rem;background:#0f172a;color:#e2e8f0;box-shadow:0 1px 0 rgba(15,23,42,.2)}" +
      "#dim-test-shell .dim-test-bar-title{font-weight:650;letter-spacing:-.02em;margin-right:.35rem}" +
      "#dim-test-shell .dim-test-bar-meta{color:#94a3b8;font-size:.88rem;margin-right:auto}" +
      "#dim-test-shell .dim-test-bar button{font:inherit;font-size:.88rem;padding:.35rem .7rem;border-radius:7px;border:1px solid #334155;background:#1e293b;color:#e2e8f0;cursor:pointer}" +
      "#dim-test-shell .dim-test-bar button:hover:not(:disabled){background:#334155}" +
      "#dim-test-shell .dim-test-bar button.active{background:#029cfd;border-color:#029cfd;color:#fff}" +
      "#dim-test-shell .dim-test-bar button:disabled{opacity:.45;cursor:not-allowed}" +
      "#dim-test-stage{flex:1;display:flex;flex-direction:column;min-height:0}" +
      "#dim-test-report{font-family:system-ui,sans-serif;max-width:56rem;width:100%;margin:1.5rem auto;padding:1.25rem 1.35rem;box-sizing:border-box;color:#0f172a;background:#f8fafc;border-radius:12px;box-shadow:0 1px 2px rgba(15,23,42,.06),0 8px 24px rgba(15,23,42,.06);animation:dim-test-in .35s ease both}" +
      "#dim-test-report h1{margin:0 0 .35rem;font-size:1.35rem;letter-spacing:-.02em}" +
      "#dim-test-report h2{margin:1.25rem 0 .5rem;font-size:1.05rem;letter-spacing:-.01em}" +
      "#dim-test-report .dim-test-meta{margin:0 0 1rem;color:#64748b;font-size:.95rem}" +
      "#dim-test-report .dim-test-meta strong{color:#0f172a}" +
      "#dim-test-report .dim-test-progress{height:8px;border-radius:999px;background:#e2e8f0;overflow:hidden;margin:0 0 1.1rem}" +
      "#dim-test-report .dim-test-progress > span{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#029cfd,#38bdf8,#029cfd);background-size:40px 100%;transition:width .35s cubic-bezier(.22,1,.36,1)}" +
      "#dim-test-report.dim-test-running .dim-test-progress > span{animation:dim-test-bar .7s linear infinite}" +
      "#dim-test-report.dim-test-done-ok .dim-test-progress > span{background:#16a34a;animation:none}" +
      "#dim-test-report.dim-test-done-fail .dim-test-progress > span{background:#dc2626;animation:none}" +
      "#dim-test-report .dim-test-status{display:flex;align-items:center;gap:.55rem;min-height:1.4rem;margin:0 0 .85rem;font-size:.92rem;color:#475569}" +
      "#dim-test-report .dim-test-spinner,#dim-test-splash .dim-test-spinner{width:.85rem;height:.85rem;border:2px solid #cbd5e1;border-top-color:#029cfd;border-radius:50%;animation:dim-test-spin .7s linear infinite;flex-shrink:0}" +
      "#dim-test-splash .dim-test-spinner{width:2.25rem;height:2.25rem;border-width:3px}" +
      "#dim-test-report .dim-test-status-label{animation:dim-test-pulse 1.2s ease-in-out infinite}" +
      "#dim-test-report.dim-test-done .dim-test-status-label{animation:none}" +
      "#dim-test-report ul{list-style:none;margin:0;padding:0}" +
      "#dim-test-report .dim-tree-children{padding-left:1.1rem;margin:.15rem 0 .2rem;border-left:1px solid #e2e8f0}" +
      "#dim-test-report .dim-tree-node{margin:0;padding:0;border:0;background:transparent}" +
      "#dim-test-report .dim-tree-node + .dim-tree-node{margin-top:.15rem}" +
      "#dim-test-report .dim-tree-row{display:flex;flex-wrap:wrap;align-items:center;gap:.45rem .65rem;width:100%;margin:0;padding:.4rem .55rem;border:0;border-radius:7px;background:transparent;font:inherit;color:inherit;cursor:pointer;text-align:left}" +
      "#dim-test-report .dim-tree-row:hover{background:#f1f5f9}" +
      "#dim-test-report .dim-tree-chevron{width:.7rem;color:#94a3b8;flex-shrink:0}" +
      "#dim-test-report .dim-tree-label{flex:1;min-width:0;font-size:.88rem;word-break:break-word}" +
      "#dim-test-report .dim-tree-dir > .dim-tree-row .dim-tree-label{font-weight:600;color:#334155}" +
      "#dim-test-report .dim-tree-file > .dim-tree-row .dim-tree-label{color:#0f172a}" +
      "#dim-test-report .dim-tree-stats{font-size:.8rem;color:#64748b;white-space:nowrap}" +
      "#dim-test-report .dim-tree-mini{width:3.5rem;height:5px;border-radius:999px;background:#e2e8f0;overflow:hidden;flex-shrink:0}" +
      "#dim-test-report .dim-tree-mini > span{display:block;height:100%;background:#0ea5e9}" +
      "#dim-test-report .dim-cov-zero > .dim-tree-row .dim-tree-mini > span{background:#cbd5e1}" +
      "#dim-test-report .dim-cov-full > .dim-tree-row .dim-tree-mini > span{background:#16a34a}" +
      "#dim-test-report .dim-cov-uncovered{margin:0;padding:.25rem .55rem .55rem 1.7rem;font-size:.8rem;color:#991b1b;line-height:1.4}" +
      "#dim-test-report .dim-cov-uncovered strong{color:#64748b;font-weight:600}" +
      "#dim-test-report .dim-test-leaf{display:flex;flex-wrap:wrap;align-items:flex-start;gap:.5rem .65rem;margin:0;padding:.45rem .55rem;border-radius:7px;border:1px solid transparent;background:transparent;transition:background .25s ease,border-color .25s ease,transform .25s ease}" +
      "#dim-test-report .dim-test-leaf + .dim-test-leaf{margin-top:.15rem}" +
      "#dim-test-report .dim-test-leaf.dim-test-pending{color:#94a3b8}" +
      "#dim-test-report .dim-test-leaf.dim-test-running{color:#0369a1;background:#e0f2fe;border-color:#bae6fd;animation:dim-test-pulse 1.1s ease-in-out infinite}" +
      "#dim-test-report .dim-test-leaf.dim-test-pass{color:#166534;background:#f0fdf4;border-color:#bbf7d0;animation:dim-test-pop .35s ease both}" +
      "#dim-test-report .dim-test-leaf.dim-test-fail{color:#991b1b;background:#fef2f2;border-color:#fecaca;animation:dim-test-pop .35s ease both}" +
      "#dim-test-report .dim-test-badge{font-size:.72rem;font-weight:700;letter-spacing:.04em;min-width:3.2rem;text-align:center;padding:.15rem .4rem;border-radius:999px;background:rgba(15,23,42,.06)}" +
      "#dim-test-report .dim-test-running .dim-test-badge,#dim-test-report .dim-tree-running > .dim-tree-row .dim-test-badge{background:#0284c7;color:#fff}" +
      "#dim-test-report .dim-test-pass .dim-test-badge,#dim-test-report .dim-tree-pass > .dim-tree-row .dim-test-badge{background:#16a34a;color:#fff}" +
      "#dim-test-report .dim-test-fail .dim-test-badge,#dim-test-report .dim-tree-fail > .dim-tree-row .dim-test-badge{background:#dc2626;color:#fff}" +
      "#dim-test-report .dim-test-name{flex:1;min-width:12rem;line-height:1.35}" +
      "#dim-test-report pre{flex-basis:100%;white-space:pre-wrap;margin:.15rem 0 0;padding:.5rem .65rem;border-radius:6px;background:rgba(127,29,29,.06);font-size:.8rem;animation:dim-test-in .3s ease both}" +
      "#dim-test-report .dim-cov{margin-top:.25rem}" +
      "#dim-test-report .dim-cov-meta{margin:0 0 .65rem;color:#64748b;font-size:.92rem}" +
      "#dim-test-report .dim-cov-progress{height:6px;border-radius:999px;background:#e2e8f0;overflow:hidden;margin:0 0 .85rem}" +
      "#dim-test-report .dim-cov-progress > span{display:block;height:100%;border-radius:inherit;background:#0ea5e9;transition:width .35s cubic-bezier(.22,1,.36,1)}" +
      "#dim-test-report .dim-cov-list{list-style:none;margin:0;padding:0}" +
      "#dim-test-splash{flex:1;display:flex;align-items:center;justify-content:center;padding:2rem 1.25rem;animation:dim-test-in .4s ease both}" +
      "#dim-test-splash .dim-test-splash-card{width:min(22rem,100%);text-align:center;padding:2rem 1.5rem;border-radius:16px;background:#f8fafc;box-shadow:0 1px 2px rgba(15,23,42,.06),0 12px 32px rgba(15,23,42,.08);animation:dim-test-splash-glow 2s ease-in-out infinite}" +
      "#dim-test-splash .dim-test-splash-card h1{margin:.9rem 0 .35rem;font-size:1.35rem;letter-spacing:-.02em;animation:dim-test-pulse 1.6s ease-in-out infinite}" +
      "#dim-test-splash .dim-test-splash-status{margin:0 0 1.1rem;color:#64748b;font-size:.95rem;min-height:1.35em}" +
      "#dim-test-splash .dim-test-splash-bar{height:6px;border-radius:999px;background:#e2e8f0;overflow:hidden}" +
      "#dim-test-splash .dim-test-splash-bar > span{display:block;height:100%;width:40%;border-radius:inherit;background:linear-gradient(90deg,#029cfd,#38bdf8,#029cfd);background-size:40px 100%;animation:dim-test-bar .7s linear infinite}" +
      "#dim-test-root{position:absolute;left:-9999px;width:320px;height:480px;overflow:hidden}";
    document.head.appendChild(style);
  }

  function updateToolbar() {
    var impl = currentImpl();
    var meta = document.getElementById("dim-test-bar-meta");
    if (meta) meta.textContent = "runtime: " + impl;
    var jsBtn = document.getElementById("dim-test-btn-js");
    var wasmBtn = document.getElementById("dim-test-btn-wasm");
    var rerunBtn = document.getElementById("dim-test-btn-rerun");
    if (jsBtn) {
      jsBtn.className = impl === "js" ? "active" : "";
    }
    if (wasmBtn) {
      wasmBtn.className = impl === "wasm" ? "active" : "";
    }
    if (rerunBtn) {
      rerunBtn.disabled = runInFlight || suite.length === 0;
    }
  }

  function ensureShell() {
    ensureStyles();
    getFixtureRoot();

    if (shellBuilt && document.getElementById("dim-test-shell")) {
      updateToolbar();
      return document.getElementById("dim-test-shell");
    }

    var existingReport = document.getElementById("dim-test-report");
    if (existingReport && existingReport.parentNode) {
      existingReport.parentNode.removeChild(existingReport);
    }

    var shell = document.getElementById("dim-test-shell");
    if (!shell) {
      shell = document.createElement("div");
      shell.id = "dim-test-shell";
      document.body.insertBefore(shell, document.body.firstChild);
    }

    shell.innerHTML =
      '<header class="dim-test-bar">' +
      '<span class="dim-test-bar-title">DimTest</span>' +
      '<span class="dim-test-bar-meta" id="dim-test-bar-meta"></span>' +
      '<button type="button" id="dim-test-btn-js">JS</button>' +
      '<button type="button" id="dim-test-btn-wasm">WASM</button>' +
      '<button type="button" id="dim-test-btn-rerun">Rerun</button>' +
      "</header>" +
      '<div id="dim-test-stage"></div>';

    document.getElementById("dim-test-btn-js").addEventListener("click", function () {
      setImpl("js");
    });
    document
      .getElementById("dim-test-btn-wasm")
      .addEventListener("click", function () {
        setImpl("wasm");
      });
    document
      .getElementById("dim-test-btn-rerun")
      .addEventListener("click", function () {
        rerun();
      });

    shellBuilt = true;
    updateToolbar();
    return shell;
  }

  function getStage() {
    ensureShell();
    return document.getElementById("dim-test-stage");
  }

  function getPanel() {
    ensureShell();
    var stage = getStage();
    var panel = document.getElementById("dim-test-report");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "dim-test-report";
      stage.appendChild(panel);
    }
    return panel;
  }

  function showSplash(message) {
    ensureShell();
    splashVisible = true;
    var stage = getStage();
    var msg =
      message == null || message === ""
        ? "Starting…"
        : String(message);
    stage.innerHTML =
      '<div id="dim-test-splash">' +
      '<div class="dim-test-splash-card">' +
      '<div class="dim-test-spinner" aria-hidden="true"></div>' +
      "<h1>DimTest</h1>" +
      '<p class="dim-test-splash-status" id="dim-test-splash-status">' +
      escapeHtml(msg) +
      "</p>" +
      '<div class="dim-test-splash-bar" aria-hidden="true"><span></span></div>' +
      "</div></div>";
    updateToolbar();
  }

  function splash(message) {
    if (!splashVisible || !document.getElementById("dim-test-splash")) {
      showSplash(message);
      return;
    }
    var el = document.getElementById("dim-test-splash-status");
    if (el) {
      el.textContent =
        message == null || message === "" ? "Starting…" : String(message);
    }
  }

  function hideSplash() {
    splashVisible = false;
    var splashEl = document.getElementById("dim-test-splash");
    if (splashEl && splashEl.parentNode) {
      splashEl.parentNode.removeChild(splashEl);
    }
  }

  function bindTreeToggles(panel) {
    var buttons = panel.querySelectorAll("[data-dim-tree-path]");
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var path = btn.getAttribute("data-dim-tree-path");
          var kind = btn.getAttribute("data-dim-tree-kind") || "cover";
          if (!path) return;
          var map = kind === "test" ? testExpanded : coverExpanded;
          var defaultExpanded =
            btn.getAttribute("data-dim-tree-default") === "1";
          var current = isExpanded(map, path, defaultExpanded);
          map[path] = !current;
          var state = global.__DIM_TEST__;
          if (state) paintReport(state);
        });
      })(buttons[i]);
    }
  }

  function aggregateCovNode(node) {
    if (node.kind === "file") {
      return {
        hit: node.hit || 0,
        total: node.total || 0,
        pct: node.pct || 0,
      };
    }
    var hit = 0;
    var total = 0;
    var kids = sortedChildren(node);
    for (var i = 0; i < kids.length; i++) {
      var a = aggregateCovNode(kids[i]);
      hit += a.hit;
      total += a.total;
    }
    node.hit = hit;
    node.total = total;
    node.pct = total ? Math.round((hit / total) * 100) : 0;
    return { hit: hit, total: total, pct: node.pct };
  }

  function paintCovNode(node) {
    if (node.kind === "file") {
      var fileExpanded = isExpanded(coverExpanded, node.path, false);
      var fileCls = "dim-tree-node dim-tree-file";
      if (node.pct === 0) fileCls += " dim-cov-zero";
      else if (node.pct === 100) fileCls += " dim-cov-full";
      var detail = "";
      if (fileExpanded) {
        if (node.uncovered && node.uncovered.length) {
          detail =
            '<p class="dim-cov-uncovered"><strong>Uncovered:</strong> ' +
            escapeHtml(compactLineRanges(node.uncovered)) +
            "</p>";
        } else {
          detail =
            '<p class="dim-cov-uncovered"><strong>Uncovered:</strong> none</p>';
        }
      }
      return (
        '<li class="' +
        fileCls +
        '">' +
        '<button type="button" class="dim-tree-row" data-dim-tree-path="' +
        escapeHtml(node.path) +
        '" data-dim-tree-kind="cover" data-dim-tree-default="0" aria-expanded="' +
        (fileExpanded ? "true" : "false") +
        '">' +
        '<span class="dim-tree-chevron" aria-hidden="true">' +
        (fileExpanded ? "▾" : "▸") +
        "</span>" +
        '<span class="dim-tree-label">' +
        escapeHtml(node.name) +
        "</span>" +
        '<span class="dim-tree-mini" aria-hidden="true"><span style="width:' +
        node.pct +
        '%"></span></span>' +
        '<span class="dim-tree-stats">' +
        node.hit +
        "/" +
        node.total +
        " · " +
        node.pct +
        "%</span>" +
        "</button>" +
        detail +
        "</li>"
      );
    }

    aggregateCovNode(node);
    var dirExpanded = isExpanded(coverExpanded, node.path, false);
    var kids = sortedChildren(node);
    var childHtml = "";
    if (dirExpanded && kids.length) {
      var childRows = [];
      for (var i = 0; i < kids.length; i++) {
        childRows.push(paintCovNode(kids[i]));
      }
      childHtml =
        '<ul class="dim-tree-children">' + childRows.join("") + "</ul>";
    }
    return (
      '<li class="dim-tree-node dim-tree-dir">' +
      '<button type="button" class="dim-tree-row" data-dim-tree-path="' +
      escapeHtml(node.path) +
      '" data-dim-tree-kind="cover" data-dim-tree-default="0" aria-expanded="' +
      (dirExpanded ? "true" : "false") +
      '">' +
      '<span class="dim-tree-chevron" aria-hidden="true">' +
      (dirExpanded ? "▾" : "▸") +
      "</span>" +
      '<span class="dim-tree-label">' +
      escapeHtml(node.name || "/") +
      "</span>" +
      '<span class="dim-tree-mini" aria-hidden="true"><span style="width:' +
      (node.pct || 0) +
      '%"></span></span>' +
      '<span class="dim-tree-stats">' +
      (node.hit || 0) +
      "/" +
      (node.total || 0) +
      " · " +
      (node.pct || 0) +
      "%</span>" +
      "</button>" +
      childHtml +
      "</li>"
    );
  }

  function paintCoverageHtml() {
    var cov = coverSummary();
    if (!cov.total) return "";

    var root = createTreeRoot();
    for (var i = 0; i < cov.files.length; i++) {
      var f = cov.files[i];
      insertPathLeaf(root, f.path, {
        kind: "file",
        name: basename(f.path),
        path: f.path,
        hit: f.hit,
        total: f.total,
        pct: f.pct,
        uncovered: f.uncovered,
        children: {},
      });
    }

    var top = sortedChildren(root);
    var rows = [];
    for (var j = 0; j < top.length; j++) {
      rows.push(paintCovNode(top[j]));
    }

    return (
      '<div class="dim-cov">' +
      "<h2>Coverage</h2>" +
      '<p class="dim-cov-meta"><strong>' +
      cov.pct +
      "%</strong> of executable lines · " +
      cov.hit +
      " / " +
      cov.total +
      "</p>" +
      '<div class="dim-cov-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      cov.pct +
      '"><span style="width:' +
      cov.pct +
      '%"></span></div>' +
      '<ul class="dim-cov-list">' +
      rows.join("") +
      "</ul></div>"
    );
  }

  function testLeafStatus(r) {
    if (r.status === "running") return "running";
    if (r.status === "pass" || r.ok === true) return "pass";
    if (r.status === "fail" || r.ok === false) return "fail";
    return "pending";
  }

  function aggregateTestNode(node) {
    if (node.kind === "test") {
      var st = testLeafStatus(node.result || {});
      return {
        passed: st === "pass" ? 1 : 0,
        failed: st === "fail" ? 1 : 0,
        running: st === "running" ? 1 : 0,
        pending: st === "pending" ? 1 : 0,
        total: 1,
      };
    }
    var passed = 0;
    var failed = 0;
    var running = 0;
    var pending = 0;
    var total = 0;
    var kids = sortedChildren(node);
    for (var i = 0; i < kids.length; i++) {
      var a = aggregateTestNode(kids[i]);
      passed += a.passed;
      failed += a.failed;
      running += a.running;
      pending += a.pending;
      total += a.total;
    }
    node.passed = passed;
    node.failed = failed;
    node.running = running;
    node.pending = pending;
    node.total = total;
    return {
      passed: passed,
      failed: failed,
      running: running,
      pending: pending,
      total: total,
    };
  }

  function testGroupClass(node) {
    var a = aggregateTestNode(node);
    if (a.failed) return "dim-tree-fail";
    if (a.running) return "dim-tree-running";
    if (a.total && a.passed === a.total) return "dim-tree-pass";
    return "";
  }

  function testGroupBadge(node) {
    var a = aggregateTestNode(node);
    if (a.failed) return "FAIL";
    if (a.running) return "RUN";
    if (a.total && a.passed === a.total) return "PASS";
    if (!a.total) return "…";
    return a.passed + "/" + a.total;
  }

  function paintTestLeaf(r) {
    var cls = "dim-test-leaf dim-test-pending";
    var badge = "…";
    var detail = "";
    var st = testLeafStatus(r);
    if (st === "running") {
      cls = "dim-test-leaf dim-test-running";
      badge = "RUN";
    } else if (st === "pass") {
      cls = "dim-test-leaf dim-test-pass";
      badge = "PASS";
    } else if (st === "fail") {
      cls = "dim-test-leaf dim-test-fail";
      badge = "FAIL";
      if (r.error) {
        detail = "<pre>" + escapeHtml(r.error) + "</pre>";
      }
    }
    return (
      '<li class="' +
      cls +
      '"><span class="dim-test-badge">' +
      badge +
      '</span><span class="dim-test-name">' +
      escapeHtml(r.name) +
      "</span>" +
      detail +
      "</li>"
    );
  }

  function paintTestNode(node) {
    if (node.kind === "test") {
      return paintTestLeaf(node.result || { name: node.name, status: "pending" });
    }

    aggregateTestNode(node);
    var expanded = isExpanded(testExpanded, node.path, false);
    var groupCls = testGroupClass(node);
    var kids = sortedChildren(node);
    var childHtml = "";
    if (expanded && kids.length) {
      var childRows = [];
      for (var i = 0; i < kids.length; i++) {
        childRows.push(paintTestNode(kids[i]));
      }
      childHtml =
        '<ul class="dim-tree-children">' + childRows.join("") + "</ul>";
    }
    var kindCls = node.kind === "file" ? "dim-tree-file" : "dim-tree-dir";
    return (
      '<li class="dim-tree-node ' +
      kindCls +
      (groupCls ? " " + groupCls : "") +
      '">' +
      '<button type="button" class="dim-tree-row" data-dim-tree-path="' +
      escapeHtml(node.path) +
      '" data-dim-tree-kind="test" data-dim-tree-default="0" aria-expanded="' +
      (expanded ? "true" : "false") +
      '">' +
      '<span class="dim-tree-chevron" aria-hidden="true">' +
      (expanded ? "▾" : "▸") +
      "</span>" +
      '<span class="dim-test-badge">' +
      escapeHtml(testGroupBadge(node)) +
      "</span>" +
      '<span class="dim-tree-label">' +
      escapeHtml(node.name || "/") +
      "</span>" +
      '<span class="dim-tree-stats">' +
      (node.passed || 0) +
      "/" +
      (node.total || 0) +
      "</span>" +
      "</button>" +
      childHtml +
      "</li>"
    );
  }

  function paintResultsTree(results) {
    var root = createTreeRoot();
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var filePath = r.file || "(inline)";
      var parts = String(filePath)
        .split("/")
        .filter(function (p) {
          return p !== "";
        });
      var node = root;
      var accum = [];
      for (var j = 0; j < parts.length - 1; j++) {
        accum.push(parts[j]);
        node = ensureDir(node, parts[j], accum.join("/"));
      }
      var fileName = parts.length ? parts[parts.length - 1] : "(inline)";
      var fileNode = ensureFile(node, fileName, filePath);
      var testKey = r.name + "#" + i;
      fileNode.children[testKey] = {
        kind: "test",
        name: r.name,
        path: filePath + "#" + testKey,
        result: r,
        children: {},
      };
    }

    var top = sortedChildren(root);
    var rows = [];
    for (var k = 0; k < top.length; k++) {
      rows.push(paintTestNode(top[k]));
    }
    return '<ul class="dim-test-tree">' + rows.join("") + "</ul>";
  }

  /**
   * @param {{done:boolean,passed:number,failed:number,results:Array,runningName?:string,total:number}} state
   */
  function paintReport(state) {
    hideSplash();
    var panel = getPanel();
    var stage = getStage();
    if (panel.parentNode !== stage) {
      stage.appendChild(panel);
    }

    var total = state.total || suite.length || state.results.length;
    var finished = state.passed + state.failed;
    var pct = total ? Math.round((finished / total) * 100) : 0;
    var done = Boolean(state.done);
    var runningName = state.runningName || "";

    panel.className = done
      ? state.failed > 0
        ? "dim-test-done dim-test-done-fail"
        : "dim-test-done dim-test-done-ok"
      : "dim-test-running";

    var statusHtml;
    if (done) {
      statusHtml =
        state.failed > 0
          ? '<span class="dim-test-status-label">Finished with failures</span>'
          : '<span class="dim-test-status-label">All tests passed</span>';
    } else if (runningName) {
      statusHtml =
        '<span class="dim-test-spinner" aria-hidden="true"></span>' +
        '<span class="dim-test-status-label">Running: ' +
        escapeHtml(runningName) +
        "</span>";
    } else {
      statusHtml =
        '<span class="dim-test-spinner" aria-hidden="true"></span>' +
        '<span class="dim-test-status-label">Starting…</span>';
    }

    panel.innerHTML =
      "<h1>Results</h1>" +
      '<p class="dim-test-meta"><strong>' +
      state.passed +
      "</strong> passed, <strong>" +
      state.failed +
      "</strong> failed · " +
      finished +
      " / " +
      total +
      (done ? " complete" : " running") +
      "</p>" +
      '<div class="dim-test-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
      pct +
      '"><span style="width:' +
      pct +
      '%"></span></div>' +
      '<div class="dim-test-status">' +
      statusHtml +
      "</div>" +
      paintResultsTree(state.results || []) +
      paintCoverageHtml();

    bindTreeToggles(panel);
    updateToolbar();
  }

  function runSuite() {
    var results = [];
    var passed = 0;
    var failed = 0;
    var index = 0;
    var total = suite.length;

    for (var i = 0; i < suite.length; i++) {
      results.push({
        name: suite[i].name,
        file: suite[i].file || "(inline)",
        status: "pending",
        ok: null,
      });
    }

    function snapshot(runningName) {
      return {
        done: false,
        passed: passed,
        failed: failed,
        results: results,
        runningName: runningName || "",
        total: total,
        coverage: coverSummary(),
      };
    }

    function publish(runningName) {
      var state = snapshot(runningName);
      global.__DIM_TEST__ = state;
      paintReport(state);
    }

    function finish(summary) {
      runInFlight = false;
      updateToolbar();
      return summary;
    }

    function next() {
      if (index >= suite.length) {
        var summary = {
          done: true,
          passed: passed,
          failed: failed,
          results: results.map(function (r) {
            return {
              name: r.name,
              file: r.file || "(inline)",
              ok: r.ok,
              status: r.status,
              error: r.error,
            };
          }),
          total: total,
          coverage: coverSummary(),
        };
        global.__DIM_TEST__ = summary;
        paintReport(summary);
        return Promise.resolve(finish(summary));
      }

      var entry = suite[index];
      var slot = results[index];
      slot.status = "running";
      slot.ok = null;
      delete slot.error;
      publish(entry.name);
      clearFixture();
      index += 1;

      var paintDelay = new Promise(function (resolve) {
        setTimeout(resolve, 120);
      });

      return paintDelay
        .then(function () {
          return entry.fn();
        })
        .then(
          function () {
            passed += 1;
            slot.status = "pass";
            slot.ok = true;
            publish("");
          },
          function (err) {
            failed += 1;
            slot.status = "fail";
            slot.ok = false;
            slot.error = err && err.stack ? err.stack : String(err);
            publish("");
          },
        )
        .then(next);
    }

    runInFlight = true;
    updateToolbar();
    global.__DIM_TEST__ = snapshot("");
    paintReport(snapshot(""));
    return next();
  }

  function run() {
    if (runInFlight) {
      return Promise.resolve(global.__DIM_TEST__);
    }
    return runSuite();
  }

  function rerun() {
    if (runInFlight) {
      return Promise.resolve(global.__DIM_TEST__);
    }
    if (!suite.length) {
      return Promise.reject(new Error("DimTest.rerun: no tests registered"));
    }
    coverResetHits();
    clearFixture();
    return runSuite();
  }

  var cover = {
    register: coverRegister,
    hit: coverHit,
    summary: coverSummary,
    resetHits: coverResetHits,
  };

  global.__DIM_COV__ = {
    hit: coverHit,
    register: coverRegister,
    summary: coverSummary,
  };

  global.DimTest = {
    test: test,
    expect: expect,
    mount: mount,
    shadowText: shadowText,
    open: open,
    run: run,
    rerun: rerun,
    splash: splash,
    clearFixture: clearFixture,
    cover: cover,
  };

  // Build chrome as soon as the script runs so boot pages are not blank.
  if (document.body) {
    ensureShell();
    showSplash("Starting…");
  } else {
    document.addEventListener("DOMContentLoaded", function () {
      ensureShell();
      showSplash("Starting…");
    });
  }
})(typeof globalThis !== "undefined" ? globalThis : window);

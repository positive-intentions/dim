/**
 * DimTest — tiny classic-script harness for uncompiled Dim apps.
 *
 * Load after window.Dim (dim.global.js or dim.wasm.global.js). Does not
 * modify Dim. Exposes window.DimTest and writes window.__DIM_TEST__ after run().
 *
 * Optional live line coverage (when DimTest.cover.register is used by a
 * test-only instrumenter): window.__DIM_COV__ + Coverage block in the report.
 *
 *   <script src=".../dim.global.js"></script>
 *   <script src=".../dim.test.global.js"></script>
 *   <script>
 *     DimTest.test("renders", async () => {
 *       const el = await DimTest.mount("my-counter");
 *       DimTest.expect(DimTest.shadowText(el)).toContain("0");
 *     });
 *     DimTest.run();
 *   </script>
 */
(function (global) {
  "use strict";

  var suite = [];
  var fixtureRoot = null;
  var styleInjected = false;
  /** @type {Record<string, { lines: number[], hits: Record<number, number> }>} */
  var coverFiles = {};
  /** @type {Record<string, boolean>} */
  var coverExpanded = {};

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

  function clearFixture() {
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

  function test(name, fn) {
    suite.push({ name: name, fn: fn });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
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
      "#dim-test-report{font-family:system-ui,sans-serif;max-width:48rem;margin:1.5rem auto;padding:1.25rem 1.35rem;color:#0f172a;background:#f8fafc;border-radius:12px;box-shadow:0 1px 2px rgba(15,23,42,.06),0 8px 24px rgba(15,23,42,.06);animation:dim-test-in .35s ease both}" +
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
      "#dim-test-report .dim-test-spinner{width:.85rem;height:.85rem;border:2px solid #cbd5e1;border-top-color:#029cfd;border-radius:50%;animation:dim-test-spin .7s linear infinite;flex-shrink:0}" +
      "#dim-test-report .dim-test-status-label{animation:dim-test-pulse 1.2s ease-in-out infinite}" +
      "#dim-test-report.dim-test-done .dim-test-status-label{animation:none}" +
      "#dim-test-report ul{list-style:none;margin:0;padding:0}" +
      "#dim-test-report li{display:flex;flex-wrap:wrap;align-items:flex-start;gap:.5rem .65rem;margin:0;padding:.55rem .65rem;border-radius:8px;border:1px solid transparent;background:transparent;transition:background .25s ease,border-color .25s ease,transform .25s ease}" +
      "#dim-test-report li + li{margin-top:.35rem}" +
      "#dim-test-report li.dim-test-pending{color:#94a3b8}" +
      "#dim-test-report li.dim-test-running{color:#0369a1;background:#e0f2fe;border-color:#bae6fd;animation:dim-test-pulse 1.1s ease-in-out infinite}" +
      "#dim-test-report li.dim-test-pass{color:#166534;background:#f0fdf4;border-color:#bbf7d0;animation:dim-test-pop .35s ease both}" +
      "#dim-test-report li.dim-test-fail{color:#991b1b;background:#fef2f2;border-color:#fecaca;animation:dim-test-pop .35s ease both}" +
      "#dim-test-report .dim-test-badge{font-size:.72rem;font-weight:700;letter-spacing:.04em;min-width:3.2rem;text-align:center;padding:.15rem .4rem;border-radius:999px;background:rgba(15,23,42,.06)}" +
      "#dim-test-report li.dim-test-running .dim-test-badge{background:#0284c7;color:#fff}" +
      "#dim-test-report li.dim-test-pass .dim-test-badge{background:#16a34a;color:#fff}" +
      "#dim-test-report li.dim-test-fail .dim-test-badge{background:#dc2626;color:#fff}" +
      "#dim-test-report .dim-test-name{flex:1;min-width:12rem;line-height:1.35}" +
      "#dim-test-report pre{flex-basis:100%;white-space:pre-wrap;margin:.15rem 0 0;padding:.5rem .65rem;border-radius:6px;background:rgba(127,29,29,.06);font-size:.8rem;animation:dim-test-in .3s ease both}" +
      "#dim-test-report .dim-cov{margin-top:.25rem}" +
      "#dim-test-report .dim-cov-meta{margin:0 0 .65rem;color:#64748b;font-size:.92rem}" +
      "#dim-test-report .dim-cov-progress{height:6px;border-radius:999px;background:#e2e8f0;overflow:hidden;margin:0 0 .85rem}" +
      "#dim-test-report .dim-cov-progress > span{display:block;height:100%;border-radius:inherit;background:#0ea5e9;transition:width .35s cubic-bezier(.22,1,.36,1)}" +
      "#dim-test-report .dim-cov-list{list-style:none;margin:0;padding:0}" +
      "#dim-test-report .dim-cov-file{margin:0 0 .4rem;border:1px solid #e2e8f0;border-radius:8px;background:#fff;overflow:hidden}" +
      "#dim-test-report .dim-cov-toggle{display:flex;align-items:center;gap:.65rem;width:100%;margin:0;padding:.55rem .7rem;border:0;background:transparent;font:inherit;color:inherit;cursor:pointer;text-align:left}" +
      "#dim-test-report .dim-cov-toggle:hover{background:#f1f5f9}" +
      "#dim-test-report .dim-cov-chevron{width:.7rem;color:#94a3b8;flex-shrink:0}" +
      "#dim-test-report .dim-cov-path{flex:1;min-width:0;font-size:.88rem;word-break:break-all}" +
      "#dim-test-report .dim-cov-stats{font-size:.8rem;color:#64748b;white-space:nowrap}" +
      "#dim-test-report .dim-cov-mini{width:3.5rem;height:5px;border-radius:999px;background:#e2e8f0;overflow:hidden;flex-shrink:0}" +
      "#dim-test-report .dim-cov-mini > span{display:block;height:100%;background:#0ea5e9}" +
      "#dim-test-report .dim-cov-file.dim-cov-zero .dim-cov-mini > span{background:#cbd5e1}" +
      "#dim-test-report .dim-cov-file.dim-cov-full .dim-cov-mini > span{background:#16a34a}" +
      "#dim-test-report .dim-cov-uncovered{margin:0;padding:.35rem .7rem .65rem 1.9rem;font-size:.8rem;color:#991b1b;line-height:1.4}" +
      "#dim-test-report .dim-cov-uncovered strong{color:#64748b;font-weight:600}";
    document.head.appendChild(style);
  }

  function getPanel() {
    ensureStyles();
    var panel = document.getElementById("dim-test-report");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "dim-test-report";
      document.body.appendChild(panel);
    }
    return panel;
  }

  function bindCoverageToggles(panel) {
    var buttons = panel.querySelectorAll("[data-dim-cov-path]");
    for (var i = 0; i < buttons.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var path = btn.getAttribute("data-dim-cov-path");
          if (!path) return;
          coverExpanded[path] = !coverExpanded[path];
          var state = global.__DIM_TEST__;
          if (state) paintReport(state);
        });
      })(buttons[i]);
    }
  }

  function paintCoverageHtml() {
    var cov = coverSummary();
    if (!cov.total) return "";

    var rows = [];
    for (var i = 0; i < cov.files.length; i++) {
      var f = cov.files[i];
      var expanded = Boolean(coverExpanded[f.path]);
      var fileCls = "dim-cov-file";
      if (f.pct === 0) fileCls += " dim-cov-zero";
      else if (f.pct === 100) fileCls += " dim-cov-full";
      var detail = "";
      if (expanded) {
        if (f.uncovered.length) {
          detail =
            '<p class="dim-cov-uncovered"><strong>Uncovered:</strong> ' +
            escapeHtml(compactLineRanges(f.uncovered)) +
            "</p>";
        } else {
          detail =
            '<p class="dim-cov-uncovered"><strong>Uncovered:</strong> none</p>';
        }
      }
      rows.push(
        '<li class="' +
          fileCls +
          '">' +
          '<button type="button" class="dim-cov-toggle" data-dim-cov-path="' +
          escapeHtml(f.path) +
          '" aria-expanded="' +
          (expanded ? "true" : "false") +
          '">' +
          '<span class="dim-cov-chevron" aria-hidden="true">' +
          (expanded ? "▾" : "▸") +
          "</span>" +
          '<span class="dim-cov-path">' +
          escapeHtml(f.path) +
          "</span>" +
          '<span class="dim-cov-mini" aria-hidden="true"><span style="width:' +
          f.pct +
          '%"></span></span>' +
          '<span class="dim-cov-stats">' +
          f.hit +
          "/" +
          f.total +
          " · " +
          f.pct +
          "%</span>" +
          "</button>" +
          detail +
          "</li>",
      );
    }

    return (
      '<div class="dim-cov">' +
      "<h2>Coverage</h2>" +
      '<p class="dim-cov-meta"><strong>' +
      cov.pct +
      "%</strong> of executable lines in notes/ · " +
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

  /**
   * @param {{done:boolean,passed:number,failed:number,results:Array,runningName?:string,total:number}} state
   */
  function paintReport(state) {
    var panel = getPanel();
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

    var rows = [];
    for (var i = 0; i < state.results.length; i++) {
      var r = state.results[i];
      var cls = "dim-test-pending";
      var badge = "…";
      var detail = "";
      if (r.status === "running") {
        cls = "dim-test-running";
        badge = "RUN";
      } else if (r.status === "pass" || r.ok === true) {
        cls = "dim-test-pass";
        badge = "PASS";
      } else if (r.status === "fail" || r.ok === false) {
        cls = "dim-test-fail";
        badge = "FAIL";
        if (r.error) {
          detail = "<pre>" + escapeHtml(r.error) + "</pre>";
        }
      }
      rows.push(
        '<li class="' +
          cls +
          '"><span class="dim-test-badge">' +
          badge +
          '</span><span class="dim-test-name">' +
          escapeHtml(r.name) +
          "</span>" +
          detail +
          "</li>",
      );
    }

    panel.innerHTML =
      "<h1>DimTest</h1>" +
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
      "<ul>" +
      rows.join("") +
      "</ul>" +
      paintCoverageHtml();

    bindCoverageToggles(panel);
  }

  function run() {
    var results = [];
    var passed = 0;
    var failed = 0;
    var index = 0;
    var total = suite.length;

    for (var i = 0; i < suite.length; i++) {
      results.push({
        name: suite[i].name,
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

    function next() {
      if (index >= suite.length) {
        var summary = {
          done: true,
          passed: passed,
          failed: failed,
          results: results.map(function (r) {
            return {
              name: r.name,
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
        return Promise.resolve(summary);
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

    global.__DIM_TEST__ = snapshot("");
    paintReport(snapshot(""));
    return next();
  }

  var cover = {
    register: coverRegister,
    hit: coverHit,
    summary: coverSummary,
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
    run: run,
    clearFixture: clearFixture,
    cover: cover,
  };
})(typeof globalThis !== "undefined" ? globalThis : window);

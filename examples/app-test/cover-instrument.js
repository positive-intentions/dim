/**
 * DimTest line instrumenter (classic script) — optional companion to
 * dim.test.global.js for in-page coverage.
 *
 * Expects global `DimParse` and `DimTest` / `__DIM_COV__`. Does not rewrite
 * files on disk — returns instrumented source for eval/injection.
 *
 * Published as:
 *   https://positive-intentions.github.io/dim/lib/dim.cover.global.js
 * (build:pages-lib concatenates parse.js + this file so DimParse is embedded)
 *
 *   <script src=".../dim.test.global.js"></script>
 *   <script src=".../dim.cover.global.js"></script>
 *   DimTest.instrument(source, "app/lib/foo.js")
 *
 * Standalone parser (without cover):
 *   <script src=".../dim.parse.global.js"></script>
 */
(function (global) {
  "use strict";

  var SKIP_TYPES = {
    BlockStatement: true,
    EmptyStatement: true,
    SwitchCase: true,
    Program: true,
  };

  function isStatement(node) {
    if (!node || !node.type) return false;
    if (SKIP_TYPES[node.type]) return false;
    // Statement types end with Statement, plus Declaration forms.
    if (/Statement$/.test(node.type)) return true;
    if (
      node.type === "FunctionDeclaration" ||
      node.type === "ClassDeclaration" ||
      node.type === "VariableDeclaration"
    ) {
      return true;
    }
    return false;
  }

  function walk(node, visit) {
    if (!node || typeof node !== "object") return;
    visit(node);
    for (var key in node) {
      if (!Object.prototype.hasOwnProperty.call(node, key)) continue;
      if (key === "loc" || key === "range" || key === "start" || key === "end") {
        continue;
      }
      var child = node[key];
      if (Array.isArray(child)) {
        for (var i = 0; i < child.length; i++) {
          if (child[i] && typeof child[i].type === "string") {
            walk(child[i], visit);
          }
        }
      } else if (child && typeof child.type === "string") {
        walk(child, visit);
      }
    }
  }

  function collectLineInserts(ast) {
    // line -> first character offset of a statement on that line
    var firstOffset = {};
    walk(ast, function (node) {
      if (!isStatement(node)) return;
      if (!node.loc || typeof node.start !== "number") return;
      var line = node.loc.start.line;
      if (firstOffset[line] === undefined || node.start < firstOffset[line]) {
        firstOffset[line] = node.start;
      }
    });
    var lines = Object.keys(firstOffset)
      .map(Number)
      .sort(function (a, b) {
        return a - b;
      });
    var inserts = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      inserts.push({ line: line, offset: firstOffset[line] });
    }
    return inserts;
  }

  function escapeForString(path) {
    return String(path).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  }

  /**
   * @param {string} source
   * @param {string} file logical path e.g. notes/lib/note-filters.js
   * @returns {string} instrumented source
   */
  function instrument(source, file) {
    if (!global.DimParse || !global.DimParse.parse) {
      throw new Error(
        "dim.cover: global DimParse is required (load dim.cover.global.js or dim.parse.global.js)",
      );
    }
    if (!global.DimTest || !global.DimTest.cover) {
      throw new Error("dim.cover: DimTest.cover is required (load dim.test.global.js first)");
    }

    var ast = global.DimParse.parse(source, {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    });

    var inserts = collectLineInserts(ast);
    var lines = inserts.map(function (x) {
      return x.line;
    });
    global.DimTest.cover.register(file, lines);

    // Apply from the end so earlier offsets stay valid.
    inserts.sort(function (a, b) {
      return b.offset - a.offset;
    });

    var out = source;
    var pathLit = escapeForString(file);
    for (var i = 0; i < inserts.length; i++) {
      var ins = inserts[i];
      var probe =
        '(typeof __DIM_COV__!=="undefined"&&__DIM_COV__.hit("' +
        pathLit +
        '",' +
        ins.line +
        "));";
      out = out.slice(0, ins.offset) + probe + out.slice(ins.offset);
    }
    return out;
  }

  if (!global.DimTest) {
    throw new Error("dim.cover: load dim.test.global.js first");
  }
  global.DimTest.instrument = instrument;
})(typeof globalThis !== "undefined" ? globalThis : window);

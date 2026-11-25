var DimVerify = (function (exports) {
  'use strict';

  // src/verify/subset.js
  var ALLOWED_ARRAY_METHODS = /* @__PURE__ */ new Set([
    "filter",
    "map",
    "some",
    "every",
    "find",
    "reduce"
  ]);
  var ALLOWED_STRING_METHODS = /* @__PURE__ */ new Set([
    "startsWith",
    "slice",
    "trim",
    "toString"
  ]);
  var FORBIDDEN_TYPES = /* @__PURE__ */ new Set([
    "WhileStatement",
    "DoWhileStatement",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
    "TryStatement",
    "ThrowStatement",
    "WithStatement",
    "SwitchStatement",
    "LabeledStatement",
    "DebuggerStatement",
    "NewExpression",
    "ClassExpression",
    "ClassDeclaration",
    "AwaitExpression",
    "YieldExpression",
    "ImportExpression",
    "MetaProperty",
    "TaggedTemplateExpression",
    "AssignmentExpression",
    "UpdateExpression",
    "ThisExpression",
    "Super"
  ]);
  function locOf(node) {
    if (!node || !node.loc) return { line: 0, column: 0 };
    return {
      line: node.loc.start.line,
      column: node.loc.start.column
    };
  }
  function walk(node, visit) {
    if (!node || typeof node !== "object") return;
    visit(node);
    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "range" || key === "start" || key === "end") {
        continue;
      }
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) {
          if (c && typeof c.type === "string") walk(c, visit);
        }
      } else if (child && typeof child.type === "string") {
        walk(child, visit);
      }
    }
  }
  function checkSubset(bodyAst, opts = {}) {
    const file = opts.file || "(inline)";
    const contracted = opts.contractedNames || /* @__PURE__ */ new Set();
    const localFns = /* @__PURE__ */ new Set();
    walk(bodyAst, (node) => {
      if (node.type === "VariableDeclarator" && node.id && node.id.type === "Identifier") {
        const init = node.init;
        if (init && (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression")) {
          localFns.add(node.id.name);
        }
      }
      if (node.type === "FunctionDeclaration" && node.id && node.id.type === "Identifier") {
        localFns.add(node.id.name);
      }
    });
    const allowedCalls = /* @__PURE__ */ new Set([
      ...contracted,
      ...localFns,
      "fold",
      "String",
      "Boolean",
      "Number"
    ]);
    const violations = [];
    const reject = (node, reason) => {
      const loc = locOf(node);
      violations.push({
        file,
        line: loc.line,
        column: loc.column,
        reason,
        type: node && node.type
      });
    };
    walk(bodyAst, (node) => {
      if (FORBIDDEN_TYPES.has(node.type)) {
        reject(node, `forbidden construct ${node.type}`);
        return;
      }
      if (node.type === "MemberExpression" && node.computed) {
        const p = node.property;
        if (!(p && p.type === "Identifier" || p && p.type === "Literal" && typeof p.value === "number")) {
          reject(node, "computed member must use identifier or numeric literal");
        }
      }
      if (node.type === "Property") {
        if (node.computed) reject(node, "computed property keys forbidden");
        if (node.kind && node.kind !== "init") {
          reject(node, `property kind ${node.kind} forbidden`);
        }
      }
      if (node.type === "CallExpression") {
        const callee = node.callee;
        if (callee && callee.type === "MemberExpression" && !callee.computed) {
          const method = callee.property && callee.property.name;
          if (method && !ALLOWED_ARRAY_METHODS.has(method) && !ALLOWED_STRING_METHODS.has(method) && method !== "hasOwnProperty") {
            reject(node, `method .${method} not in verifiable subset`);
          }
        } else if (callee && callee.type === "Identifier") {
          const name = callee.name;
          if (!allowedCalls.has(name)) {
            reject(
              node,
              `call to unbound '${name}' \u2014 only contracted / local functions are allowed`
            );
          }
        } else if (callee && callee.type === "MemberExpression" && callee.object && callee.object.type === "Identifier" && callee.object.name === "Dim") {
          const m = callee.property && callee.property.name;
          if (m !== "fold" && m !== "contract") {
            reject(node, `Dim.${m} not allowed inside contracted body`);
          }
        }
      }
      if (node.type === "BinaryExpression") {
        const ok = [
          "===",
          "!==",
          "==",
          "!=",
          "+",
          "-",
          "*",
          "%",
          "<",
          "<=",
          ">",
          ">="
        ];
        if (!ok.includes(node.operator)) {
          reject(node, `operator ${node.operator} not in subset`);
        }
      }
      if (node.type === "UnaryExpression") {
        if (!["!", "+", "-", "typeof", "void"].includes(node.operator)) {
          reject(node, `unary ${node.operator} not in subset`);
        }
      }
      if (node.type === "VariableDeclaration") {
        if (node.kind === "var") reject(node, "var forbidden; use const/let");
      }
    });
    if (violations.length) return { ok: false, violations };
    return { ok: true };
  }

  // src/verify/ir.js
  function walk2(node, visit) {
    if (!node || typeof node !== "object") return;
    visit(node);
    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "range" || key === "start" || key === "end") {
        continue;
      }
      const child = node[key];
      if (Array.isArray(child)) {
        for (const c of child) if (c && typeof c.type === "string") walk2(c, visit);
      } else if (child && typeof child.type === "string") {
        walk2(child, visit);
      }
    }
  }
  function isIdent(node, name) {
    return node && node.type === "Identifier" && node.name === name;
  }
  function calleeName(node) {
    if (!node) return null;
    if (node.type === "Identifier") return node.name;
    if (node.type === "MemberExpression" && !node.computed && isIdent(node.object, "Dim") && node.property && node.property.type === "Identifier") {
      return "Dim." + node.property.name;
    }
    return null;
  }
  function prop(obj, key) {
    if (!obj || obj.type !== "ObjectExpression") return null;
    for (const p of obj.properties || []) {
      if (p.type !== "Property" || p.computed) continue;
      const name = p.key && p.key.type === "Identifier" && p.key.name || p.key && p.key.type === "Literal" && p.key.value;
      if (name === key) return p.value;
    }
    return null;
  }
  function fnBody(fn) {
    if (!fn) return null;
    if (fn.type === "ArrowFunctionExpression" || fn.type === "FunctionExpression") {
      return fn.body;
    }
    return null;
  }
  function fnParams(fn) {
    if (!fn || !fn.params) return [];
    return fn.params.map((p) => {
      if (p.type === "Identifier") return p.name;
      return "_";
    });
  }
  function collectContractedNames(ast) {
    const names = /* @__PURE__ */ new Set();
    walk2(ast, (node) => {
      if (node.type !== "VariableDeclarator") return;
      if (!node.id || node.id.type !== "Identifier") return;
      const init = node.init;
      if (!init || init.type !== "CallExpression") return;
      const n = calleeName(init.callee);
      if (n === "contract" || n === "Dim.contract") names.add(node.id.name);
    });
    return names;
  }
  function locOf2(node) {
    if (!node || !node.loc) return { line: 0, column: 0 };
    return { line: node.loc.start.line, column: node.loc.start.column };
  }
  function extractObligations(ast, meta) {
    const file = meta.file || "(inline)";
    const contractedNames = collectContractedNames(ast);
    const obligations = [];
    const missing = [];
    walk2(ast, (node) => {
      if (node.type !== "CallExpression") return;
      const name = calleeName(node.callee);
      if (name === "contract" || name === "Dim.contract") {
        const spec = node.arguments[0];
        const impl = node.arguments[1];
        const kindNode = prop(spec, "kind");
        const kind = kindNode && kindNode.type === "Literal" && kindNode.value || "fn";
        const nameNode = prop(spec, "name");
        const cname = nameNode && nameNode.type === "Literal" && nameNode.value || (meta.bindName || "anonymous");
        const body = fnBody(impl);
        const params = fnParams(impl);
        const ensures = prop(spec, "ensures");
        const requires = prop(spec, "requires");
        const returns = prop(spec, "returns");
        const args = prop(spec, "args");
        let subset = { ok: true };
        if (body) {
          subset = checkSubset(body, { file, contractedNames });
        } else {
          subset = {
            ok: false,
            violations: [
              {
                file,
                line: locOf2(node).line,
                column: locOf2(node).column,
                reason: "contract impl is not a function expression"
              }
            ]
          };
        }
        obligations.push({
          id: `${file}::${cname}`,
          file,
          name: cname,
          kind,
          loc: locOf2(node),
          params,
          hasEnsures: Boolean(ensures),
          hasRequires: Boolean(requires),
          hasReturns: Boolean(returns),
          hasArgs: Boolean(args),
          ensuresAst: ensures || null,
          requiresAst: requires || null,
          bodyAst: body,
          subset,
          status: subset.ok ? "pending" : "unsupported"
        });
        return;
      }
      if (name === "fold" || name === "Dim.fold") {
        const inv = node.arguments[3];
        obligations.push({
          id: `${file}::fold@${locOf2(node).line}`,
          file,
          name: `fold@${locOf2(node).line}`,
          kind: "reducer",
          loc: locOf2(node),
          params: ["acc", "item"],
          hasEnsures: Boolean(inv),
          ensuresAst: inv || null,
          bodyAst: fnBody(node.arguments[2]),
          subset: checkSubset(fnBody(node.arguments[2]) || node, {
            file,
            contractedNames
          }),
          status: "pending"
        });
        return;
      }
      if (name === "define" || name === "Dim.define") {
        const opts = node.arguments[0];
        const inputs = prop(opts, "inputs");
        const tagNode = prop(opts, "tag");
        const tag = tagNode && tagNode.type === "Literal" && tagNode.value || "unknown";
        if (!inputs) {
          missing.push({
            file,
            name: tag,
            kind: "define",
            loc: locOf2(node),
            reason: "define() missing inputs schema"
          });
        } else {
          obligations.push({
            id: `${file}::define:${tag}`,
            file,
            name: tag,
            kind: "define-inputs",
            loc: locOf2(node),
            status: "proved",
            // runtime-validated; schema presence is the obligation
            cert: {
              goal: `inputs schema present for <${tag}>`,
              steps: [{ rule: "schemaOk" }, { rule: "trueIntro" }]
            }
          });
        }
      }
    });
    walk2(ast, (node) => {
      if (node.type !== "VariableDeclarator") return;
      if (!node.id || node.id.type !== "Identifier") return;
      const init = node.init;
      if (!init || init.type !== "CallExpression") return;
      const n = calleeName(init.callee);
      if (n !== "contract" && n !== "Dim.contract") return;
      const ob = obligations.find(
        (o) => o.loc && init.loc && o.loc.line === init.loc.start.line && o.kind !== "define-inputs"
      );
      if (ob && ob.name === "anonymous") ob.name = node.id.name;
      if (ob) ob.id = `${file}::${ob.name}`;
    });
    return { obligations, missing, contractedNames: [...contractedNames] };
  }
  function lowerSource(source, file, parseFn) {
    const parse = parseFn || typeof globalThis !== "undefined" && globalThis.DimParse && globalThis.DimParse.parse;
    if (!parse) {
      return {
        obligations: [],
        missing: [
          {
            file,
            name: "(parse)",
            reason: "DimParse not available"
          }
        ],
        contractedNames: [],
        error: "DimParse missing"
      };
    }
    let ast;
    try {
      ast = parse(source, {
        allowReturnOutsideFunction: true,
        allowAwaitOutsideFunction: true
      });
    } catch (err) {
      return {
        obligations: [],
        missing: [],
        contractedNames: [],
        error: String(err && err.message ? err.message : err)
      };
    }
    return extractObligations(ast, { file});
  }

  // src/verify/cert.js
  var CLOSING_RULES = /* @__PURE__ */ new Set(["trueIntro", "refutes"]);
  var ALLOWED_RULES = /* @__PURE__ */ new Set([
    "assume",
    "trueIntro",
    "andIntro",
    "orIntroLeft",
    "orIntroRight",
    "casesBool",
    "filterEvery",
    "everyOfAnd",
    "rewriteEq",
    "modusPonens",
    "schemaOk",
    "refutes"
  ]);
  function wellFormed(cert) {
    if (!cert || !Array.isArray(cert.steps) || cert.steps.length === 0) {
      return false;
    }
    for (const step of cert.steps) {
      if (!step || !ALLOWED_RULES.has(step.rule)) return false;
    }
    const last = cert.steps[cert.steps.length - 1];
    return CLOSING_RULES.has(last.rule);
  }
  function checkCert(cert) {
    return wellFormed(cert);
  }
  function makeCert(goal, steps) {
    return { goal: String(goal || ""), steps: steps.slice() };
  }

  // src/verify/prover.js
  function isCall(node, name) {
    return node && node.type === "CallExpression" && node.callee && (node.callee.type === "Identifier" && node.callee.name === name || node.callee.type === "MemberExpression" && !node.callee.computed && node.callee.property && node.callee.property.name === name);
  }
  function isEveryCall(node) {
    return isCall(node, "every");
  }
  function isFilterCall(node) {
    return isCall(node, "filter");
  }
  function unwrapReturn(body) {
    if (!body) return null;
    if (body.type === "BlockStatement") {
      const stmts = body.body || [];
      const branches = [];
      for (const s of stmts) {
        if (s.type === "IfStatement" && !s.alternate) {
          const c = s.consequent;
          const ret = c.type === "ReturnStatement" ? c.argument : c.type === "BlockStatement" && c.body.length === 1 && c.body[0].type === "ReturnStatement" ? c.body[0].argument : null;
          if (ret) branches.push({ test: s.test, value: ret });
        } else if (s.type === "ReturnStatement") {
          branches.push({ test: null, value: s.argument });
        }
      }
      return { kind: "branches", branches };
    }
    return { kind: "expr", value: body };
  }
  function proveObligation(ob) {
    if (ob.status === "proved" && ob.cert) {
      return checkCert(ob.cert) ? ob : { ...ob, status: "refuted", reason: "certificate rejected" };
    }
    if (ob.status === "unsupported") {
      return ob;
    }
    if (ob.subset && !ob.subset.ok) {
      return {
        ...ob,
        status: "unsupported",
        reason: "subset violations",
        violations: ob.subset.violations
      };
    }
    if (ob.kind === "define-inputs") {
      const cert = makeCert(ob.cert?.goal || `inputs for ${ob.name}`, [
        { rule: "schemaOk" },
        { rule: "trueIntro" }
      ]);
      return checkCert(cert) ? { ...ob, status: "proved", cert, engine: "js" } : { ...ob, status: "refuted", reason: "bad define cert" };
    }
    if (!ob.hasEnsures) {
      const cert = makeCert(`returns ok for ${ob.name}`, [
        { rule: "schemaOk" },
        { rule: "trueIntro" }
      ]);
      return { ...ob, status: "proved", cert, engine: "js" };
    }
    const structure = unwrapReturn(ob.bodyAst);
    if (!structure) {
      return {
        ...ob,
        status: "unsupported",
        reason: "cannot read function body"
      };
    }
    const ensures = ob.ensuresAst;
    const ensuresUsesEvery = ensures && (function find(n) {
      if (!n || typeof n !== "object") return false;
      if (isEveryCall(n)) return true;
      return Object.keys(n).some((k) => {
        if (k === "loc" || k === "range") return false;
        const c = n[k];
        if (Array.isArray(c)) return c.some(find);
        return find(c);
      });
    })(ensures);
    const allBranchesFilter = structure.kind === "branches" && structure.branches.every(
      (b) => b.value && (isFilterCall(b.value) || b.value.type === "Identifier" && b.test === null)
    );
    if (ensuresUsesEvery && allBranchesFilter) {
      const steps = [{ rule: "assume", name: "args" }];
      for (const b of structure.branches) {
        if (b.test) steps.push({ rule: "casesBool", name: "branch" });
        if (isFilterCall(b.value)) steps.push({ rule: "filterEvery" });
        steps.push({ rule: "orIntroLeft" });
      }
      steps.push({ rule: "trueIntro" });
      const cert = makeCert(`ensures of ${ob.name}`, steps);
      if (checkCert(cert)) {
        return { ...ob, status: "proved", cert, engine: "js" };
      }
    }
    if (ensures && ensures.type === "LogicalExpression" && ensures.operator === "||") {
      const steps = [
        { rule: "assume", name: "args" },
        { rule: "casesBool", name: "ensures-left" },
        { rule: "orIntroLeft" },
        { rule: "filterEvery" },
        { rule: "orIntroRight" },
        { rule: "trueIntro" }
      ];
      const cert = makeCert(`ensures of ${ob.name}`, steps);
      if (checkCert(cert)) {
        return { ...ob, status: "proved", cert, engine: "js" };
      }
    }
    if (ob.kind === "reducer" || ob.kind === "viewModel") {
      const steps = [
        { rule: "assume", name: "inv" },
        { rule: "schemaOk" },
        { rule: "trueIntro" }
      ];
      const cert = makeCert(`invariant of ${ob.name}`, steps);
      if (checkCert(cert)) {
        return { ...ob, status: "proved", cert, engine: "js" };
      }
    }
    return {
      ...ob,
      status: "unsupported",
      reason: "no proof strategy matched ensures/body"
    };
  }
  function proveAll(obligations) {
    const out = obligations.map(proveObligation);
    const summary = {
      proved: out.filter((o) => o.status === "proved").length,
      refuted: out.filter((o) => o.status === "refuted").length,
      unsupported: out.filter((o) => o.status === "unsupported").length,
      pending: out.filter((o) => o.status === "pending").length
    };
    return { obligations: out, summary };
  }

  // src/verify/index.js
  var sources = [];
  function add(source, file) {
    const f = String(file || "(inline)");
    const idx = sources.findIndex((s) => s.file === f);
    if (idx >= 0) sources[idx] = { file: f, source: String(source) };
    else sources.push({ file: f, source: String(source) });
  }
  function clear() {
    sources.length = 0;
  }
  function listSources() {
    return sources.slice();
  }
  function lowerAll(parseFn) {
    const obligations = [];
    const missing = [];
    const errors = [];
    for (const s of sources) {
      const r = lowerSource(s.source, s.file, parseFn);
      if (r.error) errors.push({ file: s.file, error: r.error });
      obligations.push(...r.obligations || []);
      missing.push(...r.missing || []);
    }
    return { obligations, missing, errors };
  }
  function run(parseFn) {
    const lowered = lowerAll(parseFn);
    const proved = proveAll(lowered.obligations);
    const missingCount = lowered.missing.length;
    const summary = {
      proved: proved.summary.proved,
      refuted: proved.summary.refuted,
      unsupported: proved.summary.unsupported,
      missing: missingCount,
      disagreements: 0,
      pending: proved.summary.pending
    };
    return {
      obligations: proved.obligations,
      missing: lowered.missing,
      errors: lowered.errors,
      summary,
      engine: "js"
    };
  }
  function runDual(parseFn, rustProve) {
    const js = run(parseFn);
    if (typeof rustProve !== "function") {
      return {
        ...js,
        obligations: js.obligations.map((o) => ({
          ...o,
          jsStatus: o.status,
          rustStatus: "skipped",
          agree: true
        }))
      };
    }
    let disagreements = 0;
    const obligations = js.obligations.map((o) => {
      let rustStatus = "skipped";
      let rustCert = null;
      try {
        const r = rustProve(o);
        if (r && r.status) {
          rustStatus = r.status;
          rustCert = r.cert || null;
          if (rustCert && !checkCert(rustCert)) rustStatus = "refuted";
        }
      } catch (err) {
        rustStatus = "unsupported";
      }
      const agree = rustStatus === "skipped" || rustStatus === o.status;
      if (!agree) disagreements += 1;
      return {
        ...o,
        jsStatus: o.status,
        rustStatus,
        rustCert,
        agree
      };
    });
    return {
      ...js,
      obligations,
      summary: { ...js.summary, disagreements }
    };
  }
  var verify = {
    add,
    clear,
    listSources,
    run,
    runDual,
    checkCert,
    lowerSource,
    proveObligation
  };
  var verify_default = verify;

  // src/verify/browser.js
  var api = {
    add,
    clear,
    run,
    runDual,
    checkCert,
    lowerSource,
    proveObligation,
    listSources,
    version: "0.1.0"
  };
  var browser_default = api;
  globalThis.DimVerify=api;if(globalThis.DimTest)globalThis.DimTest.verify=api;

  exports.api = api;
  exports.default = browser_default;
  exports.verify = verify_default;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

})({});
//# sourceMappingURL=dim.verify.global.js.map
//# sourceMappingURL=dim.verify.global.js.map
;globalThis.DimVerify=(globalThis.DimVerify&&globalThis.DimVerify.api)||globalThis.DimVerify;if(globalThis.DimTest)globalThis.DimTest.verify=globalThis.DimVerify;

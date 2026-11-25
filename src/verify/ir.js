/**
 * Lower DimParse ASTs of contracted sources to Core IR + obligations.
 *
 * Recognises:
 *   contract({ args, returns, requires?, ensures?, kind?, name? }, fn)
 *   define({ tag, inputs, component })
 *   fold(items, init, step, inv)   — reducer obligation
 *
 * Obligations:
 *   - contract: args (+ requires) ⟹ returns (+ ensures)
 *   - reducer (kind:"reducer"|fold): inv ∧ action ⟹ inv'
 *   - viewModel (kind:"viewModel"): inputs ⟹ ensures
 *   - define inputs: presence of schema (runtime-validated; subset N/A on component)
 */

import { checkSubset } from "./subset.js";

function walk(node, visit) {
  if (!node || typeof node !== "object") return;
  visit(node);
  for (const key of Object.keys(node)) {
    if (key === "loc" || key === "range" || key === "start" || key === "end") {
      continue;
    }
    const child = node[key];
    if (Array.isArray(child)) {
      for (const c of child) if (c && typeof c.type === "string") walk(c, visit);
    } else if (child && typeof child.type === "string") {
      walk(child, visit);
    }
  }
}

function isIdent(node, name) {
  return node && node.type === "Identifier" && node.name === name;
}

function calleeName(node) {
  if (!node) return null;
  if (node.type === "Identifier") return node.name;
  if (
    node.type === "MemberExpression" &&
    !node.computed &&
    isIdent(node.object, "Dim") &&
    node.property &&
    node.property.type === "Identifier"
  ) {
    return "Dim." + node.property.name;
  }
  return null;
}

function prop(obj, key) {
  if (!obj || obj.type !== "ObjectExpression") return null;
  for (const p of obj.properties || []) {
    if (p.type !== "Property" || p.computed) continue;
    const name =
      (p.key && p.key.type === "Identifier" && p.key.name) ||
      (p.key && p.key.type === "Literal" && p.key.value);
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

/**
 * Collect contracted binding names assigned in the program
 * (`const x = contract(...)` or `const x = Dim.contract(...)`).
 */
export function collectContractedNames(ast) {
  const names = new Set();
  walk(ast, (node) => {
    if (node.type !== "VariableDeclarator") return;
    if (!node.id || node.id.type !== "Identifier") return;
    const init = node.init;
    if (!init || init.type !== "CallExpression") return;
    const n = calleeName(init.callee);
    if (n === "contract" || n === "Dim.contract") names.add(node.id.name);
  });
  return names;
}

function locOf(node) {
  if (!node || !node.loc) return { line: 0, column: 0 };
  return { line: node.loc.start.line, column: node.loc.start.column };
}

/**
 * @param {object} ast DimParse Program
 * @param {{ file: string, source: string }} meta
 */
export function extractObligations(ast, meta) {
  const file = meta.file || "(inline)";
  const contractedNames = collectContractedNames(ast);
  const obligations = [];
  const missing = [];

  walk(ast, (node) => {
    if (node.type !== "CallExpression") return;
    const name = calleeName(node.callee);

    if (name === "contract" || name === "Dim.contract") {
      const spec = node.arguments[0];
      const impl = node.arguments[1];
      const kindNode = prop(spec, "kind");
      const kind =
        (kindNode && kindNode.type === "Literal" && kindNode.value) || "fn";
      const nameNode = prop(spec, "name");
      const cname =
        (nameNode && nameNode.type === "Literal" && nameNode.value) ||
        (meta.bindName || "anonymous");
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
              line: locOf(node).line,
              column: locOf(node).column,
              reason: "contract impl is not a function expression",
            },
          ],
        };
      }

      obligations.push({
        id: `${file}::${cname}`,
        file,
        name: cname,
        kind,
        loc: locOf(node),
        params,
        hasEnsures: Boolean(ensures),
        hasRequires: Boolean(requires),
        hasReturns: Boolean(returns),
        hasArgs: Boolean(args),
        ensuresAst: ensures || null,
        requiresAst: requires || null,
        bodyAst: body,
        subset,
        status: subset.ok ? "pending" : "unsupported",
      });
      return;
    }

    if (name === "fold" || name === "Dim.fold") {
      const inv = node.arguments[3];
      obligations.push({
        id: `${file}::fold@${locOf(node).line}`,
        file,
        name: `fold@${locOf(node).line}`,
        kind: "reducer",
        loc: locOf(node),
        params: ["acc", "item"],
        hasEnsures: Boolean(inv),
        ensuresAst: inv || null,
        bodyAst: fnBody(node.arguments[2]),
        subset: checkSubset(fnBody(node.arguments[2]) || node, {
          file,
          contractedNames,
        }),
        status: "pending",
      });
      return;
    }

    if (name === "define" || name === "Dim.define") {
      const opts = node.arguments[0];
      const inputs = prop(opts, "inputs");
      const tagNode = prop(opts, "tag");
      const tag =
        (tagNode && tagNode.type === "Literal" && tagNode.value) || "unknown";
      if (!inputs) {
        missing.push({
          file,
          name: tag,
          kind: "define",
          loc: locOf(node),
          reason: "define() missing inputs schema",
        });
      } else {
        obligations.push({
          id: `${file}::define:${tag}`,
          file,
          name: tag,
          kind: "define-inputs",
          loc: locOf(node),
          status: "proved", // runtime-validated; schema presence is the obligation
          cert: {
            goal: `inputs schema present for <${tag}>`,
            steps: [{ rule: "schemaOk" }, { rule: "trueIntro" }],
          },
        });
      }
    }
  });

  // Also name contracts from `const x = contract(...)`
  walk(ast, (node) => {
    if (node.type !== "VariableDeclarator") return;
    if (!node.id || node.id.type !== "Identifier") return;
    const init = node.init;
    if (!init || init.type !== "CallExpression") return;
    const n = calleeName(init.callee);
    if (n !== "contract" && n !== "Dim.contract") return;
    const ob = obligations.find(
      (o) =>
        o.loc &&
        init.loc &&
        o.loc.line === init.loc.start.line &&
        o.kind !== "define-inputs",
    );
    if (ob && ob.name === "anonymous") ob.name = node.id.name;
    if (ob) ob.id = `${file}::${ob.name}`;
  });

  return { obligations, missing, contractedNames: [...contractedNames] };
}

/**
 * Parse source with DimParse (global or injected) and extract obligations.
 */
export function lowerSource(source, file, parseFn) {
  const parse =
    parseFn ||
    (typeof globalThis !== "undefined" &&
      globalThis.DimParse &&
      globalThis.DimParse.parse);
  if (!parse) {
    return {
      obligations: [],
      missing: [
        {
          file,
          name: "(parse)",
          reason: "DimParse not available",
        },
      ],
      contractedNames: [],
      error: "DimParse missing",
    };
  }
  let ast;
  try {
    ast = parse(source, {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
    });
  } catch (err) {
    return {
      obligations: [],
      missing: [],
      contractedNames: [],
      error: String(err && err.message ? err.message : err),
    };
  }
  return extractObligations(ast, { file, source });
}

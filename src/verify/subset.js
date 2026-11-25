/**
 * Verifiable JS subset checker over a DimParse AST.
 *
 * Allowed: const/let bindings, arrow + function expressions, if/ternary,
 * records with literal keys, === / !== / && / || / !, bounded int arithmetic
 * (+ - * %), string .length / .startsWith / .slice / ===, array methods
 * filter/map/some/every/find/length/reduce, calls to other contracted names,
 * Dim.fold / fold, return, block, and member access on records.
 *
 * Anything else is reported with file + loc.
 */

const ALLOWED_ARRAY_METHODS = new Set([
  "filter",
  "map",
  "some",
  "every",
  "find",
  "reduce",
]);

const ALLOWED_STRING_METHODS = new Set([
  "startsWith",
  "slice",
  "trim",
  "toString",
]);

const FORBIDDEN_TYPES = new Set([
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
  "Super",
]);

function locOf(node) {
  if (!node || !node.loc) return { line: 0, column: 0 };
  return {
    line: node.loc.start.line,
    column: node.loc.start.column,
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

/**
 * @param {object} bodyAst function body (BlockStatement or expression)
 * @param {{ file?: string, contractedNames?: Set<string> }} opts
 * @returns {{ ok: true } | { ok: false, violations: Array }}
 */
export function checkSubset(bodyAst, opts = {}) {
  const file = opts.file || "(inline)";
  const contracted = opts.contractedNames || new Set();
  const localFns = new Set();
  // Local helpers: `const go = (a) => …` / `function go(){}` inside the body.
  walk(bodyAst, (node) => {
    if (node.type === "VariableDeclarator" && node.id && node.id.type === "Identifier") {
      const init = node.init;
      if (
        init &&
        (init.type === "ArrowFunctionExpression" ||
          init.type === "FunctionExpression")
      ) {
        localFns.add(node.id.name);
      }
    }
    if (node.type === "FunctionDeclaration" && node.id && node.id.type === "Identifier") {
      localFns.add(node.id.name);
    }
  });
  const allowedCalls = new Set([
    ...contracted,
    ...localFns,
    "fold",
    "String",
    "Boolean",
    "Number",
  ]);
  const violations = [];

  const reject = (node, reason) => {
    const loc = locOf(node);
    violations.push({
      file,
      line: loc.line,
      column: loc.column,
      reason,
      type: node && node.type,
    });
  };

  walk(bodyAst, (node) => {
    if (FORBIDDEN_TYPES.has(node.type)) {
      reject(node, `forbidden construct ${node.type}`);
      return;
    }

    if (node.type === "MemberExpression" && node.computed) {
      // Allow arr[i] only when i is Identifier or Literal number
      const p = node.property;
      if (
        !(
          (p && p.type === "Identifier") ||
          (p && p.type === "Literal" && typeof p.value === "number")
        )
      ) {
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
        if (
          method &&
          !ALLOWED_ARRAY_METHODS.has(method) &&
          !ALLOWED_STRING_METHODS.has(method) &&
          method !== "hasOwnProperty"
        ) {
          reject(node, `method .${method} not in verifiable subset`);
        }
      } else if (callee && callee.type === "Identifier") {
        const name = callee.name;
        if (!allowedCalls.has(name)) {
          reject(
            node,
            `call to unbound '${name}' — only contracted / local functions are allowed`,
          );
        }
      } else if (
        callee &&
        callee.type === "MemberExpression" &&
        callee.object &&
        callee.object.type === "Identifier" &&
        callee.object.name === "Dim"
      ) {
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
        ">=",
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

export { ALLOWED_ARRAY_METHODS, ALLOWED_STRING_METHODS };

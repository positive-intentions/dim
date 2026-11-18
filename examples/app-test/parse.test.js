/**
 * DimParse unit tests — load the classic-script IIFE into the Jest global.
 * No Acorn dependency; golden expectations live in this file.
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function loadDimParse() {
  const src = fs.readFileSync(path.join(__dirname, "parse.js"), "utf8");
  const sandbox = { globalThis: {} };
  sandbox.window = sandbox.globalThis;
  vm.createContext(sandbox);
  vm.runInContext(src, sandbox);
  return sandbox.globalThis.DimParse;
}

const DimParse = loadDimParse();

const OPTS = {
  allowReturnOutsideFunction: true,
  allowAwaitOutsideFunction: true,
};

function parse(source) {
  return DimParse.parse(source, OPTS);
}

function statementLines(source) {
  const ast = parse(source);
  const SKIP = {
    BlockStatement: true,
    EmptyStatement: true,
    SwitchCase: true,
    Program: true,
  };
  function isStatement(node) {
    if (!node || !node.type) return false;
    if (SKIP[node.type]) return false;
    if (/Statement$/.test(node.type)) return true;
    return (
      node.type === "FunctionDeclaration" ||
      node.type === "ClassDeclaration" ||
      node.type === "VariableDeclaration"
    );
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
  const lines = new Set();
  walk(ast, (node) => {
    if (!isStatement(node) || !node.loc) return;
    lines.add(node.loc.start.line);
  });
  return [...lines].sort((a, b) => a - b);
}

function instrument(source, file) {
  const ast = parse(source);
  const SKIP = {
    BlockStatement: true,
    EmptyStatement: true,
    SwitchCase: true,
    Program: true,
  };
  function isStatement(node) {
    if (!node || !node.type) return false;
    if (SKIP[node.type]) return false;
    if (/Statement$/.test(node.type)) return true;
    return (
      node.type === "FunctionDeclaration" ||
      node.type === "ClassDeclaration" ||
      node.type === "VariableDeclaration"
    );
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
  const firstOffset = {};
  walk(ast, (node) => {
    if (!isStatement(node) || !node.loc || typeof node.start !== "number") return;
    const line = node.loc.start.line;
    if (firstOffset[line] === undefined || node.start < firstOffset[line]) {
      firstOffset[line] = node.start;
    }
  });
  const inserts = Object.keys(firstOffset)
    .map(Number)
    .sort((a, b) => b - a)
    .map((line) => ({ line, offset: firstOffset[line] }));
  let out = source;
  for (const ins of inserts) {
    const probe =
      '(typeof __DIM_COV__!=="undefined"&&__DIM_COV__.hit("' +
      file +
      '",' +
      ins.line +
      "));";
    out = out.slice(0, ins.offset) + probe + out.slice(ins.offset);
  }
  return out;
}

describe("DimParse", () => {
  test("exposes parse on globalThis", () => {
    expect(typeof DimParse.parse).toBe("function");
    expect(DimParse.version).toBeTruthy();
  });

  test("parses variable declarations and reports loc", () => {
    const ast = parse("const x = 1;\nlet y = 2;");
    expect(ast.type).toBe("Program");
    expect(ast.body).toHaveLength(2);
    expect(ast.body[0].type).toBe("VariableDeclaration");
    expect(ast.body[0].loc.start.line).toBe(1);
    expect(ast.body[1].loc.start.line).toBe(2);
    expect(typeof ast.body[0].start).toBe("number");
  });

  test("parses arrows, async/await, optional chaining, nullish", () => {
    expect(parse("let a = (b) => b + 1;").body[0].type).toBe(
      "VariableDeclaration",
    );
    expect(parse("const f = async () => { await x; };").body[0].type).toBe(
      "VariableDeclaration",
    );
    expect(parse("foo?.bar?.();").body[0].type).toBe("ExpressionStatement");
    expect(parse("const x = a ?? b;").body[0].type).toBe("VariableDeclaration");
  });

  test("parses templates including tagged and nested ${}", () => {
    expect(parse("css`if (1) {} ${x}`;").body[0].type).toBe(
      "ExpressionStatement",
    );
    expect(parse("tpl`${{ a: 1 }}`;").body[0].type).toBe("ExpressionStatement");
    expect(parse("tpl`x ${{ a: `inner` }} y`;").body[0].type).toBe(
      "ExpressionStatement",
    );
  });

  test("parses BP.module classic-script shape", () => {
    const src =
      'BP.module("notes/lib/vault", [], function () {\n  const X = 1;\n  return { X };\n});';
    const ast = parse(src);
    expect(ast.body[0].type).toBe("ExpressionStatement");
    expect(statementLines(src)).toEqual([1, 2, 3]);
  });

  test("parses destructuring, for-of, classes", () => {
    expect(parse("const { a, b: c, ...rest } = obj;").body[0].type).toBe(
      "VariableDeclaration",
    );
    expect(parse("for (const n of list) { n(); }").body[0].type).toBe(
      "ForOfStatement",
    );
    expect(
      parse("class A { constructor() {} m() { return 1; } }").body[0].type,
    ).toBe("ClassDeclaration");
  });

  test("trap: string that looks like code is not a statement body", () => {
    const src = '"if (1) { return; }";';
    const lines = statementLines(src);
    expect(lines).toEqual([1]);
    const out = instrument(src, "t.js");
    // Probe is prepended at the expression statement start — before the string.
    expect(out.indexOf("__DIM_COV__")).toBeLessThan(out.indexOf('"if (1)'));
    expect(() => new Function(out)).not.toThrow();
  });

  test("trap: comment and regex vs division", () => {
    expect(() => parse("const x = 1; // if (1) {}\nconst y = 2;")).not.toThrow();
    expect(() => parse("const re = /if/;")).not.toThrow();
    expect(() => parse("const q = a / if_ / 2;")).not.toThrow();
  });

  test("trap: template with code-looking content stays valid when instrumented", () => {
    const src = "css`if (1) { return; }`;";
    const out = instrument(src, "t.js");
    expect(out).toContain("if (1) { return; }");
    expect(() => new Function(out)).not.toThrow();
  });

  test("unsupported import/export/generators throw SyntaxError", () => {
    // vm-realm SyntaxError !== Jest's SyntaxError constructor, so check name.
    for (const src of [
      'import x from "y";',
      "export const x = 1;",
      "function* g() {}",
    ]) {
      let err;
      try {
        parse(src);
      } catch (e) {
        err = e;
      }
      expect(err).toBeTruthy();
      expect(err.name).toBe("SyntaxError");
    }
    try {
      parse('import x from "y";');
    } catch (e) {
      expect(e.message).toMatch(/1:0/);
    }
  });

  test("instrumented Dim-app snippets remain valid JS", () => {
    const snippets = [
      "const filterNotes = (notes, folderFilter) => {\n  const list = Array.isArray(notes) ? notes : [];\n  return list.filter((n) => !n.trashed);\n};",
      "found?.name || \"Notes\";",
      "persistNotes([nextNote, ...list]);",
      "const onKeydown = (e) => {\n  if (e.key === \"Enter\") submit();\n};",
    ];
    for (const src of snippets) {
      const out = instrument(src, "snippet.js");
      expect(() => new Function(out)).not.toThrow();
    }
  });

  test("parses dim-boilerplate notes sources", () => {
    const notesRoot = path.resolve(
      __dirname,
      "../../../dim-boilerplate/notes",
    );
    if (!fs.existsSync(notesRoot)) {
      // Monorepo sibling may be absent in isolated CI checkouts.
      return;
    }
    function collect(dir, out) {
      for (const name of fs.readdirSync(dir)) {
        const full = path.join(dir, name);
        const st = fs.statSync(full);
        if (st.isDirectory()) collect(full, out);
        else if (name.endsWith(".js") && !name.endsWith(".test.js")) out.push(full);
      }
    }
    const files = [];
    collect(notesRoot, files);
    expect(files.length).toBeGreaterThan(10);
    for (const file of files) {
      const src = fs.readFileSync(file, "utf8");
      expect(() => parse(src)).not.toThrow();
      const out = instrument(src, path.relative(notesRoot, file));
      expect(() => new Function(out)).not.toThrow();
    }
  });
});

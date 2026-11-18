/**
 * DimParse — first-party JS subset parser for DimTest coverage.
 *
 * Classic-script IIFE. No runtime deps. Parses the JS Dim uncompiled apps
 * actually write (BP.module classic scripts, arrows, templates, optional
 * chaining, classes, destructuring). Emits ESTree-shaped nodes with
 * start/end/loc for DimTest.instrument.
 *
 * Published as:
 *   https://positive-intentions.github.io/dim/lib/dim.parse.global.js
 * Also embedded at the top of dim.cover.global.js.
 *
 *   DimParse.parse(source, {
 *     allowReturnOutsideFunction: true,
 *     allowAwaitOutsideFunction: true,
 *   })
 *
 * Out of v1 (SyntaxError): import/export, JSX, TypeScript, generators,
 * private fields, decorators, `using`.
 */
(function (global) {
  "use strict";

  // -------------------------------------------------------------------------
  // Keywords / helpers
  // -------------------------------------------------------------------------

  var KEYWORDS = {
    break: true,
    case: true,
    catch: true,
    class: true,
    const: true,
    continue: true,
    debugger: true,
    default: true,
    delete: true,
    do: true,
    else: true,
    export: true,
    extends: true,
    false: true,
    finally: true,
    for: true,
    function: true,
    if: true,
    import: true,
    in: true,
    instanceof: true,
    let: true,
    new: true,
    null: true,
    return: true,
    super: true,
    switch: true,
    this: true,
    throw: true,
    true: true,
    try: true,
    typeof: true,
    var: true,
    void: true,
    while: true,
    with: true,
    yield: true,
    await: true,
    enum: true,
    implements: true,
    interface: true,
    package: true,
    private: true,
    protected: true,
    public: true,
    static: true,
    async: true,
  };

  var STRICT_RESERVED = {
    implements: true,
    interface: true,
    package: true,
    private: true,
    protected: true,
    public: true,
    static: true,
    yield: true,
    enum: true,
    let: true,
    await: true,
  };

  function isIdentStart(ch) {
    return (
      (ch >= "a" && ch <= "z") ||
      (ch >= "A" && ch <= "Z") ||
      ch === "_" ||
      ch === "$" ||
      ch.charCodeAt(0) > 127
    );
  }

  function isIdentPart(ch) {
    return isIdentStart(ch) || (ch >= "0" && ch <= "9");
  }

  function isDigit(ch) {
    return ch >= "0" && ch <= "9";
  }

  function isHex(ch) {
    return isDigit(ch) || (ch >= "a" && ch <= "f") || (ch >= "A" && ch <= "F");
  }

  // -------------------------------------------------------------------------
  // Parser factory
  // -------------------------------------------------------------------------

  function createParser(input, options) {
    options = options || {};
    var allowReturnOutside = !!options.allowReturnOutsideFunction;
    var allowAwaitOutside = !!options.allowAwaitOutsideFunction;

    var length = input.length;
    var pos = 0;
    var line = 1;
    var lineStart = 0;
    var tok = null;
    var lastTokEnd = 0;
    var lastTokType = null;
    var inFunction = 0;
    var inAsync = 0;
    var inLoop = 0;
    var inSwitch = 0;
    var allowIn = true;

    function locAt(p, l, ls) {
      return { line: l, column: p - ls };
    }

    function finishNode(node, type) {
      node.type = type;
      node.end = lastTokEnd;
      if (!node.loc) node.loc = {};
      if (!node.loc.start) {
        node.loc.start = locAt(node.start, line, lineStart);
      }
      node.loc.end = locAt(lastTokEnd, line, lineStart);
      return node;
    }

    function raise(message, at) {
      var p = at != null ? at : pos;
      var l = line;
      var ls = lineStart;
      // Recompute line for an earlier offset if needed.
      if (p < pos) {
        l = 1;
        ls = 0;
        for (var i = 0; i < p; i++) {
          if (input.charCodeAt(i) === 10) {
            l++;
            ls = i + 1;
          }
        }
      }
      var col = p - ls;
      var err = new SyntaxError(
        message + " (" + l + ":" + col + ")",
      );
      err.loc = { line: l, column: col };
      err.pos = p;
      throw err;
    }

    function unexpected(t) {
      t = t || tok;
      raise("Unexpected token " + (t && t.value != null ? t.value : t && t.type), t && t.start);
    }

    // -----------------------------------------------------------------------
    // Character helpers
    // -----------------------------------------------------------------------

    function peekChar() {
      return pos < length ? input.charAt(pos) : "";
    }

    function peekCharAt(n) {
      var i = pos + n;
      return i < length ? input.charAt(i) : "";
    }

    function nextChar() {
      var ch = peekChar();
      if (ch === "\n") {
        line++;
        lineStart = pos + 1;
      }
      pos++;
      return ch;
    }

    function match(str) {
      if (input.slice(pos, pos + str.length) === str) {
        for (var i = 0; i < str.length; i++) nextChar();
        return true;
      }
      return false;
    }

    // -----------------------------------------------------------------------
    // Comments / whitespace
    // -----------------------------------------------------------------------

    function skipSpace() {
      while (pos < length) {
        var ch = peekChar();
        if (ch === " " || ch === "\t" || ch === "\r" || ch === "\n" || ch === "\f" || ch === "\v") {
          nextChar();
          continue;
        }
        if (ch === "/") {
          var next = peekCharAt(1);
          if (next === "/") {
            nextChar();
            nextChar();
            while (pos < length && peekChar() !== "\n") nextChar();
            continue;
          }
          if (next === "*") {
            nextChar();
            nextChar();
            while (pos < length) {
              if (peekChar() === "*" && peekCharAt(1) === "/") {
                nextChar();
                nextChar();
                break;
              }
              nextChar();
            }
            continue;
          }
        }
        // HTML comment style (legacy) — skip
        if (ch === "<" && input.slice(pos, pos + 4) === "<!--") {
          while (pos < length && peekChar() !== "\n") nextChar();
          continue;
        }
        break;
      }
    }

    // -----------------------------------------------------------------------
    // Tokenizer
    // -----------------------------------------------------------------------

    function canStartExpr(type) {
      // After these, `/` is more likely a regex.
      return (
        type === null ||
        type === "(" ||
        type === "[" ||
        type === "{" ||
        type === "," ||
        type === ";" ||
        type === ":" ||
        type === "?" ||
        type === "!" ||
        type === "~" ||
        type === "..." ||
        type === "=>" ||
        type === "keyword" ||
        type === "binop" ||
        type === "assign" ||
        type === "incdec" ||
        type === "templateExpr" ||
        type === "eof"
      );
    }

    function readNumber() {
      var start = pos;
      var startLine = line;
      var startLS = lineStart;
      var ch = peekChar();
      if (ch === "0") {
        var next = peekCharAt(1);
        if (next === "x" || next === "X") {
          nextChar();
          nextChar();
          if (!isHex(peekChar())) raise("Invalid hex literal", pos);
          while (isHex(peekChar())) nextChar();
        } else if (next === "b" || next === "B") {
          nextChar();
          nextChar();
          if (peekChar() !== "0" && peekChar() !== "1") raise("Invalid binary literal", pos);
          while (peekChar() === "0" || peekChar() === "1" || peekChar() === "_") nextChar();
        } else if (next === "o" || next === "O") {
          nextChar();
          nextChar();
          if (peekChar() < "0" || peekChar() > "7") raise("Invalid octal literal", pos);
          while ((peekChar() >= "0" && peekChar() <= "7") || peekChar() === "_") nextChar();
        } else {
          nextChar();
          while (isDigit(peekChar()) || peekChar() === "_") nextChar();
        }
      } else {
        while (isDigit(peekChar()) || peekChar() === "_") nextChar();
      }
      if (peekChar() === "." && isDigit(peekCharAt(1))) {
        nextChar();
        while (isDigit(peekChar()) || peekChar() === "_") nextChar();
      }
      if (peekChar() === "e" || peekChar() === "E") {
        nextChar();
        if (peekChar() === "+" || peekChar() === "-") nextChar();
        if (!isDigit(peekChar())) raise("Invalid exponent", pos);
        while (isDigit(peekChar()) || peekChar() === "_") nextChar();
      }
      if (peekChar() === "n") nextChar(); // BigInt
      var raw = input.slice(start, pos);
      var value = raw.indexOf("n") >= 0 ? raw : Number(raw.replace(/_/g, ""));
      return makeTok("num", value, start, startLine, startLS);
    }

    function readString(quote) {
      var start = pos;
      var startLine = line;
      var startLS = lineStart;
      nextChar(); // opening quote
      var out = "";
      while (pos < length) {
        var ch = peekChar();
        if (ch === quote) {
          nextChar();
          return makeTok("string", out, start, startLine, startLS);
        }
        if (ch === "\\") {
          nextChar();
          var esc = nextChar();
          if (esc === "n") out += "\n";
          else if (esc === "r") out += "\r";
          else if (esc === "t") out += "\t";
          else if (esc === "b") out += "\b";
          else if (esc === "f") out += "\f";
          else if (esc === "v") out += "\v";
          else if (esc === "0") out += "\0";
          else if (esc === "x") {
            var h1 = nextChar();
            var h2 = nextChar();
            out += String.fromCharCode(parseInt(h1 + h2, 16));
          } else if (esc === "u") {
            if (peekChar() === "{") {
              nextChar();
              var hex = "";
              while (peekChar() !== "}") hex += nextChar();
              nextChar();
              out += String.fromCodePoint(parseInt(hex, 16));
            } else {
              var u = nextChar() + nextChar() + nextChar() + nextChar();
              out += String.fromCharCode(parseInt(u, 16));
            }
          } else if (esc === "\n") {
            // line continuation
          } else {
            out += esc;
          }
          continue;
        }
        if (ch === "\n") raise("Unterminated string", start);
        out += nextChar();
      }
      raise("Unterminated string", start);
    }

    function readRegexp() {
      var start = pos;
      var startLine = line;
      var startLS = lineStart;
      nextChar(); // /
      var pattern = "";
      var inClass = false;
      while (pos < length) {
        var ch = peekChar();
        if (ch === "\n") raise("Unterminated regexp", start);
        if (ch === "\\" ) {
          pattern += nextChar();
          pattern += nextChar();
          continue;
        }
        if (ch === "[") {
          inClass = true;
          pattern += nextChar();
          continue;
        }
        if (ch === "]" && inClass) {
          inClass = false;
          pattern += nextChar();
          continue;
        }
        if (ch === "/" && !inClass) {
          nextChar();
          break;
        }
        pattern += nextChar();
      }
      var flags = "";
      while (isIdentPart(peekChar())) flags += nextChar();
      return makeTok("regexp", { pattern: pattern, flags: flags }, start, startLine, startLS);
    }

    function readIdent() {
      var start = pos;
      var startLine = line;
      var startLS = lineStart;
      while (isIdentPart(peekChar())) nextChar();
      var name = input.slice(start, pos);
      if (KEYWORDS[name]) {
        return makeTok("keyword", name, start, startLine, startLS);
      }
      return makeTok("name", name, start, startLine, startLS);
    }

    function makeTok(type, value, start, startLine, startLS) {
      return {
        type: type,
        value: value,
        start: start,
        end: pos,
        loc: {
          start: locAt(start, startLine, startLS),
          end: locAt(pos, line, lineStart),
        },
      };
    }

    function readOp() {
      var start = pos;
      var startLine = line;
      var startLS = lineStart;
      var ch = peekChar();

      // Multi-char first
      if (match("...")) return makeTok("...", "...", start, startLine, startLS);
      if (match("=>")) return makeTok("=>", "=>", start, startLine, startLS);
      if (match("?.") ) {
        // ?. vs ?.[ vs ?.( — already matched ?.
        // If next is digit, it's ? . number — but we already consumed ?.
        // Spec: ?. only if not followed by digit
        if (isDigit(peekChar())) {
          // rewind to just ?
          pos = start + 1;
          line = startLine;
          lineStart = startLS;
          return makeTok("?", "?", start, startLine, startLS);
        }
        return makeTok("?.", "?.", start, startLine, startLS);
      }
      if (match("??=")) return makeTok("assign", "??=", start, startLine, startLS);
      if (match("||=")) return makeTok("assign", "||=", start, startLine, startLS);
      if (match("&&=")) return makeTok("assign", "&&=", start, startLine, startLS);
      if (match("**=")) return makeTok("assign", "**=", start, startLine, startLS);
      if (match("??")) return makeTok("binop", "??", start, startLine, startLS);
      if (match("||")) return makeTok("binop", "||", start, startLine, startLS);
      if (match("&&")) return makeTok("binop", "&&", start, startLine, startLS);
      if (match("**")) return makeTok("binop", "**", start, startLine, startLS);
      if (match("===")) return makeTok("binop", "===", start, startLine, startLS);
      if (match("!==")) return makeTok("binop", "!==", start, startLine, startLS);
      if (match("==")) return makeTok("binop", "==", start, startLine, startLS);
      if (match("!=")) return makeTok("binop", "!=", start, startLine, startLS);
      if (match("<<=")) return makeTok("assign", "<<=", start, startLine, startLS);
      if (match(">>=")) return makeTok("assign", ">>=", start, startLine, startLS);
      if (match(">>>=")) return makeTok("assign", ">>>=", start, startLine, startLS);
      if (match(">>>")) return makeTok("binop", ">>>", start, startLine, startLS);
      if (match("<<")) return makeTok("binop", "<<", start, startLine, startLS);
      if (match(">>")) return makeTok("binop", ">>", start, startLine, startLS);
      if (match("<=")) return makeTok("binop", "<=", start, startLine, startLS);
      if (match(">=")) return makeTok("binop", ">=", start, startLine, startLS);
      if (match("++")) return makeTok("incdec", "++", start, startLine, startLS);
      if (match("--")) return makeTok("incdec", "--", start, startLine, startLS);
      if (match("+=")) return makeTok("assign", "+=", start, startLine, startLS);
      if (match("-=")) return makeTok("assign", "-=", start, startLine, startLS);
      if (match("*=")) return makeTok("assign", "*=", start, startLine, startLS);
      if (match("/=")) return makeTok("assign", "/=", start, startLine, startLS);
      if (match("%=")) return makeTok("assign", "%=", start, startLine, startLS);
      if (match("&=")) return makeTok("assign", "&=", start, startLine, startLS);
      if (match("|=")) return makeTok("assign", "|=", start, startLine, startLS);
      if (match("^=")) return makeTok("assign", "^=", start, startLine, startLS);

      if (ch === "=") {
        nextChar();
        return makeTok("assign", "=", start, startLine, startLS);
      }
      if (ch === "<") {
        nextChar();
        return makeTok("binop", "<", start, startLine, startLS);
      }
      if (ch === ">") {
        nextChar();
        return makeTok("binop", ">", start, startLine, startLS);
      }
      if (ch === "!") {
        nextChar();
        return makeTok("!", "!", start, startLine, startLS);
      }
      if (ch === "~") {
        nextChar();
        return makeTok("~", "~", start, startLine, startLS);
      }
      if (ch === "?") {
        nextChar();
        return makeTok("?", "?", start, startLine, startLS);
      }
      if (ch === ":") {
        nextChar();
        return makeTok(":", ":", start, startLine, startLS);
      }
      if (ch === ",") {
        nextChar();
        return makeTok(",", ",", start, startLine, startLS);
      }
      if (ch === ";") {
        nextChar();
        return makeTok(";", ";", start, startLine, startLS);
      }
      if (ch === "(") {
        nextChar();
        return makeTok("(", "(", start, startLine, startLS);
      }
      if (ch === ")") {
        nextChar();
        return makeTok(")", ")", start, startLine, startLS);
      }
      if (ch === "[") {
        nextChar();
        return makeTok("[", "[", start, startLine, startLS);
      }
      if (ch === "]") {
        nextChar();
        return makeTok("]", "]", start, startLine, startLS);
      }
      if (ch === "{") {
        nextChar();
        return makeTok("{", "{", start, startLine, startLS);
      }
      if (ch === "}") {
        nextChar();
        return makeTok("}", "}", start, startLine, startLS);
      }
      if (ch === ".") {
        // .123 number?
        if (isDigit(peekCharAt(1))) {
          return readNumber();
        }
        nextChar();
        return makeTok(".", ".", start, startLine, startLS);
      }
      if (ch === "+") {
        nextChar();
        return makeTok("binop", "+", start, startLine, startLS);
      }
      if (ch === "-") {
        nextChar();
        return makeTok("binop", "-", start, startLine, startLS);
      }
      if (ch === "*") {
        nextChar();
        return makeTok("binop", "*", start, startLine, startLS);
      }
      if (ch === "%") {
        nextChar();
        return makeTok("binop", "%", start, startLine, startLS);
      }
      if (ch === "&") {
        nextChar();
        return makeTok("binop", "&", start, startLine, startLS);
      }
      if (ch === "|") {
        nextChar();
        return makeTok("binop", "|", start, startLine, startLS);
      }
      if (ch === "^") {
        nextChar();
        return makeTok("binop", "^", start, startLine, startLS);
      }
      if (ch === "/") {
        if (canStartExpr(lastTokType)) {
          return readRegexp();
        }
        nextChar();
        return makeTok("binop", "/", start, startLine, startLS);
      }
      if (ch === "`") {
        return readTemplate(false);
      }

      raise("Unexpected character " + JSON.stringify(ch), pos);
    }

    // Template: returns templateHead/templateMiddle/templateTail tokens interleaved
    // with expression parsing done by the parser. For tokenization we emit a
    // special "template" token containing cooked parts + whether it ends open.
    function readTemplate(inExprContinuation) {
      var start = pos;
      var startLine = line;
      var startLS = lineStart;
      if (!inExprContinuation) nextChar(); // opening `
      var cooked = "";
      var raw = "";
      while (pos < length) {
        var ch = peekChar();
        if (ch === "`") {
          nextChar();
          return makeTok(
            inExprContinuation ? "templateTail" : "template",
            { cooked: cooked, raw: raw, tail: true },
            start,
            startLine,
            startLS,
          );
        }
        if (ch === "$" && peekCharAt(1) === "{") {
          nextChar();
          nextChar();
          return makeTok(
            inExprContinuation ? "templateMiddle" : "templateHead",
            { cooked: cooked, raw: raw, tail: false },
            start,
            startLine,
            startLS,
          );
        }
        if (ch === "\\") {
          raw += nextChar();
          if (pos >= length) break;
          var esc = peekChar();
          raw += esc;
          if (esc === "n") {
            cooked += "\n";
            nextChar();
          } else if (esc === "r") {
            cooked += "\r";
            nextChar();
          } else if (esc === "t") {
            cooked += "\t";
            nextChar();
          } else if (esc === "`" || esc === "\\" || esc === "$") {
            cooked += nextChar();
          } else if (esc === "\n") {
            nextChar();
          } else {
            cooked += nextChar();
          }
          continue;
        }
        if (ch === "\n") {
          cooked += nextChar();
          raw += "\n";
          continue;
        }
        var c = nextChar();
        cooked += c;
        raw += c;
      }
      raise("Unterminated template", start);
    }

    function next() {
      skipSpace();
      lastTokEnd = tok ? tok.end : 0;
      lastTokType = tok ? tok.type : null;
      if (tok && (tok.type === "name" || tok.type === "keyword" || tok.type === "num" ||
          tok.type === "string" || tok.type === "regexp" || tok.type === ")" ||
          tok.type === "]" || tok.type === "}" || tok.type === "incdec" ||
          tok.type === "template" || tok.type === "templateTail" ||
          (tok.type === "keyword" && (tok.value === "true" || tok.value === "false" || tok.value === "null" || tok.value === "this")))) {
        // keep lastTokType as-is for regex decision — already set
      }

      if (pos >= length) {
        tok = makeTok("eof", null, pos, line, lineStart);
        return tok;
      }

      var ch = peekChar();
      if (isDigit(ch) || (ch === "." && isDigit(peekCharAt(1)))) {
        tok = readNumber();
        return tok;
      }
      if (ch === "'" || ch === '"') {
        tok = readString(ch);
        return tok;
      }
      if (isIdentStart(ch)) {
        tok = readIdent();
        return tok;
      }
      // After templateHead/Middle expression `}`, continue template
      if (ch === "`" || (false)) {
        tok = readOp();
        return tok;
      }
      tok = readOp();
      return tok;
    }

    function continueTemplate() {
      // Current tok is the closing `}` of `${...}`. Advance past it, then
      // resume scanning template characters (do not skipSpace — whitespace
      // belongs to the template).
      lastTokEnd = tok.end;
      lastTokType = "}";
      pos = tok.end;
      // Restore line tracking to match pos (tok.end is already correct).
      tok = readTemplate(true);
      return tok;
    }

    function eat(type, value) {
      if (tok.type === type && (value === undefined || tok.value === value)) {
        var t = tok;
        next();
        return t;
      }
      return null;
    }

    function expect(type, value) {
      var t = eat(type, value);
      if (!t) unexpected();
      return t;
    }

    function check(type, value) {
      return tok.type === type && (value === undefined || tok.value === value);
    }

    // -----------------------------------------------------------------------
    // ASI
    // -----------------------------------------------------------------------

    function canInsertSemicolon() {
      return (
        tok.type === "eof" ||
        tok.type === "}" ||
        (tok.loc && tok.loc.start.line > (arguments[0] || line))
      );
    }

    function insertSemicolon() {
      // line break between last token and current?
      return tok.type === "eof" || tok.type === "}" || (tok.loc.start.line !== lineOfLast());
    }

    function lineOfLast() {
      // lastTokEnd's line — approximate via scanning
      var l = 1;
      for (var i = 0; i < lastTokEnd && i < length; i++) {
        if (input.charCodeAt(i) === 10) l++;
      }
      return l;
    }

    function semicolon() {
      if (eat(";")) return;
      if (tok.type === "}" || tok.type === "eof") return;
      // ASI on line break
      if (tok.loc && lastTokEnd > 0) {
        var lastLine = 1;
        var ls = 0;
        for (var i = 0; i < lastTokEnd; i++) {
          if (input.charCodeAt(i) === 10) {
            lastLine++;
            ls = i + 1;
          }
        }
        if (tok.loc.start.line > lastLine) return;
      }
      unexpected();
    }

    // -----------------------------------------------------------------------
    // Identifiers / literals
    // -----------------------------------------------------------------------

    function parseIdent(liberal) {
      if (tok.type === "name") {
        var node = startNode();
        node.name = tok.value;
        next();
        return finishNode(node, "Identifier");
      }
      if (tok.type === "keyword") {
        if (!liberal) {
          if (tok.value === "await" && (inAsync || !allowAwaitOutside)) {
            // await as ident only outside async when allowed
          }
          if (
            tok.value === "yield" ||
            tok.value === "import" ||
            tok.value === "export" ||
            (STRICT_RESERVED[tok.value] && tok.value !== "await" && tok.value !== "let")
          ) {
            // allow let/await as ident in some positions via liberal
          }
        }
        // Treat keywords as identifiers when liberal or for property names
        if (liberal || tok.value === "await" || tok.value === "let" || tok.value === "static" ||
            tok.value === "implements" || tok.value === "interface" || tok.value === "package" ||
            tok.value === "private" || tok.value === "protected" || tok.value === "public" ||
            tok.value === "yield" || tok.value === "enum" || tok.value === "as" ||
            tok.value === "from" || tok.value === "get" || tok.value === "set" ||
            tok.value === "async" || tok.value === "of") {
          var node2 = startNode();
          node2.name = tok.value;
          next();
          return finishNode(node2, "Identifier");
        }
      }
      unexpected();
    }

    function startNode() {
      return {
        start: tok.start,
        loc: { start: { line: tok.loc.start.line, column: tok.loc.start.column } },
      };
    }

    function startNodeAt(start, startLoc) {
      return {
        start: start,
        loc: { start: { line: startLoc.line, column: startLoc.column } },
      };
    }

    function copyLocStart(node) {
      return { line: node.loc.start.line, column: node.loc.start.column };
    }

    // -----------------------------------------------------------------------
    // Expressions — precedence climbing
    // -----------------------------------------------------------------------

    var PREC = {
      "||": 1,
      "??": 1,
      "&&": 2,
      "|": 3,
      "^": 4,
      "&": 5,
      "==": 6,
      "!=": 6,
      "===": 6,
      "!==": 6,
      "<": 7,
      ">": 7,
      "<=": 7,
      ">=": 7,
      in: 7,
      instanceof: 7,
      "<<": 8,
      ">>": 8,
      ">>>": 8,
      "+": 9,
      "-": 9,
      "*": 10,
      "/": 10,
      "%": 10,
      "**": 11,
    };

    function parseExpression(noIn) {
      var old = allowIn;
      if (noIn) allowIn = false;
      var expr = parseMaybeAssign();
      if (check(",")) {
        var node = startNodeAt(expr.start, copyLocStart(expr));
        node.expressions = [expr];
        while (eat(",")) {
          node.expressions.push(parseMaybeAssign());
        }
        expr = finishNode(node, "SequenceExpression");
      }
      allowIn = old;
      return expr;
    }

    function parseMaybeAssign() {
      if (isAsyncArrowStart()) {
        return parseAsyncArrow();
      }
      var left = parseMaybeConditional();
      if (tok.type === "assign") {
        checkLVal(left);
        var node = startNodeAt(left.start, copyLocStart(left));
        node.left = left;
        node.operator = tok.value;
        next();
        node.right = parseMaybeAssign();
        return finishNode(node, "AssignmentExpression");
      }
      return left;
    }

    function isAsyncArrowStart() {
      // async ident =>  OR  async (
      if (!(check("keyword", "async"))) return false;
      // Look ahead: if next is name or (, and eventually =>
      // We peek by temporarily reading — simple heuristic: async followed by
      // name on same line, or (
      var saved = saveState();
      next(); // async
      var ok = false;
      if (tok.type === "name") {
        next();
        ok = check("=>");
      } else if (check("(")) {
        // Could be async function or async (...) =>
        // Scan for => after matching parens — expensive; try parse later.
        // Heuristic: if not "function", treat as potential arrow.
        ok = true;
        // Restore and let caller decide via try — mark as potential
      }
      restoreState(saved);
      if (!ok) return false;
      // Distinguish async function
      var saved2 = saveState();
      next();
      if (check("keyword", "function")) {
        restoreState(saved2);
        return false;
      }
      restoreState(saved2);
      return true;
    }

    function parseAsyncArrow() {
      var node = startNode();
      expect("keyword", "async");
      if (check("(")) {
        var params = parseBindingList(true);
        expect("=>");
        return parseArrowBody(node, params, true);
      }
      var param = parseBindingAtom();
      expect("=>");
      return parseArrowBody(node, [param], true);
    }

    function parseMaybeConditional() {
      var expr = parseExprOps();
      if (eat("?")) {
        var node = startNodeAt(expr.start, copyLocStart(expr));
        node.test = expr;
        node.consequent = parseMaybeAssign();
        expect(":");
        node.alternate = parseMaybeAssign();
        return finishNode(node, "ConditionalExpression");
      }
      return expr;
    }

    function parseExprOps() {
      return parseExprOp(parseMaybeUnary(), 0);
    }

    function parseExprOp(left, minPrec) {
      while (true) {
        var prec = -1;
        var op = null;
        if (tok.type === "binop") {
          op = tok.value;
          if (op === "in" && !allowIn) break;
          prec = PREC[op];
        } else if (check("keyword", "in") && allowIn) {
          op = "in";
          prec = PREC.in;
        } else if (check("keyword", "instanceof")) {
          op = "instanceof";
          prec = PREC.instanceof;
        }
        if (prec < 0 || prec < minPrec) break;
        next();
        var node = startNodeAt(left.start, copyLocStart(left));
        node.left = left;
        node.operator = op;
        var nextMin = op === "**" ? prec : prec + 1;
        node.right = parseExprOp(parseMaybeUnary(), nextMin);
        left = finishNode(node, "BinaryExpression");
        if (op === "||" || op === "&&" || op === "??") {
          left.type = "LogicalExpression";
        }
      }
      return left;
    }

    function parseMaybeUnary() {
      if (tok.type === "incdec") {
        var node = startNode();
        node.operator = tok.value;
        node.prefix = true;
        next();
        node.argument = parseMaybeUnary();
        checkLVal(node.argument);
        return finishNode(node, "UpdateExpression");
      }
      if (tok.type === "!" || tok.type === "~" ||
          (tok.type === "binop" && (tok.value === "+" || tok.value === "-")) ||
          check("keyword", "delete") || check("keyword", "void") ||
          check("keyword", "typeof") || check("keyword", "await")) {
        if (check("keyword", "await")) {
          if (!inAsync && !allowAwaitOutside) raise("await outside async", tok.start);
          var anode = startNode();
          next();
          anode.argument = parseMaybeUnary();
          return finishNode(anode, "AwaitExpression");
        }
        var unode = startNode();
        unode.operator = tok.type === "binop" || tok.type === "!" || tok.type === "~"
          ? tok.value
          : tok.value;
        unode.prefix = true;
        next();
        unode.argument = parseMaybeUnary();
        return finishNode(unode, "UnaryExpression");
      }
      var expr = parseExprSubscripts();
      if (tok.type === "incdec" && !canInsertSemicolonAfter(expr)) {
        // postfix — only if no line break
        if (tok.loc.start.line === expr.loc.end.line) {
          var pnode = startNodeAt(expr.start, copyLocStart(expr));
          pnode.argument = expr;
          pnode.operator = tok.value;
          pnode.prefix = false;
          next();
          checkLVal(expr);
          return finishNode(pnode, "UpdateExpression");
        }
      }
      return expr;
    }

    function canInsertSemicolonAfter(expr) {
      return tok.loc && expr.loc && tok.loc.start.line > expr.loc.end.line;
    }

    function parseExprSubscripts() {
      return parseSubscripts(parseExprAtom());
    }

    function parseCallArguments() {
      var args = [];
      expect("(");
      var first = true;
      while (!check(")")) {
        if (!first) expect(",");
        else first = false;
        if (check(")")) break; // trailing comma
        if (check("...")) {
          var rnode = startNode();
          next();
          rnode.argument = parseMaybeAssign();
          args.push(finishNode(rnode, "SpreadElement"));
        } else {
          args.push(parseMaybeAssign());
        }
      }
      expect(")");
      return args;
    }

    function parseSubscripts(base) {
      while (true) {
        if (eat("?.")) {
          if (check("(")) {
            var node = startNodeAt(base.start, copyLocStart(base));
            node.callee = base;
            node.arguments = parseCallArguments();
            node.optional = true;
            base = finishNode(node, "CallExpression");
          } else if (check("[")) {
            var n2 = startNodeAt(base.start, copyLocStart(base));
            next();
            n2.object = base;
            n2.property = parseExpression();
            expect("]");
            n2.computed = true;
            n2.optional = true;
            base = finishNode(n2, "MemberExpression");
          } else {
            var n3 = startNodeAt(base.start, copyLocStart(base));
            n3.object = base;
            n3.property = parseIdent(true);
            n3.computed = false;
            n3.optional = true;
            base = finishNode(n3, "MemberExpression");
          }
          continue;
        }
        if (check(".")) {
          var n4 = startNodeAt(base.start, copyLocStart(base));
          next();
          n4.object = base;
          n4.property = parseIdent(true);
          n4.computed = false;
          n4.optional = false;
          base = finishNode(n4, "MemberExpression");
          continue;
        }
        if (check("[")) {
          if (canInsertSemicolonAfter(base)) break;
          var n5 = startNodeAt(base.start, copyLocStart(base));
          next();
          n5.object = base;
          n5.property = parseExpression();
          expect("]");
          n5.computed = true;
          n5.optional = false;
          base = finishNode(n5, "MemberExpression");
          continue;
        }
        if (check("(")) {
          if (canInsertSemicolonAfter(base)) break;
          var n6 = startNodeAt(base.start, copyLocStart(base));
          n6.callee = base;
          n6.arguments = parseCallArguments();
          n6.optional = false;
          base = finishNode(n6, "CallExpression");
          continue;
        }
        if (tok.type === "template" || tok.type === "templateHead") {
          if (canInsertSemicolonAfter(base)) break;
          base = parseTaggedTemplate(base);
          continue;
        }
        break;
      }
      return base;
    }

    function parseExprAtom() {
      // supersede parseExprList usage — rewrite call in parseSubscripts via local

      if (check("keyword", "super")) {
        var snode = startNode();
        next();
        return finishNode(snode, "Super");
      }
      if (check("keyword", "this")) {
        var tnode = startNode();
        next();
        return finishNode(tnode, "ThisExpression");
      }
      if (check("keyword", "null")) {
        var nnode = startNode();
        nnode.value = null;
        nnode.raw = "null";
        next();
        return finishNode(nnode, "Literal");
      }
      if (check("keyword", "true") || check("keyword", "false")) {
        var bnode = startNode();
        bnode.value = tok.value === "true";
        bnode.raw = tok.value;
        next();
        return finishNode(bnode, "Literal");
      }
      if (tok.type === "num") {
        var num = startNode();
        num.value = tok.value;
        num.raw = input.slice(tok.start, tok.end);
        next();
        return finishNode(num, "Literal");
      }
      if (tok.type === "string") {
        var str = startNode();
        str.value = tok.value;
        str.raw = input.slice(tok.start, tok.end);
        next();
        return finishNode(str, "Literal");
      }
      if (tok.type === "regexp") {
        var re = startNode();
        try {
          re.value = new RegExp(tok.value.pattern, tok.value.flags);
        } catch (e) {
          re.value = null;
        }
        re.regex = { pattern: tok.value.pattern, flags: tok.value.flags };
        re.raw = input.slice(tok.start, tok.end);
        next();
        return finishNode(re, "Literal");
      }
      if (tok.type === "name" || (tok.type === "keyword" && tok.value === "async")) {
        // Could be arrow: id =>  or async
        if (check("keyword", "async")) {
          var saved = saveState();
          next();
          if (check("keyword", "function")) {
            restoreState(saved);
            return parseFunction(startNode(), false, true);
          }
          // async arrow handled in parseMaybeAssign
          restoreState(saved);
        }
        // Lookahead for arrow
        if (tok.type === "name") {
          var savedA = saveState();
          var id = parseIdent();
          if (check("=>")) {
            var anode = startNodeAt(id.start, copyLocStart(id));
            next(); // =>
            return parseArrowBody(anode, [toAssignable(id)], false);
          }
          restoreState(savedA);
        }
        return parseIdent();
      }
      if (check("[")) {
        return parseArray();
      }
      if (check("{")) {
        return parseObject();
      }
      if (check("keyword", "function")) {
        return parseFunction(startNode(), false, false);
      }
      if (check("keyword", "class")) {
        return parseClass(false);
      }
      if (check("keyword", "new")) {
        return parseNew();
      }
      if (tok.type === "template" || tok.type === "templateHead") {
        return parseTemplate();
      }
      if (check("(")) {
        return parseParenAndArrow();
      }
      if (check("keyword", "import")) {
        raise("import is not supported in DimParse v1", tok.start);
      }
      unexpected();
    }

    function parseParenAndArrow() {
      var start = tok.start;
      var startLoc = { line: tok.loc.start.line, column: tok.loc.start.column };
      next(); // (
      if (eat(")")) {
        // () =>
        expect("=>");
        var node = startNodeAt(start, startLoc);
        return parseArrowBody(node, [], false);
      }
      // Could be (a, b) => or (expr) or (a = 1) etc.
      var exprs = [];
      var hasRest = false;
      var spreadStart = null;
      while (true) {
        if (check("...")) {
          var r = startNode();
          next();
          r.argument = parseBindingAtom();
          exprs.push(finishNode(r, "RestElement"));
          hasRest = true;
          break;
        }
        exprs.push(parseMaybeAssign());
        if (!eat(",")) break;
        if (check(")")) break;
      }
      expect(")");
      if (check("=>")) {
        next();
        var anode = startNodeAt(start, startLoc);
        var params = [];
        for (var i = 0; i < exprs.length; i++) {
          params.push(toAssignable(exprs[i]));
        }
        return parseArrowBody(anode, params, false);
      }
      if (exprs.length === 1 && !hasRest) {
        return exprs[0];
      }
      var seq = startNodeAt(start, startLoc);
      seq.expressions = exprs;
      return finishNode(seq, "SequenceExpression");
    }

    function parseArrowBody(node, params, isAsync) {
      node.id = null;
      node.generator = false;
      node.async = isAsync;
      node.params = params;
      var wasFn = inFunction;
      var wasAsync = inAsync;
      inFunction++;
      if (isAsync) inAsync++;
      if (check("{")) {
        node.body = parseBlock();
        node.expression = false;
      } else {
        node.body = parseMaybeAssign();
        node.expression = true;
      }
      inFunction = wasFn;
      inAsync = wasAsync;
      return finishNode(node, "ArrowFunctionExpression");
    }

    function parseArray() {
      var node = startNode();
      next(); // [
      node.elements = [];
      while (!check("]")) {
        if (eat(",")) {
          node.elements.push(null);
          continue;
        }
        if (check("...")) {
          var r = startNode();
          next();
          r.argument = parseMaybeAssign();
          node.elements.push(finishNode(r, "SpreadElement"));
        } else {
          node.elements.push(parseMaybeAssign());
        }
        if (!eat(",")) break;
      }
      expect("]");
      return finishNode(node, "ArrayExpression");
    }

    function parseObject() {
      var node = startNode();
      next(); // {
      node.properties = [];
      while (!check("}")) {
        node.properties.push(parseObjectProp());
        if (!eat(",")) break;
      }
      expect("}");
      return finishNode(node, "ObjectExpression");
    }

    function parseObjectProp() {
      var node = startNode();
      if (check("...")) {
        next();
        node.argument = parseMaybeAssign();
        return finishNode(node, "SpreadElement");
      }
      var kind = "init";
      var isAsync = false;
      if (check("keyword", "async") && !isFollowedByColonOrParen()) {
        // async method
        var saved = saveState();
        next();
        if (!check(":") && !check("(") && !check(",")) {
          isAsync = true;
        } else {
          restoreState(saved);
        }
      }
      if (!isAsync && (check("name") || check("keyword")) && (tok.value === "get" || tok.value === "set")) {
        var savedG = saveState();
        var k = tok.value;
        next();
        if (!check(":") && !check("(") && !check(",") && !check("}")) {
          kind = k;
        } else {
          restoreState(savedG);
        }
      }
      var key;
      var computed = false;
      if (eat("[")) {
        computed = true;
        key = parseMaybeAssign();
        expect("]");
      } else if (tok.type === "num" || tok.type === "string") {
        key = parseExprAtom();
      } else {
        key = parseIdent(true);
      }
      if (check("(") || kind !== "init" || isAsync) {
        // method
        node.key = key;
        node.computed = computed;
        node.kind = kind === "init" ? "method" : kind;
        node.method = kind === "init";
        node.shorthand = false;
        node.value = parseFunction(startNode(), true, isAsync);
        return finishNode(node, "Property");
      }
      if (eat(":")) {
        node.key = key;
        node.computed = computed;
        node.kind = "init";
        node.method = false;
        node.shorthand = false;
        node.value = parseMaybeAssign();
        return finishNode(node, "Property");
      }
      // shorthand
      if (key.type !== "Identifier") unexpected();
      node.key = key;
      node.computed = false;
      node.kind = "init";
      node.method = false;
      node.shorthand = true;
      node.value = key;
      if (eat("assign") && tok && false) {
        // shorthand default — AssignmentPattern handled via =
      }
      // Check for = after shorthand (for patterns, but in expr it's assign)
      // In object literal, shorthand with default only in destructuring.
      return finishNode(node, "Property");
    }

    function isFollowedByColonOrParen() {
      // peek after current token — cheap: check next significant isn't needed often
      return false;
    }

    function parseTemplate() {
      var node = startNode();
      node.expressions = [];
      node.quasis = [];
      if (tok.type === "template") {
        // no expressions
        node.quasis.push(quasiFromTok(tok, true));
        next();
        return finishNode(node, "TemplateLiteral");
      }
      // templateHead
      node.quasis.push(quasiFromTok(tok, false));
      next();
      while (true) {
        node.expressions.push(parseExpression());
        // Closing `}` of `${...}` must resume the template, not next()-tokenize
        // the following backtick as a brand-new template literal.
        if (!check("}")) unexpected();
        continueTemplate();
        if (tok.type === "templateTail") {
          node.quasis.push(quasiFromTok(tok, true));
          next();
          break;
        }
        if (tok.type === "templateMiddle") {
          node.quasis.push(quasiFromTok(tok, false));
          next();
          continue;
        }
        unexpected();
      }
      return finishNode(node, "TemplateLiteral");
    }

    function quasiFromTok(t, tail) {
      var q = {
        type: "TemplateElement",
        start: t.start,
        end: t.end,
        loc: t.loc,
        value: { raw: t.value.raw, cooked: t.value.cooked },
        tail: tail,
      };
      return q;
    }

    function parseTaggedTemplate(tag) {
      var node = startNodeAt(tag.start, copyLocStart(tag));
      node.tag = tag;
      node.quasi = parseTemplate();
      return finishNode(node, "TaggedTemplateExpression");
    }

    function parseNew() {
      var node = startNode();
      next(); // new
      if (check(".") ) {
        // new.target
        next();
        var meta = finishNode(
          { name: "new", start: node.start, loc: { start: copyLocStart(node) } },
          "Identifier",
        );
        // fix finish
        meta = {
          type: "Identifier",
          name: "new",
          start: node.start,
          end: node.start + 3,
          loc: node.loc,
        };
        var prop = parseIdent(true);
        if (prop.name !== "target") raise("Invalid new.target", prop.start);
        node.meta = meta;
        node.property = prop;
        return finishNode(node, "MetaProperty");
      }
      node.callee = parseSubscripts(parseExprAtom());
      if (check("(")) {
        node.arguments = parseCallArguments();
      } else {
        node.arguments = [];
      }
      return finishNode(node, "NewExpression");
    }

    // -----------------------------------------------------------------------
    // Bindings / patterns
    // -----------------------------------------------------------------------

    function toAssignable(node) {
      if (!node) return node;
      switch (node.type) {
        case "Identifier":
        case "MemberExpression":
        case "RestElement":
        case "AssignmentPattern":
          return node;
        case "ObjectExpression":
          node.type = "ObjectPattern";
          for (var i = 0; i < node.properties.length; i++) {
            var p = node.properties[i];
            if (p.type === "SpreadElement") {
              p.type = "RestElement";
              p.argument = toAssignable(p.argument);
            } else if (p.type === "Property") {
              p.value = toAssignable(p.value);
            }
          }
          return node;
        case "ArrayExpression":
          node.type = "ArrayPattern";
          for (var j = 0; j < node.elements.length; j++) {
            if (node.elements[j]) node.elements[j] = toAssignable(node.elements[j]);
          }
          return node;
        case "AssignmentExpression":
          if (node.operator !== "=") raise("Invalid assignable", node.start);
          node.type = "AssignmentPattern";
          delete node.operator;
          node.left = toAssignable(node.left);
          return node;
        case "SpreadElement":
          node.type = "RestElement";
          node.argument = toAssignable(node.argument);
          return node;
        default:
          raise("Invalid assignment target", node.start);
      }
    }

    function checkLVal(node) {
      if (
        node.type !== "Identifier" &&
        node.type !== "MemberExpression" &&
        node.type !== "ObjectPattern" &&
        node.type !== "ArrayPattern" &&
        node.type !== "AssignmentPattern" &&
        node.type !== "RestElement"
      ) {
        // soft — cover doesn't care
      }
    }

    function parseBindingAtom() {
      if (check("[")) {
        var anode = startNode();
        next();
        anode.elements = [];
        while (!check("]")) {
          if (eat(",")) {
            anode.elements.push(null);
            continue;
          }
          if (check("...")) {
            var r = startNode();
            next();
            r.argument = parseBindingAtom();
            anode.elements.push(finishNode(r, "RestElement"));
            break;
          }
          anode.elements.push(parseBindingElement());
          if (!eat(",")) break;
        }
        expect("]");
        return finishNode(anode, "ArrayPattern");
      }
      if (check("{")) {
        var onode = startNode();
        next();
        onode.properties = [];
        while (!check("}")) {
          if (check("...")) {
            var r2 = startNode();
            next();
            r2.argument = parseBindingAtom();
            onode.properties.push(finishNode(r2, "RestElement"));
            break;
          }
          onode.properties.push(parseBindingProperty());
          if (!eat(",")) break;
        }
        expect("}");
        return finishNode(onode, "ObjectPattern");
      }
      return parseIdent();
    }

    function parseBindingElement() {
      var left = parseBindingAtom();
      if (eat("assign", "=")) {
        var node = startNodeAt(left.start, copyLocStart(left));
        node.left = left;
        node.right = parseMaybeAssign();
        return finishNode(node, "AssignmentPattern");
      }
      return left;
    }

    function parseBindingProperty() {
      var node = startNode();
      var computed = false;
      var key;
      if (eat("[")) {
        computed = true;
        key = parseMaybeAssign();
        expect("]");
      } else {
        key = parseIdent(true);
      }
      var value;
      if (eat(":")) {
        value = parseBindingElement();
      } else {
        if (key.type !== "Identifier") unexpected();
        value = key;
        if (eat("assign", "=")) {
          var ap = startNodeAt(key.start, copyLocStart(key));
          ap.left = key;
          ap.right = parseMaybeAssign();
          value = finishNode(ap, "AssignmentPattern");
        }
      }
      node.key = key;
      node.value = value;
      node.computed = computed;
      node.method = false;
      node.shorthand = !computed && key.type === "Identifier" && (value === key || (value.type === "AssignmentPattern" && value.left === key) || (value.type === "Identifier" && value.name === key.name));
      node.kind = "init";
      return finishNode(node, "Property");
    }

    function parseBindingList(isArrow) {
      // for async ( ... ) already at (
      var params = [];
      expect("(");
      while (!check(")")) {
        if (check("...")) {
          var r = startNode();
          next();
          r.argument = parseBindingAtom();
          params.push(finishNode(r, "RestElement"));
          break;
        }
        params.push(parseBindingElement());
        if (!eat(",")) break;
      }
      expect(")");
      return params;
    }

    // -----------------------------------------------------------------------
    // Functions / classes
    // -----------------------------------------------------------------------

    function parseFunction(node, isMethod, isAsync) {
      if (!isMethod) {
        // node already started; consume function keyword if present
        if (check("keyword", "async")) {
          isAsync = true;
          next();
        }
        expect("keyword", "function");
      }
      node.id = null;
      if (!isMethod && (tok.type === "name" || tok.type === "keyword")) {
        node.id = parseIdent();
      }
      node.generator = false;
      if (eat("binop", "*")) {
        raise("generators are not supported in DimParse v1", tok.start);
      }
      node.async = !!isAsync;
      node.params = parseBindingList(false);
      var wasFn = inFunction;
      var wasAsync = inAsync;
      inFunction++;
      if (isAsync) inAsync++;
      node.body = parseBlock();
      inFunction = wasFn;
      inAsync = wasAsync;
      node.expression = false;
      return finishNode(node, isMethod ? "FunctionExpression" : (node.id ? "FunctionDeclaration" : "FunctionExpression"));
    }

    // For expression position FunctionExpression
    function parseFunctionExpr(isAsync) {
      var node = startNode();
      if (isAsync || check("keyword", "async")) {
        if (check("keyword", "async")) next();
        isAsync = true;
      }
      expect("keyword", "function");
      node.id = null;
      if (tok.type === "name") node.id = parseIdent();
      if (eat("binop", "*")) raise("generators are not supported in DimParse v1", tok.start);
      node.generator = false;
      node.async = !!isAsync;
      node.params = parseBindingList(false);
      var wasFn = inFunction;
      var wasAsync = inAsync;
      inFunction++;
      if (isAsync) inAsync++;
      node.body = parseBlock();
      inFunction = wasFn;
      inAsync = wasAsync;
      node.expression = false;
      return finishNode(node, "FunctionExpression");
    }

    // Fix parseExprAtom function branch
    // (already calls parseFunction — adjust)

    function parseClass(isDecl) {
      var node = startNode();
      expect("keyword", "class");
      node.id = null;
      if (tok.type === "name") {
        node.id = parseIdent();
      } else if (isDecl) {
        unexpected();
      }
      node.superClass = null;
      if (eat("keyword", "extends")) {
        node.superClass = parseSubscripts(parseExprAtom());
      }
      node.body = parseClassBody();
      return finishNode(node, isDecl ? "ClassDeclaration" : "ClassExpression");
    }

    function parseClassBody() {
      var node = startNode();
      expect("{");
      node.body = [];
      while (!check("}")) {
        if (eat(";")) continue;
        node.body.push(parseClassElement());
      }
      expect("}");
      return finishNode(node, "ClassBody");
    }

    function parseClassElement() {
      var node = startNode();
      var isStatic = false;
      if (check("keyword", "static") || (check("name") && tok.value === "static")) {
        var saved = saveState();
        next();
        if (!check("(") && !check("=") && !check(";")) {
          isStatic = true;
        } else {
          restoreState(saved);
        }
      }
      if (check("#")) {
        raise("private fields are not supported in DimParse v1", tok.start);
      }
      var kind = "method";
      var isAsync = false;
      if (check("keyword", "async") || (check("name") && tok.value === "async")) {
        var savedA = saveState();
        next();
        if (!check("(") && !check("=")) {
          isAsync = true;
        } else {
          restoreState(savedA);
        }
      }
      if ((check("name") || check("keyword")) && (tok.value === "get" || tok.value === "set")) {
        var savedG = saveState();
        var k = tok.value;
        next();
        if (!check("(") && !check("=")) {
          kind = k;
        } else {
          restoreState(savedG);
        }
      }
      var computed = false;
      var key;
      if (eat("[")) {
        computed = true;
        key = parseMaybeAssign();
        expect("]");
      } else if (tok.type === "num" || tok.type === "string") {
        key = parseExprAtom();
      } else {
        key = parseIdent(true);
      }
      if (check("=") || (check(";") && kind === "method" && !isAsync)) {
        // field
        node.key = key;
        node.computed = computed;
        node.static = isStatic;
        node.value = null;
        if (eat("assign", "=")) {
          node.value = parseMaybeAssign();
        }
        semicolon();
        return finishNode(node, "PropertyDefinition");
      }
      if (key.type === "Identifier" && key.name === "constructor") kind = "constructor";
      node.key = key;
      node.computed = computed;
      node.static = isStatic;
      node.kind = kind;
      node.value = parseMethodFunction(isAsync);
      return finishNode(node, "MethodDefinition");
    }

    function parseMethodFunction(isAsync) {
      var node = startNode();
      node.id = null;
      node.generator = false;
      if (eat("binop", "*")) raise("generators are not supported in DimParse v1", tok.start);
      node.async = !!isAsync;
      node.params = parseBindingList(false);
      var wasFn = inFunction;
      var wasAsync = inAsync;
      inFunction++;
      if (isAsync) inAsync++;
      node.body = parseBlock();
      inFunction = wasFn;
      inAsync = wasAsync;
      node.expression = false;
      return finishNode(node, "FunctionExpression");
    }

    // -----------------------------------------------------------------------
    // Statements
    // -----------------------------------------------------------------------

    function parseStatement(allowDecl) {
      if (check("keyword", "import") || check("keyword", "export")) {
        raise(tok.value + " is not supported in DimParse v1", tok.start);
      }
      if (check(";")) {
        var empty = startNode();
        next();
        return finishNode(empty, "EmptyStatement");
      }
      if (check("{")) {
        return parseBlock();
      }
      if (check("keyword", "var") || check("keyword", "let") || check("keyword", "const")) {
        return parseVarStatement();
      }
      if (check("keyword", "function")) {
        return parseFunction(startNode(), false, false);
      }
      if (check("keyword", "async")) {
        var saved = saveState();
        next();
        if (check("keyword", "function")) {
          // async function decl
          var node = startNodeAt(saved.tok.start, saved.tok.loc.start);
          return parseFunctionAfterAsync(node);
        }
        restoreState(saved);
      }
      if (check("keyword", "class")) {
        return parseClass(true);
      }
      if (check("keyword", "if")) return parseIf();
      if (check("keyword", "return")) return parseReturn();
      if (check("keyword", "while")) return parseWhile();
      if (check("keyword", "do")) return parseDoWhile();
      if (check("keyword", "for")) return parseFor();
      if (check("keyword", "switch")) return parseSwitch();
      if (check("keyword", "break")) return parseBreakContinue("BreakStatement");
      if (check("keyword", "continue")) return parseBreakContinue("ContinueStatement");
      if (check("keyword", "throw")) return parseThrow();
      if (check("keyword", "try")) return parseTry();
      if (check("keyword", "debugger")) {
        var d = startNode();
        next();
        semicolon();
        return finishNode(d, "DebuggerStatement");
      }
      if (check("keyword", "with")) {
        raise("with is not supported", tok.start);
      }
      // labeled or expression
      if (tok.type === "name") {
        var savedL = saveState();
        var label = parseIdent();
        if (eat(":")) {
          var lnode = startNodeAt(label.start, copyLocStart(label));
          lnode.label = label;
          lnode.body = parseStatement(true);
          return finishNode(lnode, "LabeledStatement");
        }
        restoreState(savedL);
      }
      return parseExpressionStatement();
    }

    function parseFunctionAfterAsync(node) {
      // already consumed async; at function
      expect("keyword", "function");
      node.id = null;
      if (tok.type === "name") node.id = parseIdent();
      if (eat("binop", "*")) raise("generators are not supported in DimParse v1", tok.start);
      node.generator = false;
      node.async = true;
      node.params = parseBindingList(false);
      var wasFn = inFunction;
      var wasAsync = inAsync;
      inFunction++;
      inAsync++;
      node.body = parseBlock();
      inFunction = wasFn;
      inAsync = wasAsync;
      node.expression = false;
      return finishNode(node, node.id ? "FunctionDeclaration" : "FunctionExpression");
    }

    function parseBlock() {
      var node = startNode();
      expect("{");
      node.body = [];
      while (!check("}")) {
        node.body.push(parseStatement(true));
      }
      expect("}");
      return finishNode(node, "BlockStatement");
    }

    function parseVarStatement() {
      var node = startNode();
      node.kind = tok.value;
      next();
      node.declarations = [];
      do {
        node.declarations.push(parseVarDeclarator());
      } while (eat(","));
      semicolon();
      return finishNode(node, "VariableDeclaration");
    }

    function parseVarDeclarator() {
      var node = startNode();
      node.id = parseBindingAtom();
      node.init = null;
      if (eat("assign", "=")) {
        node.init = parseMaybeAssign();
      } else if (node.id.type !== "Identifier") {
        raise("Complex binding requires initializer", node.id.start);
      }
      return finishNode(node, "VariableDeclarator");
    }

    function parseIf() {
      var node = startNode();
      expect("keyword", "if");
      expect("(");
      node.test = parseExpression();
      expect(")");
      node.consequent = parseStatement(false);
      node.alternate = eat("keyword", "else") ? parseStatement(false) : null;
      return finishNode(node, "IfStatement");
    }

    function parseReturn() {
      if (!inFunction && !allowReturnOutside) raise("return outside function", tok.start);
      var node = startNode();
      next();
      node.argument = null;
      if (!check(";") && !check("}") && !check("eof") && !(tok.loc && lastTokEnd && tok.loc.start.line > lineOfLast())) {
        // if same line or no ASI, parse argument
        if (!(tok.loc && tok.loc.start.line > lineOfLast())) {
          node.argument = parseExpression();
        }
      }
      semicolon();
      return finishNode(node, "ReturnStatement");
    }

    function parseWhile() {
      var node = startNode();
      expect("keyword", "while");
      expect("(");
      node.test = parseExpression();
      expect(")");
      inLoop++;
      node.body = parseStatement(false);
      inLoop--;
      return finishNode(node, "WhileStatement");
    }

    function parseDoWhile() {
      var node = startNode();
      expect("keyword", "do");
      inLoop++;
      node.body = parseStatement(false);
      inLoop--;
      expect("keyword", "while");
      expect("(");
      node.test = parseExpression();
      expect(")");
      eat(";");
      return finishNode(node, "DoWhileStatement");
    }

    function parseFor() {
      var node = startNode();
      expect("keyword", "for");
      expect("(");
      // for (var x in/of) or for (;;)
      if (check(";")) {
        node.init = null;
        next();
        return parseForClassic(node);
      }
      if (check("keyword", "var") || check("keyword", "let") || check("keyword", "const")) {
        var kind = tok.value;
        var start = tok.start;
        var startLoc = { line: tok.loc.start.line, column: tok.loc.start.column };
        next();
        var decl = startNodeAt(start, startLoc);
        decl.kind = kind;
        decl.declarations = [parseVarDeclarator()];
        // could be more decls for classic for
        if (check("keyword", "in") || (check("name") && tok.value === "of")) {
          // for-in/of — only one declarator
          var isOf = check("name") && tok.value === "of";
          next();
          node.left = finishNode(decl, "VariableDeclaration");
          node.right = parseExpression();
          expect(")");
          inLoop++;
          node.body = parseStatement(false);
          inLoop--;
          return finishNode(node, isOf ? "ForOfStatement" : "ForInStatement");
        }
        while (eat(",")) {
          decl.declarations.push(parseVarDeclarator());
        }
        node.init = finishNode(decl, "VariableDeclaration");
        expect(";");
        return parseForClassic(node);
      }
      // expression init or for-in left
      var oldIn = allowIn;
      allowIn = false;
      var init = parseExpression();
      allowIn = oldIn;
      if (check("keyword", "in") || (check("name") && tok.value === "of")) {
        var isOf2 = check("name") && tok.value === "of";
        next();
        node.left = toAssignable(init);
        node.right = parseExpression();
        expect(")");
        inLoop++;
        node.body = parseStatement(false);
        inLoop--;
        return finishNode(node, isOf2 ? "ForOfStatement" : "ForInStatement");
      }
      node.init = init;
      expect(";");
      return parseForClassic(node);
    }

    function parseForClassic(node) {
      node.test = check(";") ? null : parseExpression();
      expect(";");
      node.update = check(")") ? null : parseExpression();
      expect(")");
      inLoop++;
      node.body = parseStatement(false);
      inLoop--;
      return finishNode(node, "ForStatement");
    }

    function parseSwitch() {
      var node = startNode();
      expect("keyword", "switch");
      expect("(");
      node.discriminant = parseExpression();
      expect(")");
      expect("{");
      node.cases = [];
      inSwitch++;
      while (!check("}")) {
        node.cases.push(parseSwitchCase());
      }
      inSwitch--;
      expect("}");
      return finishNode(node, "SwitchStatement");
    }

    function parseSwitchCase() {
      var node = startNode();
      if (eat("keyword", "case")) {
        node.test = parseExpression();
      } else {
        expect("keyword", "default");
        node.test = null;
      }
      expect(":");
      node.consequent = [];
      while (!check("}") && !check("keyword", "case") && !check("keyword", "default")) {
        node.consequent.push(parseStatement(true));
      }
      return finishNode(node, "SwitchCase");
    }

    function parseBreakContinue(type) {
      var node = startNode();
      next();
      node.label = null;
      if (tok.type === "name" && !(tok.loc.start.line > lineOfLast())) {
        node.label = parseIdent();
      }
      semicolon();
      return finishNode(node, type);
    }

    function parseThrow() {
      var node = startNode();
      next();
      if (tok.loc.start.line > lineOfLast()) raise("Illegal newline after throw", tok.start);
      node.argument = parseExpression();
      semicolon();
      return finishNode(node, "ThrowStatement");
    }

    function parseTry() {
      var node = startNode();
      expect("keyword", "try");
      node.block = parseBlock();
      node.handler = null;
      if (eat("keyword", "catch")) {
        var handler = startNodeAt(
          // catch start already consumed — use last
          tok.start,
          tok.loc.start,
        );
        // Fix start to catch keyword — approximate OK for cover
        handler.param = null;
        if (eat("(")) {
          handler.param = parseBindingAtom();
          expect(")");
        }
        handler.body = parseBlock();
        node.handler = finishNode(handler, "CatchClause");
      }
      node.finalizer = eat("keyword", "finally") ? parseBlock() : null;
      if (!node.handler && !node.finalizer) raise("Missing catch/finally", node.start);
      return finishNode(node, "TryStatement");
    }

    function parseExpressionStatement() {
      var node = startNode();
      node.expression = parseExpression();
      semicolon();
      return finishNode(node, "ExpressionStatement");
    }

    // -----------------------------------------------------------------------
    // State save/restore for lookahead
    // -----------------------------------------------------------------------

    function saveState() {
      return {
        pos: pos,
        line: line,
        lineStart: lineStart,
        tok: tok,
        lastTokEnd: lastTokEnd,
        lastTokType: lastTokType,
      };
    }

    function restoreState(s) {
      pos = s.pos;
      line = s.line;
      lineStart = s.lineStart;
      tok = s.tok;
      lastTokEnd = s.lastTokEnd;
      lastTokType = s.lastTokType;
    }

    // -----------------------------------------------------------------------
    // Program
    // -----------------------------------------------------------------------

    function parseProgram() {
      next(); // load first token
      var node = {
        start: 0,
        loc: { start: { line: 1, column: 0 } },
      };
      node.body = [];
      node.sourceType = "script";
      while (!check("eof")) {
        node.body.push(parseStatement(true));
      }
      return finishNode(node, "Program");
    }

    // Fix parseExprAtom for function — use parseFunctionExpr
    var _parseExprAtom = parseExprAtom;
    parseExprAtom = function () {
      if (check("keyword", "function")) {
        return parseFunctionExpr(false);
      }
      if (check("keyword", "async")) {
        var saved = saveState();
        next();
        if (check("keyword", "function")) {
          var node = startNodeAt(saved.tok.start, saved.tok.loc.start);
          // at function
          return parseFunctionExpr(true);
        }
        restoreState(saved);
      }
      return _parseExprAtom();
    };

    return {
      parse: parseProgram,
    };
  }

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  function parse(source, options) {
    if (typeof source !== "string") {
      throw new TypeError("DimParse.parse: source must be a string");
    }
    return createParser(source, options || {}).parse();
  }

  global.DimParse = {
    parse: parse,
    version: "0.1.0",
  };
})(typeof globalThis !== "undefined" ? globalThis : window);
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

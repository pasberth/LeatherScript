var assert = require("chai").assert;
var tokenizer = require("./../src/tokenizer");
var parser = require("./../src/parser");

var leftAssoc = { left: true };
var rightAssoc = { right: true };

var extractTokens = function (ast) {
  if (Array.isArray(ast)) {
    return ast.map(extractTokens);
  } else if (ast.token) {
    return ast.token;
  } else {
    return ast;
  }
};

var mkAstEq = function (notations) {
  return (function (x, y) {
    var tokens = tokenizer.tokenize([], x);
    assert.deepEqual(extractTokens(parser.parse(notations, tokens)), sexp(y));
  });
};

var mkFail = function (notations) {
  return (function (x, y) {
    var tokens = tokenizer.tokenize([], x);
    assert.deepEqual(extractTokens(parser.parse(notations, tokens)), y);
  });
};

var sexp = function (s) {
  var stack = [[]];
  while (s !== "") {
    if (s[0] === "(") {
      stack.push([]);
      s = s.slice(1);
    } else if (s[0] === ")") {
      var x = stack.pop();
      stack[stack.length - 1].push(x);
      s = s.slice(1);
    } else if (s[0] === ' ' || s[0] === '\n') {
      s = s.slice(1);
    } else {
      var ident = "";
      while (s[0] !== "(" && s[0] !== ")" && s[0] !== " " && s[0] !== '\n') {
        ident += s[0];
        s = s.slice(1);
      }
      stack[stack.length - 1].push(ident);
    }
  }
  return stack[0][0];
};

describe("prefix notations", function () {
  var notations = [
    { pattern: ["~", "$a"],
      level: "35",
      associativity: rightAssoc,
      replacement: [{ token: "~"}, { token: "$a"}]
    },
    { pattern: ["if", "$a", "then", "$b", "else", "$c"],
      level: "0",
      associativity: rightAssoc,
      replacement: [{ token: "if-then-else"}, { token: "$a" }, { token: "$b" }, { token: "$c"}]
    }
  ];

  var astEq = mkAstEq(notations);
  var fail = mkFail(notations);

  it("~ P == (~ P)", function () {
    astEq("~ P", "(~ P)");
  });

  it("~ ~ P == (~ (~ P))", function () {
    astEq("~ ~ P", "(~ (~ P))");
  });

  it("~ ~ ~ P == (~ (~ (~ P)))", function () {
    astEq("~ ~ ~ P", "(~ (~ (~ P)))");
  });

  it("if a then b else c == (if-then-else a b c)", function () {
    astEq("if a then b else c", "(if-then-else a b c)");
  });

  it("if ~ a then ~ b else ~ c == (if-then-else (~ a) (~ b) (~ c))", function () {
    astEq("if ~ a then ~ b else ~ c", "(if-then-else (~ a) (~ b) (~ c))");
  });

  it("if if a then b else c then if d then e else f else if g then h else i == (if-then-else (if-then-else a b c) (if-then-else d e f) (if-then-else g h i))", function () {
    astEq("if if a then b else c then if d then e else f else if g then h else i", "(if-then-else (if-then-else a b c) (if-then-else d e f) (if-then-else g h i))");
  });

  it("if a then b -> parse error", function () {
    fail("if a then b", { ParseError: { at: 4, Expected: "else" }});
  });

  it("if a then b else -> parse error", function () {
    fail("if a then b else", { ParseError: { at: 5 }});
  });

  it("if a else b then -> parse error", function () {
    fail("if a else b then", { ParseError: { at: 2, Expected: "then" }});
  });
});

describe("postfix notations", function () {
  var notations = [
    { pattern: ["$a", "!"],
      level: "8",
      associativity: leftAssoc,
      replacement: [{ token: "!"}, { token: "$a"}]
    }
  ];

  var astEq = mkAstEq(notations);
  it("a ! == (! a)", function () {
    astEq("a !", "(! a)");
  });

  it("a ! ! == (! (! a))", function () {
    astEq("a ! !", "(!(! a))");
  });

  it("a ! ! ! == (! (! (! a)))", function () {
    astEq("a ! ! !", "(! (! (! a)))");
  });
});

describe("infix notations", function () {
  var notations = [
    { pattern: ["$a","+","$b"],
      level: "6",
      associativity: leftAssoc,
      replacement: [{ token: "+" }, { token: "$a" }, { token: "$b"}]
    },
    { pattern: ["$a","-","$b"],
      level: "6",
      associativity: leftAssoc,
      replacement: [{ token: "-" }, { token: "$a" }, { token: "$b"}]
    },
    { pattern: ["$a", "*", "$b"],
      level: "7",
      associativity: leftAssoc,
      replacement: [{ token: "*" }, { token: "$a" }, { token: "$b"}]
    },
    { pattern: ["$a", "/", "$b"],
      level: "7",
      associativity: leftAssoc,
      replacement: [{ token: "/" }, { token: "$a" }, { token: "$b"}]
    },
    { pattern: ["$a", "=", "$b"],
      level: "4",
      associativity: rightAssoc,
      replacement: [{ token: "=" }, { token: "$a" }, { token: "$b"}]
    },
    { pattern: ["$a", "?", "$b", ":", "$c"],
      level: "1",
      associativity: rightAssoc,
      replacement: [{ token: "?:" }, { token: "$a" }, { token: "$b"}, { token: "$c" }]
    },
    { pattern: ["$a", "and", "$b"],
      level: "3",
      associativity: rightAssoc,
      replacement: [{ token: "and" }, { token: "$a" }, { token: "$b"}]
    },
    { pattern: ["$a", "or", "$b"],
      level: "2",
      associativity: rightAssoc,
      replacement: [{ token: "or" }, { token: "$a" }, { token: "$b"}]
    },
    { pattern: ["$a", ".", "$b"],
      level: "99",
      associativity: leftAssoc,
      replacement: [{ token: "." }, { token: "$a" }, { token: "$b"}]
    },
    { pattern: ["$a", "$b"],
      level: "9",
      associativity: leftAssoc,
      replacement: [{ token: "$a" }, { token: "$b"}]
    }
  ];
  var astEq = mkAstEq(notations);
  it("(a + b) == (+ a b)", function () {
    astEq("a + b", "(+ a b)");
  });
  it("(a + b + b) == (+ (+ a b) c)", function () {
    astEq("a + b + c", "(+ (+ a b) c)");
  });
  it("(a + b * c + d) == (+ (+ a (* b c) d)", function () {
    astEq("a + b * c + d", "(+ (+ a (* b c)) d)");
  });
  it("a + b == (+ a b)", function () {
    astEq("a + b", "(+ a b)");
  });
  it("a + b + c == (+ (+ a b) c)", function () {
    astEq("a + b + c", "(+ (+ a b) c)");
  });
  it("(a + b * c + d) == (+ (+ a (* b c)) d)", function () {
    astEq("a + b * c + d", "(+ (+ a (* b c)) d)");
  });
  it("(a * b + c + d) == (+ (+ (* a b) c) d)", function () {
    astEq("a * b + c + d", "(+ (+ (* a b) c) d)");
  });
  it("(a + b + c * d) == (+ (+ a b) (* c d))", function () {
    astEq("a + b + c * d", "(+ (+ a b) (* c d))");
  });
  it("(a * b + c * d) == (+ (* a b) (* c d))", function () {
    astEq("a * b + c * d", "(+ (* a b) (* c d))");
  });
  it("(a + b * c * d) == (+ a (* (* b c) d))", function () {
    astEq("a + b * c * d", "(+ a (* (* b c) d))");
  });
  it("(a * b * c + d) == (+ (* (* a b) c) d)", function () {
    astEq("a * b * c + d", "(+ (* (* a b) c) d)");
  });
  it("(x and y) == (and x y)", function () {
    astEq("x and y", "(and x y)");
  });
  it("(x and y and z) == (and x (and y z))", function () {
    astEq("x and y and z", "(and x (and y z))");
  });
  it("(a = b and c = d) == (and (= a b) (= c d))", function () {
    astEq("a = b and c = d", "(and (= a b) (= c d))");
  });
  it("(a or b and c or d) == (or a (or (and b c) d))", function () {
    astEq("a or b and c or d", "(or a (or (and b c) d))");
  });
  it("(a and b or c or d) == (or (and a b) (or c d))", function () {
    astEq("a and b or c or d", "(or (and a b) (or c d))");
  });
  it("(a or b or c and d) == (or a (or b (and c d)))", function () {
    astEq("a or b or c and d", "(or a (or b (and c d)))");
  });
  it("(a and b or c and d) == (or (and a b) (and c d))", function () {
    astEq("a and b or c and d", "(or (and a b) (and c d))");
  });
  it("(a or b and c and d) == (or a (and b (and c d)))", function () {
    astEq("a or b and c and d", "(or a (and b (and c d)))");
  });
  it("(a and b and c or d) == (or (and a (and b c)) d)", function () {
    astEq("a and b and c or d", "(or (and a (and b c)) d)");
  });
  it("(a ? b : c) == (?: a b c)", function () {
    astEq("a ? b : c", "(?: a b c)");
  });
  it("(a ? b : c ? d : e) == (?: a b (?: c d e))", function () {
    astEq("a ? b : c", "(?: a b c)");
  });
  it("(a and b ? c + d : e + f) == (?: (and a b) (+ c d) (+ e f))", function () {
    astEq("a and b ? c + d : e + f", "(?: (and a b) (+ c d) (+ e f))");
  });
  it("f x == (f x)", function () {
    astEq("f x", "(f x)");
  });
  it("f x y == ((f x) y)", function () {
    astEq("f x y", "((f x) y)");
  });
  it("f x + g x == (+ (f x) (g x))", function () {
    astEq("f x + g x", "(+ (f x) (g x))");
  });
});

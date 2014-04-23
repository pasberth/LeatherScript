var assert = require("chai").assert;
var tokenizer = require("./../src/tokenizer");
var parser = require("./../src/parser");

var leftAssoc = { left: true }

var extractTokens = function (ast) {
  if (Array.isArray(ast)) {
    return ast.map(extractTokens);
  } else {
    return ast.token;
  }
};

var mkAstEq = function (notations) {
  return (function (x, y) {
    var tokens = tokenizer.tokenize([], x);
    assert.deepEqual(extractTokens(parser.parse(notations, tokens)), y);
  });
}

describe("infix notations", function () {
  var notations = [
    { pattern: ["$a","+","$b"],
      level: "6",
      associativity: leftAssoc,
      replacement: [{ token: "+" }, { token: "$a" }, { token: "$b"}]
    }
  ];
  var astEq = mkAstEq(notations);
  it("(a + b) == (+ a b)", function () {
    astEq("a + b", ["+", "a", "b"]);
  });
  it("(a + b) == (+ a b)", function () {
    astEq("a + b + c", ["+", ["+", "a", "b"], "c"]);
  });
});

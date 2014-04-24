var esprima = require("esprima");
var escodegen = require("escodegen");

function generate(ast) {
  if (ast.ast) {
    if (ast.ast[0].token === "@MEMBER") {
      var obj = generate(ast.ast[1]);
      var prop = generate(ast.ast[2]);
      return {
        type: "MemberExpression",
        object: obj,
        property: prop
      };
    } else if (ast.ast[0].token === "@SEQUENCE") {
      var x = generate(ast.ast[1]);
      var y = generate(ast.ast[2]);
      return {
        type: "SequenceExpression",
        expressions: [x, y]
      }
    } else {
      return ast.ast.map(function (ast1) {
        return generate(ast1);
      }).reduce(function (ast1, ast2) {
        return {
          type: "CallExpression",
          callee: ast1,
          arguments: [ast2]
        };
      });
    }
  } else if (ast.token) {
    if (ast.token[0] === '"') {
      var s = ast.token.slice(1,-1);
      return {
        type: "Literal",
        value: s
      };
    }
    else {
      return {
        type: "Identifier",
        name: ast.token
      };
    }
  }
  else {
    throw "an error occurred";
  }
}

module.exports = { generate: generate };

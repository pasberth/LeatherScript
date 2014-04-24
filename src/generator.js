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
      if (ast.ast[1].ast && ast.ast[1].ast[0].token === "@ASCRIBE") {
        var y = generate(ast.ast[2]);
        return y;
      } else {
        var x = generate(ast.ast[1]);
        var y = generate(ast.ast[2]);
        return {
          type: "SequenceExpression",
          expressions: [x, y]
        };
      }
    }  else if (ast.ast.length > 1) {
      console.log(ast.ast[1]);
      var ast1 = generate(ast.ast[0]);
      var ast2 = generate(ast.ast[1]);
      return {
        type: "CallExpression",
        callee: ast1,
        arguments: [ast2]
      };
    } else {
      return generate(ast.ast[0]);
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

var esprima = require("esprima");
var escodegen = require("escodegen");

function generatePairs(ast) {
  if (ast.ast && ast.ast[0].token === "@ORDERED-PAIR") {
    var l = generate(ast.ast[1]);
    var r = generatePairs(ast.ast[2]);
    return [l].concat(r);
  } else {
    return [generate(ast)];
  }
}

function pairCount(ast) {
  if (ast.ast && ast.ast[0].token === "@ORDERED-PAIR") {
    return 1 + pairCount(ast.ast[2]);
  } else {
    return 0;
  }
}

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
    } else if (ast.ast[0].token === "@ASSIGN") {
      var ast1 = generate(ast.ast[1]);
      var ast2 = generate(ast.ast[2]);
      return {
        type: "BinaryExpression",
        operator: "=",
        left: ast1,
        right: ast2
      };
    } else if (ast.ast.length > 1) {
      var ast1 = generate(ast.ast[0]);
      var ast2 = generatePairs(ast.ast[1]);
      return {
        type: "CallExpression",
        callee: ast1,
        arguments: ast2
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

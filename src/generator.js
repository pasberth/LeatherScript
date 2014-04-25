var esprima = require("esprima");
var escodegen = require("escodegen");

function generatePairs(ast) {
  if (ast.ast && ast.ast[0].token === "@ORDERED-PAIR") {
    var l = generate(ast.ast[1]);
    var r = generatePairs(ast.ast[2]);
    return [l].concat(r);
  } else if (ast.type && ast.type.pair) {   
    var pair = generate(ast);
    var ret = [];
    var cnt = pairCount(ast.type);
    for (var i = 0; i < cnt; ++i) {
      ret.push({ type: "MemberExpression",
        object: pair,
        property: { type: "Literal", value: i },
        computed: true
      });
    }
    return ret;
  } else if (ast.type && ast.type.mutable && ast.type.mutable.pair) {
    var pair = generate(ast);
    var ret = [];
    var cnt = pairCount(ast.type.mutable);
    for (var i = 0; i < cnt; ++i) {
      ret.push({ type: "MemberExpression",
        object: pair,
        property: { type: "Literal", value: i },
        computed: true
      });
    }
    return ret;
  } else {
    return [generate(ast)];
  }
}

function pairCount(type) {
  if (type.pair) {
    return 1 + pairCount(type.pair[1]);
  } else {
    return 1;
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
    } else if (ast.ast[0].token === "@ORDERED-PAIR") {
        var x = generate(ast.ast[1]);
        var y = generate(ast.ast[2]);
        return {
          type: "ArrayExpression",
          elements: [x, y]
        };
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

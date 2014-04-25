var esprima = require("esprima");
var escodegen = require("escodegen");

function isObj(type) {
  if (type.variant) {
    return true;
  } else if (type.upair && isObj(type.upair[0]) && isObj(type.upair[1])) {
    return true;
  } else {
    return false;
  }
}

function keys(type) {
  if (type.variant) {
    return [type.variant.tag];
  } else if (type.upair) {
    return keys(type.upair[0]).concat(keys(type.upair[1]));
  } else {
    return [];
  }
}

function generateUPair(ast) {
  if (ast.ast && ast.ast[0].token === "@UNORDERED-PAIR") {
    if (isObj(ast.ast[1].type) && isObj(ast.ast[2].type)) {
      var x = generateUPair(ast.ast[1]);
      var y = generateUPair(ast.ast[2]);
      console.log(ast.ast[1].type);
      var k1 = keys(ast.ast[1].type);
      var k2 = keys(ast.ast[2].type); 
     var ret = { type: "ObjectExpression", properties: [] };
      for (var i = 0; i < k1.length; ++i ){
        ret.properties.push({
          key: { type: "Identifier", name: k1[i] },
          value: { "type": "MemberExpression", object: x, property: { type: "Identifier", name: k1[i] }},
          kind: "init"
        });
      }
      for (var i = 0; i < k2.length; ++i ){
        ret.properties.push({
          key: { type: "Identifier", name: k2[i]},
          value: { "type": "MemberExpression", object: y, property: { type: "Identifier", name: k2[i] }},
          kind: "init"
        });
      }
      return ret;
    } else {
      var x = generateUPair(ast.ast[1]);
      var y = generateUPair(ast.ast[2]);
      return {
        type: "ArrayExpression",
        elements: [x, y]
      };
    }
  } else {
    return generate(ast);
  }
}

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

function generateParams(ast) {
  if (ast.ast && ast.ast[0].token === "@ORDERED-PAIR") {
    var l = generate(ast.ast[1]);
    var r = generatePairs(ast.ast[2]);
    return [l].concat(r);
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
    } else if (ast.ast[0].token === "@ASCRIBE") {
      return generate(ast.ast[1]);
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
    } else if (ast.ast[0].token === "@UNORDERED-PAIR") {
      return generateUPair(ast);
    } else if (ast.ast[0].token === "@ASSIGN") {
      var ast1 = generate(ast.ast[1]);
      var ast2 = generate(ast.ast[2]);
      return {
        type: "BinaryExpression",
        operator: "=",
        left: ast1,
        right: ast2
      };
    } else if (ast.ast[0].token === "@VARIANT") {
      var tag = ast.ast[1].token;
      var val = generate(ast.ast[2]);
      return {
        type: "ObjectExpression",
        properties: [
          { key: { type: "Identifier", name: tag },
            value: val,
            kind: "init"
          }
        ]
      };
    } else if (ast.ast[0].token === "@ARROW") {
      var ast1 = generateParams(ast.ast[1]);
      var ast2 = generate(ast.ast[2]);
      return {
        type: "FunctionExpression",
        params: ast1,
        body: {
          type: "BlockStatement"
          , body: [{
            type: "ReturnStatement",
            argument: ast2
          }]
        }
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

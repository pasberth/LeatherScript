var tokenizer = require('./tokenizer');
var parser = require('./parser');

function lthstx (ast, stxdef) {
  if (! stxdef) {
    stxdef = { tokens: [], notations: [] };
  }
  if (ast.ast && ast.ast[0] && ast.ast[0].token) {
    if (ast.ast[0].token === "@SEQUENCE") {
      stxdef = lthstx(ast.ast[1], stxdef);
      return lthstx(ast.ast[2], stxdef);
    } else if (ast.ast[0].token === "@TOKEN") {
      var tk = ast.ast[1].token.slice(1, -1);
      var tokens = stxdef.tokens.concat([tk]);
      return { tokens: tokens, notations: stxdef.notations };
    } else if (ast.ast[0].token === "@SYNTAX") {
      var pattern = tokenizer.tokenize(stxdef.tokens,
                                       ast.ast[1].token.slice(1, -1)).map(function (tk) { return tk.token; });
      var replacement = { ast: tokenizer.tokenize(stxdef.tokens,
                                           ast.ast[2].token.slice(1, -1)).map(function (tk) { return { token: tk.token }; }) };
      replacement.tk = ast.ast[0];
      var level = ast.ast[3].token;
      var associativity = {};
      associativity[ast.ast[4].token] = true;
      
      var notation = { pattern: pattern,
                       replacement: replacement,
                       level: level,
                       associativity: associativity};
      var notations = stxdef.notations.concat([notation]);
      return { tokens: stxdef.tokens, notations: notations };
    } else if (ast.ast[0].token === "@NOTATION") {
      var pattern = tokenizer.tokenize(stxdef.tokens,
                                       ast.ast[1].token.slice(1, -1)).map(function (tk) { return tk.token; });
      var replacement = parser.parse(stxdef.notations,
                                     tokenizer.tokenize(stxdef.tokens,
                                                        ast.ast[2].token.slice(1, -1)).map(function (tk) { return { token: tk.token }; }));
      var level = ast.ast[3].token;
      var associativity = {};
      associativity[ast.ast[4].token] = true;
      
      var notation = { pattern: pattern,
                       replacement: replacement,
                       level: level,
                       associativity: associativity};
      var notations = stxdef.notations.concat([notation]);
      return { tokens: stxdef.tokens, notations: notations };
    }
  }
}

module.exports = { lthstx: lthstx };

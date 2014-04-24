var tokenizer = require('./tokenizer');

function lthstx (ast, stxdef) {
  if (! stxdef) {
    stxdef = { tokens: [], notations: [] };
  }
  if (ast[0] && ast[0].token) {
    if (ast[0].token === "@SEQUENCE") {
      stxdef = lthstx(ast[1], stxdef);
      return lthstx(ast[2], stxdef);
    } else if (ast[0].token === "@TOKEN") {
      var tk = ast[1].token.slice(1, -1);
      var tokens = stxdef.tokens.concat([tk]);
      return { tokens: tokens, notations: stxdef.notations };
    } else if (ast[0].token === "@SYNTAX") {
      var pattern = tokenizer.tokenize(stxdef.tokens,
                                       ast[1].token.slice(1, -1)).map(function (tk) { return tk.token; });
      var replacement = tokenizer.tokenize(stxdef.tokens,
                                           ast[2].token.slice(1, -1));
      var level = ast[3].token;
      var associativity = {};
      associativity[ast[4].token] = true;
      
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

var fs = require('fs');
var tokenizer = require('./../tokenizer');
var parser = require('./../parser');
var lthstx = require('./../lthstx');

var path1 = process.argv[2];
var path2 = process.argv[3];

fs.readFile(path1, 'utf8', function (err1, text1) {
fs.readFile(path2, 'utf8', function (err2, text2) {
  if (err1 || err2) {
    console.log(err1);
    console.log(err2);
    return;
  }

  var lthstx_json = JSON.parse(text1);
  var tmp = lthstx.lthstx(lthstx_json);
  var tokens = tmp.tokens;
  var notations = tmp.notations;
  var tks = tokenizer.tokenize(tokens, text2);
  var ast = parser.parse(notations, tks);

  if (ast.ParseError) {
    //console.log(tks);
    console.log(ast.ParseError);
    if (tks[ast.ParseError.at]) {
      var errTkn = tks[ast.ParseError.at];
      console.warn((errTkn.lineno + 1) + ":" + (errTkn.columnno + 1) + ": parse error on input `" + errTkn.token + "'");
    } else {
      console.warn("unexpected EOF");
    }
  } else {
    console.log(JSON.stringify(ast, null, 2));
  }
});});

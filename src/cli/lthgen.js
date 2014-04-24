var fs = require('fs');
var tokenizer = require('./../tokenizer');
var generator = require('./../generator');
var escodegen = require('escodegen');

var path = process.argv[2];

fs.readFile(path, 'utf8', function (err1, text1) {
  if (err1) {
    console.log(err1);
    return;
  }

  var lth_json = JSON.parse(text1);
  console.log(escodegen.generate(generator.generate(lth_json)));
});

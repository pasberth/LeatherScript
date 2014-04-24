var fs = require('fs');
var tokenizer = require('./../tokenizer');
var generator = require('./../generator');
var typing = require('./../typing');
var escodegen = require('escodegen');

var path = process.argv[2];

fs.readFile(path, 'utf8', function (err1, text1) {
  if (err1) {
    console.log(err1);
    return;
  }

  var lth_json = JSON.parse(text1);
  var err = typing.typing(lth_json,
                          { console:
                            { variant:
                              { tag: "log",
                                val: { arrow: [
                                  { simple: "string" } ,
                                  { simple: "unit" }  ]}}}});
  if (err) {
    console.log(err);
  }
  console.log(JSON.stringify(lth_json, null, 2));

  console.log(escodegen.generate(generator.generate(lth_json)));
});

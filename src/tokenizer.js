function tokenize(tokenDef, text) {
  var lineno = 0;
  var columnno = 0;
  var t = "ident";
  var tokens = [];
  var buf = "";

  var reset = function () {
    buf = "";
  };

  var take = function (n) {
    var s = text.slice(0, n);
    buf += s;
    text = text.slice(n);
    columnno += s.length;
  };

  var push_token = function () {
    if (buf !== "") {
      tokens.push({ lineno: lineno, columnno: columnno - buf.length, token: buf });
      buf = "";
    }
  };

  loop:
  while (text !== "") {
    if (t === "ident") {
      for (var i = 0; i < tokenDef.length; ++i) {
        var tk = tokenDef[i];
        var look = text.slice(0, tk.length);
        if (tk === look) {
          push_token();
          take(tk.length);
          push_token();
          continue loop;
        }
      }

      if (text[0] === '"') {
        push_token();
  take(1);
        t = "str";
      } else if (text[0] === ' ' || text[0] === '\n') {
        push_token();
  while (text[0] === ' ' || text[0] === '\n') {
    if (text[0] == '\n') {
      lineno += 1;
      columnno = 0;
    } else {
      columnno += 1;
    }
      text = text.slice(1);
  }
      } else {
  take(1);
      }
    } else if (t === "str") {
      if (text[0] === '"') {  
  take(1);
  push_token();
  t = "ident";
      } else if (text[0] === '\\') {

  if (text.length === 1) {
    take(1);
  } else {
    take(2);
  }
      } else {
  take(1);
      }
    }
  }

  push_token();

  return tokens;
}

module.exports = {
  tokenize: tokenize
};

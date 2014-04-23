function isMetaVariable(tk) {
  return tk[0] === '$';
}

function subst(env, replacement) {
  if (Array.isArray(replacement)) {
    return replacement.map(function (item) { return subst(env, item); });
  } else if (isMetaVariable(replacement)) {
    return env[replacement];
  } else {
    return replacement;
  }
}

function variables(pattern) {
  var ret = [];
  for (var i = 0; i < pattern.length; ++i) {
    if (isMetaVariable(pattern[i])) {
      ret.push(pattern[i]);
    }
  }
  return ret;
}

function mkEnv (args, pattern) {
  var env = {};
  var vs = variables(pattern);
  if (args.length != vs.length) {
    console.log(vs);
    console.log(args);
    throw "bad arguments";
  }
  for (var i = 0; i < args.length; ++i) {
    env[vs[i]] = args[i];
  }
  return env;
}

function keywordsInNotations(notations) {
  var kws = {};
  for (var i = 0; i < notations.length; ++i) {
    var notation = notations[i];
    for (var j = 0; j < notation.pattern.length; ++j) {
      var tk = notation.pattern[j];
      if (isMetaVariable(tk)) {
        continue;
      } else {
        kws[tk] = true;
      }
    }
  }
  return kws;
}

function notationMap(notations) {
  var ret = {};
  l:
  for (var i = 0; i < notations.length; ++i) {
    for (var j = 0; j < notations[i].pattern.length; ++j) {
      if (isMetaVariable(notations[i].pattern[j])) {
        continue;
      } else {
        ret[notations[i].pattern[j]] = notations[i];
        continue l;
      }
    }
    ret[""] = notations[i];
  }
  return ret;
}

function parse(notations, tokens) {
  var tokenIndex;
  var stack = [];
  var map = notationMap(notations);
  var kws = keywordsInNotations(notations);
  var left = null;

  var takeOperand = function () {
    if (left) {
      var v = stack[stack.length - 1];
      v.args.push(left);
      v.unconsumed = v.unconsumed.slice(1);
      left = null;
    } else {
      return { ParseError: { at: tokenIndex }};
    }
  };
  
  var reduce = function () {
    var v = stack.pop();
    if (v.unconsumed.length === 0) {

      var replacement = subst(mkEnv(v.args, v.notation.pattern),
                              v.notation.replacement);
      left = replacement;
    } else if (isMetaVariable(v.unconsumed[0])) {
      return { ParseError: { at: i }};
      // throw "parse error on input `" + tokens[i].token + "'";
    } else {
      return { ParseError: { Expected: v.unconsumed[0], at: tokenIndex }};
      // throw v.unconsumed[0] + " expected";
    }
  };

  var reduce1 = function () {
    var pat = stack[stack.length - 1].notation.pattern;
    if (isMetaVariable(pat[pat.length - 1])) {
      var err = takeOperand();
      if (err) {
        return err;
      }
      return reduce();
    } else {
      return reduce();
    }
  };

  var reduceGroup = function (notation) {
    //var reduce1 = function () {
    //  takeOperand();
    //  return reduce();
    //};

    for (var i = stack.length - 1; i >= 0; --i) {
      var v = stack[i];
      if (v.notation.level < notation.level) {
        return;
      } else if (v.notation.level > notation.level) {
        var err = reduce1();
        if (err) {
          return err;
        }
      } else if (v.notation.associativity.left &&
                 notation.associativity.left) {
        var err = reduce1();
        if (err) {
          return err;
        }
      } else if (v.notation.associativity.right &&
                 notation.associativity.right) {
        return;
      } else {
        //console.log(v);
  //console.log(notation);
        return { ParseError: { CantAssoc: [v, notation], at: tokenIndex }};
        // throw "can't assoc";
      }
    }
  };

  for (tokenIndex = 0; tokenIndex < tokens.length; ++tokenIndex) {
    var tk = tokens[tokenIndex];

    if (kws[tk.token]) {
      var notation = map[tk.token];
      if (notation) {
        if (isMetaVariable(notation.pattern[0])) {
          var err = reduceGroup(notation);
          if (err) {
            return err;
          }
          if (! left) {
            return { ParseError: { at: tokenIndex } };
          }
          var v = {
            notation: notation,
            args: [left],
            unconsumed: notation.pattern.slice(2)
          };
          left = null;
          stack.push(v);
        } else {
          var v = {
            notation: notation,
            args: [],
            unconsumed: notation.pattern.slice(1)
          };
          stack.push(v);
        }
      } else {
      }
    } else if (left) {
      var notation = map[""];
      if (notation) {
        var err = reduceGroup(notation);
        if (err) {
          return err;
        }
        var v = {
          notation: notation,
          args: [left],
          unconsumed: notation.pattern.slice(2)
        };
        left = tk;
        stack.push(v);
      } else {
        return { ParseError: { at: tokenIndex } };
      }
    } else {
      left = tk;
    }
  }

  var len = stack.length;

  for (var i = 0; i < len; ++i) {
    var err = reduce1();
    if (err) {
      return err;
    }
  }

  return left;
}

module.exports = {
  parse: parse
};

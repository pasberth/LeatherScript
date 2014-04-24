function typePP(type) {
  if (type.simple) {
    return type.simple
  } else if (type.variant) {
    return "(" + type.variant.tag + " of " + typePP(type.variant.val) + ")"
  } else if (type.arrow) {
    return "(" + typePP(type.arrow[0]) + " -> " + typePP(type.arrow[1]) + ")" 
  } else if (type.forall) {
    return type.forall;
  } else if (type.upair) {
    return "(" + typePP(type.upair[0]) + " & " + typePP(type.upair[1]) + ")"
  }
}

function mkType(ast) {
  if (ast.ast) {
    if (ast.ast[0].token === "@SIMPLE") {
      return { simple: ast.ast[1].token };
    } else if (ast.ast[0].token === "@VARIANT") {
      var y = mkType(ast.ast[2]);
      return { variant: { tag: ast.ast[1].token, val: y }}
    } else if (ast.ast[0].token === "@ARROW") {
      var x = mkType(ast.ast[1]);
      var y = mkType(ast.ast[2]);
      return { arrow: [x, y] };
    } else if (ast.ast[0].token === "@UNORDERED-PAIR") {
      var x = mkType(ast.ast[1]);
      var y = mkType(ast.ast[2]);
      return { upair: [x, y] };
    } else {
      return mkType(ast.ast[0]);
    }

  } else {
    throw "an error occurred";
  }
}

function eqTy(ty1, ty2) {
  if (ty1.simple && ty2.simple && ty1.simple === ty2.simple) {
    return true;
  } else {
    console.log(ty1);
    console.log(ty2);
    return false;
  }
}

function includeTy(ty1, ty2) {
  if (ty1.simple && ty2.simple && ty1.simple === ty2.simple) {
    return true;
  } else if (ty1.variant && ty2.variant && ty1.variant.tag === ty2.variant.tag) {
    return includeTy(ty1.variant.val, ty2.variant.val);
  } else if (ty1.forall) {
    return true;
  } else {
    console.log(ty1);
    console.log(ty2);
    return false;
  }
}

function upairIncludeTy(ty1, ty2) {
  if (ty2.upair) {
    return upairIncludeTy(ty1, ty2.upair[0]) || upairIncludeTy(ty1, ty2.upair[1]);
  } else {
    return includeTy(ty1, ty2);
  }
}

function upairToObj(ty, obj) {
  if (! obj) {
    obj = {};
  }
  if (ty.upair) {
    upairToObj(ty.upair[0], obj);
    upairToObj(ty.upair[1], obj);
    return obj;
  } else if (ty.variant) {
    obj[ty.variant.tag] = ty.variant.val;
    return obj;
  }
}

function typing(ast, env) {
  if (ast.ast) {
    if (ast.ast[0].token === "@MEMBER") {
      typing(ast.ast[1], env);
      if (!ast.ast[1].type || ast.ast[1].type.TypeError) {
        return;
      }
      var expected = { variant:
                         { tag: ast.ast[2].token,
                           val: { forall: "'a" }}}
      if (upairIncludeTy(expected, ast.ast[1].type)) {
        ast.type = upairToObj(ast.ast[1].type)[ast.ast[2].token].val;
      } else {
        ast.type = { TypeError:
                     { Expected:
                       expected,
                       Got: ast.ast[1].type } };
      }
    } else if (ast.ast[0].token === "@VARIANT") {
      typing(ast.ast[2], env);
      if (!ast.ast[2].type || ast.ast[2].type.TypeError) {
        return;
      }
      var tag = ast.ast[1].token;
      ast.type = { variant: { tag: tag, val: ast.ast[2].type }}
    } else if (ast.ast[0].token === "@SEQUENCE") {
      typing(ast.ast[1], env);
      typing(ast.ast[2], env);
      if (!ast.ast[1].type || !ast.ast[2].type || ast.ast[1].type.TypeError || ast.ast[2].type.TypeError) {
        return;
      }
      if (ast.ast[1].type.simple === "unit") {
        ast.type = ast.ast[1].type;
      } else {
        ast.type = { TypeError:
          { Expected: { simple: "unit" },
            Got: ast.ast[1].type
          }
        }
      }
    } else if (ast.ast[0].token === "@ASCRIBE") {
      env[ast.ast[1].token] = mkType(ast.ast[2]);
    } else if (ast.ast.length > 1) {
      typing(ast.ast[0], env);
      typing(ast.ast[1], env);
      if (!ast.ast[0].type || !ast.ast[1].type || ast.ast[0].type.TypeError || ast.ast[1].type.TypeError) {
        return;
      }
      if (ast.ast[0].type.arrow) {
         if (eqTy(ast.ast[0].type.arrow[0], ast.ast[1].type)) {
           ast.type = ast.ast[0].type.arrow[1];
         } else {
           ast.type = { TypeError:
                        { Expected: ast.ast[0].type.arrow[0],
                          Got: ast.ast[1].type
                        }
                      };
         }
      } else {
        ast.type = { TypeError:
                     { Expected: { arrow: [ast.ast[1].type, { forall: "'a" }]}
                       , Got: ast.ast[0].type
                     }
                   };
      }
    } else {
      typing(ast.ast[0]);
      ast.type = ast.ast[0].type;
    }
  } else if (ast.token) {
    if (ast.token[0] === '"') {
      ast.type = { simple: "string" };
    }
    else if (env[ast.token]) {
      ast.type = env[ast.token];
    } else {
      ast.type = { TypeError: { NotInScope: ast.token }};
    }
  }
  else {
    throw "an error occurred";
  }
}

function showLocation(ast) {
  if (ast.token) {
    if (ast.lineno !== undefined && ast.columnno !== undefined) {
      return ((ast.lineno + 1) + ":" + (ast.columnno + 1) + ": ");
    }
  } else {
    for (var i = 0; i < ast.ast.length; i++) {
      var loc = showLocation(ast.ast[i]);
      if (loc) {
        return loc;
      }
    }
  }
}

function printErrors(ast) {
  if (ast.ast) {
    for (var i = 0; i < ast.ast.length; ++i) {
      printErrors(ast.ast[i]);
    };

    if (ast.type && ast.type.TypeError && ast.type.TypeError.Expected) {
      console.log(showLocation(ast));
      console.log("Expected type: " + typePP(ast.type.TypeError.Expected));
      console.log("  Actual type: " + typePP(ast.type.TypeError.Got));
    }
  } else if (ast.token) {
    if (ast.type && ast.type.TypeError) {
      if (ast.type.TypeError.NotInScope) {
        console.log(showLocation(ast) + "not in scope `" + ast.type.TypeError.NotInScope + "'");
      }
    }
  }
  else {
    throw "an error occurred";
  }
}

module.exports = { typing: typing, printErrors: printErrors };

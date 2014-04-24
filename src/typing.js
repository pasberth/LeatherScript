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
    } else {
      return mkType(ast.ast[0]);
    }

  } else {
    throw "an error occurred";
  }
}

function typing(ast, env) {
  if (ast.ast) {
    if (ast.ast[0].token === "@MEMBER") {
      typing(ast.ast[1], env);
      if (!ast.ast[1].type || ast.ast[1].type.TypeError) {
        return;
      }
      if (ast.ast[1].type.variant &&
          ast.ast[1].type.variant.tag === ast.ast[2].token) {
        ast.type = ast.ast[1].type.variant.val;
      } else {
        ast.type = { TypeError:
                     { Expected:
                       { variant:
                         { tag: ast.ast[2].token,
                           val: { forall: "'a" }}},
                       Got: ast.ast[1].type } };
      }
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
    } else {
      typing(ast.ast[0], env);
      typing(ast.ast[1], env);
      if (!ast.ast[0].type || !ast.ast[1].type || ast.ast[0].type.TypeError || ast.ast[1].type.TypeError) {
        return;
      }
      if (ast.ast[0].type.arrow) {
         if (ast.ast[0].type.arrow[0].simple === ast.ast[1].type.simple) {
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
      console.log(ast);
      console.log(showLocation(ast));
      console.log("expected: ");
      console.log(JSON.stringify(ast.type.TypeError.Expected));
      console.log("but got: ");
      console.log(JSON.stringify(ast.type.TypeError.Got));
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

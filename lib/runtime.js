function NonExhaustivePatterns(message) {
  this.message = message;
}

NonExhaustivePatterns.prototype = {
  prototype: Error.prototype,
  name: "NonExhaustivePatterns"
};

function addition(x, y) {
  return x + y;
}

function subtraction(x, y) {
  return x - y;
}

function  multiplication(x, y) {
  return x * y;
}

function division(x, y) {
  return x / y;
}

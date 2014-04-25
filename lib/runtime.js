function NonExhaustivePatterns(message) {
  this.message = message;
}

NonExhaustivePatterns.prototype = {
  prototype: Error.prototype,
  name: "NonExhaustivePatterns"
};

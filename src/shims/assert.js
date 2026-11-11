function assert(value, message) {
  if (!value) {
    throw new Error(message ?? "Assertion failed");
  }
}

assert.ok = assert;

assert.strictEqual = function (actual, expected, message) {
  if (actual !== expected) {
    throw new Error(message ?? "Expected values to be strictly equal");
  }
};

export default assert;

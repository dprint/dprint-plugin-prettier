const PRECEDENCE = new Map(
  [
    ["|>"],
    ["??"],
    ["||"],
    ["&&"],
    ["|"],
    ["^"],
    ["&"],
    ["==", "===", "!=", "!=="],
    ["<", ">", "<=", ">=", "in", "instanceof"],
    [">>", "<<", ">>>"],
    ["+", "-"],
    ["*", "/", "%"],
    ["**"],
  ].flatMap(/** @returns {any[]} */ (operators, index) =>
    operators.map(/** @returns {any[]} */ (operator) => [operator, index]),
  ),
);
/** @returns {number | undefined} */ function getPrecedence(/** @type {string | undefined} */ operator) {
  return PRECEDENCE.get(operator);
}

export { getPrecedence };

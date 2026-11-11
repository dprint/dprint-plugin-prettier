import { bitshiftOperators } from "./should-flatten.js";

/** @returns {boolean} */ function isBitwiseOperator(/** @type {string} */ operator) {
  return (
    Boolean(bitshiftOperators[operator]) ||
    operator === "|" ||
    operator === "^" ||
    operator === "&"
  );
}

export { isBitwiseOperator };

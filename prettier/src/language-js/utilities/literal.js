// @nts-check
/**
@import {
  Node,
  NodeMap,
  Comment,
  NumericLiteral,
  StringLiteral,
  RegExpLiteral,
  BigIntLiteral,
  BooleanLiteral,
} from "../types/estree.js";
*/

/**
 * @param {Node} node
 * @returns {node is BigIntLiteral}
 */
function isBigIntLiteral(node) {
  return (
    node.type === "BigIntLiteral" ||
    (node.type === "Literal" &&
      // @ts-expect-error -- Safe
      Boolean(node.bigint))
  );
}

/**
 * @param {import("../types/estree.js").Node} node
 * @returns {node is BooleanLiteral}
 */
function isBooleanLiteral(node) {
  return (
    node.type === "BooleanLiteral" ||
    (node.type === "Literal" && typeof node.value === "boolean")
  );
}

/**
 * @param {import("../types/estree.js").Node} node
 * @returns {node is NumericLiteral}
 */
function isNumericLiteral(node) {
  return (
    node.type === "NumericLiteral" ||
    (node.type === "Literal" && typeof node.value === "number")
  );
}

/**
 * @param {Node} node
 * @returns {boolean}
 */
function isRegExpLiteral(node) {
  return (
    node.type === "RegExpLiteral" ||
    (node.type === "Literal" &&
      // @ts-expect-error -- Safe
      Boolean(node.regex))
  );
}

/**
 * @param {import("../types/estree.js").Node} node
 * @returns {node is StringLiteral}
 */
function isStringLiteral(node) {
  return (
    node?.type === "StringLiteral" ||
    (node?.type === "Literal" && typeof node.value === "string")
  );
}

export {
  isBigIntLiteral,
  isBooleanLiteral,
  isNumericLiteral,
  isRegExpLiteral,
  isStringLiteral,
};

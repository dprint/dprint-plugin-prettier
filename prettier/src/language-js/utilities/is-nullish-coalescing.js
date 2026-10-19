// @nts-check
/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {any} node
 * @returns {boolean}
 */
function isNullishCoalescing(node) {
  return node.type === "LogicalExpression" && node.operator === "??";
}

export { isNullishCoalescing };

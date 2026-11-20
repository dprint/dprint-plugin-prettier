// @nts-check
/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {import("../types/estree.js").Node} node
 * @returns {boolean}
 */
function isNullishCoalescing(node) {
  return node.type === "LogicalExpression" && node.operator === "??";
}

export { isNullishCoalescing };

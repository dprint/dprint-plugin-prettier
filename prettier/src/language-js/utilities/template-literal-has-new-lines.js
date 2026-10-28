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
} from "../types/estree.js";
@import AstPath from "../../common/ast-path.js";
*/

/**
 * @param {import("../types/estree.js").Node} template
 * @returns {boolean}
 */
function templateLiteralHasNewLines(template) {
  return /** @type {import("../types/estree.js").Node[]} */ (template.quasis).some(/** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ quasi) => /** @type {string} */ (quasi.value.raw).includes("\n"));
}

export { templateLiteralHasNewLines };

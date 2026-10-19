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
 * @param {any} template
 * @returns {boolean}
 */
function templateLiteralHasNewLines(template) {
  return template.quasis.some(/** @returns {boolean} */ (quasi) => quasi.value.raw.includes("\n"));
}

export { templateLiteralHasNewLines };

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
const isTsAsConstExpression = (node) =>
  node?.type === "TSAsExpression" &&
  node.typeAnnotation.type === "TSTypeReference" &&
  node.typeAnnotation.typeName.type === "Identifier" &&
  node.typeAnnotation.typeName.name === "const";

export { isTsAsConstExpression };

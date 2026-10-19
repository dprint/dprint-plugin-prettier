// @nts-check
import { hasDescendant } from "../../utilities/ast.js";
import getVisitorKeys from "../traverse/get-visitor-keys.js";

/**
@import {
  Node,
} from "../types/estree.js";
*/

/**
 * @param {any} node
 * @param {(node: Node) => boolean} predicate
 * @returns {boolean}
 */
function hasNode(node, predicate) {
  return predicate(node) || hasDescendant(node, { getVisitorKeys, predicate });
}

export { hasNode };

// @nts-check
import { isIndex } from "./is-index.js";
import { locEnd } from "./overrides.js";
import { locStart } from "./start.js";

/**
@import {Node, Comment} from "../types/estree.js";
*/

/**
 * @param {any} nodeA
 * @param {any} nodeB
 * @returns {boolean}
 */
function hasSameLocStart(nodeA, nodeB) {
  /** @type {number} */ const nodeAStart = locStart(nodeA);
  return isIndex(nodeAStart) && nodeAStart === locStart(nodeB);
}

/**
 * @param {any} nodeA
 * @param {any} nodeB
 * @returns {boolean}
 */
function hasSameLocEnd(nodeA, nodeB) {
  /** @type {number} */ const nodeAEnd = locEnd(nodeA);
  return isIndex(nodeAEnd) && nodeAEnd === locEnd(nodeB);
}

/**
 * @param {any} nodeA
 * @param {any} nodeB
 * @returns {boolean}
 */
function hasSameLoc(nodeA, nodeB) {
  return hasSameLocStart(nodeA, nodeB) && hasSameLocEnd(nodeA, nodeB);
}

export { hasSameLoc, hasSameLocStart };

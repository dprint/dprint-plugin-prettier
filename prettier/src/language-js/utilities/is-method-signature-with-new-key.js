// @nts-check
import { isStringLiteral } from "./node-types.js";

/**
@import {Node} from "../types/estree.js"
*/

const isIdentifierNew = /** @returns {boolean} */ (/** @type {Node} */ node) =>
  node.type === "Identifier" && node.name === "new";
const isStringLiteralNew = /** @returns {boolean} */ (/** @type {Node} */ node) =>
  isStringLiteral(node) && node.value === "new";

/** @returns {boolean} */ function isFlowMethodSignatureWithNewKey(/** @type {Node} */ node) {
  return (
    node.type === "ObjectTypeProperty" &&
    node.method &&
    !node.computed &&
    (isStringLiteralNew(node.key) || isIdentifierNew(node.key))
  );
}

/** @returns {boolean} */ function isTsMethodSignatureWithNewKey(/** @type {Node} */ node) {
  return (
    node.type === "TSMethodSignature" &&
    !node.computed &&
    isStringLiteralNew(node.key)
  );
}

/**
@param {Node} node
@returns {boolean}
*/
function isMethodSignatureWithNewKey(node) {
  return (
    isTsMethodSignatureWithNewKey(node) || isFlowMethodSignatureWithNewKey(node)
  );
}

export { isFlowMethodSignatureWithNewKey, isMethodSignatureWithNewKey };

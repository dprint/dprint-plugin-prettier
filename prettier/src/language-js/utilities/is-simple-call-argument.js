// @nts-check
import getStringWidth from "../../utilities/get-string-width.js";
import { getCallArguments } from "./call-arguments.js";
import { createTypeCheckFunction } from "./create-type-check-function.js";
import {
  isArrayExpression,
  isCallLikeExpression,
  isLiteral,
  isMemberExpression,
  isObjectExpression,
  isRegExpLiteral,
} from "./node-types.js";
import { stripChainElementWrappers } from "./strip-chain-element-wrappers.js";

/**
@import {
  Node,
} from "../types/estree.js";
*/

const simpleCallArgumentUnaryOperators = new Set(["!", "-", "+", "~"]);

const isSingleWordType = createTypeCheckFunction([
  "Identifier",
  "ThisExpression",
  "Super",
  "PrivateName",
  "PrivateIdentifier",
]);

/**
 * @param {import("../types/estree.js").Node} node
 * @param {number} depth
 * @returns {boolean}
 */
function isSimpleCallArgument(node, depth = 2) {
  if (depth <= 0) {
    return false;
  }

  const isChildSimple = /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ child) => isSimpleCallArgument(child, depth - 1);

  node = stripChainElementWrappers(node);

  if (isRegExpLiteral(node)) {
    return (
      // @ts-expect-error -- safe
      getStringWidth(node.pattern ?? node.regex.pattern) <= 5
    );
  }

  if (
    isLiteral(node) ||
    isSingleWordType(node) ||
    node.type === "ArgumentPlaceholder"
  ) {
    return true;
  }

  if (node.type === "TemplateLiteral") {
    return (
      /** @type {import("../types/estree.js").Node[]} */ (node.quasis).every(/** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ element) => !/** @type {string} */ (element.value.raw).includes("\n")) &&
      /** @type {import("../types/estree.js").Node[]} */ (node.expressions).every(isChildSimple)
    );
  }

  if (isObjectExpression(node)) {
    return /** @type {import("../types/estree.js").Node[]} */ (node.properties).every(
      /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ property) =>
        // @ts-expect-error -- FIXME
        !property.computed &&
        // @ts-expect-error -- FIXME
        (property.shorthand ||
          // @ts-expect-error -- FIXME
          (property.value && isChildSimple(property.value))),
    );
  }

  if (isArrayExpression(node)) {
    return /** @type {import("../types/estree.js").Node[]} */ (node.elements).every(/** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ x) => x === null || isChildSimple(x));
  }

  if (isCallLikeExpression(node)) {
    if (
      node.type === "ImportExpression" ||
      isSimpleCallArgument(node.callee, depth)
    ) {
      const args = getCallArguments(node);
      return args.length <= depth && args.every(isChildSimple);
    }
    return false;
  }

  if (isMemberExpression(node)) {
    return (
      isSimpleCallArgument(node.object, depth) &&
      isSimpleCallArgument(node.property, depth)
    );
  }

  if (
    (node.type === "UnaryExpression" &&
      simpleCallArgumentUnaryOperators.has(node.operator)) ||
    node.type === "UpdateExpression"
  ) {
    return isSimpleCallArgument(node.argument, depth);
  }

  return false;
}

export { isSimpleCallArgument };

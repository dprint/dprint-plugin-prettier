// @nts-check
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";
import { isNonNullExpression } from "../utilities/node-types.js";

/**
@import AstPath from "../../common/ast-path.js"
* @returns {boolean}
*/

function shouldAddParenthesesToChainExpression(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path) {
  /** @type {{ key: any, parent: import("../types/estree.js").Node }} */ const { key, parent } = path;

  return (
    (key === "object" &&
      parent.type === "MemberExpression" &&
      !parent.optional) ||
    (key === "callee" &&
      parent.type === "CallExpression" &&
      !parent.optional) ||
    (key === "callee" && parent.type === "NewExpression") ||
    (key === "tag" && parent.type === "TaggedTemplateExpression") ||
    (key === "expression" && isNonNullExpression(parent))
  );
}

const isParenthesized = (/** @type {import("../types/estree.js").Node} */ node) => node.extra?.parenthesized;
const isBabelOptionalChainElement = createTypeCheckFunction([
  "OptionalCallExpression",
  "OptionalMemberExpression",
]);

/**
@param {AstPath} path
* @returns {boolean}
*/
function isBabelOptionalChainRoot(path) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  let child = node;
  while (isNonNullExpression(child)) {
    child = child.expression;

    if (isParenthesized(child)) {
      return false;
    }
  }

  if (!isBabelOptionalChainElement(child)) {
    return false;
  }

  if (isParenthesized(node)) {
    return true;
  }

  return !(
    path.key === "expression" && isNonNullExpression(path.parent)
    // We should exclude if it's in `OptionalCallExpression` or `OptionalMemberExpression`
    // But in these cases it should not matter, since we don't need parentheses anyway
  );
}

function isChainExpressionRoot(path) {
  return path.node.type === "ChainExpression" || isBabelOptionalChainRoot(path);
}

/**
@param {AstPath} path
@returns {boolean}
*/
function shouldAddParenthesesToChainElement(path) {
  return (
    isChainExpressionRoot(path) && shouldAddParenthesesToChainExpression(path)
  );
}

export { shouldAddParenthesesToChainElement };

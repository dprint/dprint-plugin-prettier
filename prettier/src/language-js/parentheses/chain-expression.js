// @nts-check
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";

/**
@import AstPath from "../../common/ast-path.js"
* @returns {boolean}
*/

function shouldAddParenthesesToChainExpression(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path) {
  /** @type {{ key: any, parent: import("../types/estree.js").Node }} */ const { key, parent } = path;

  return (
    (key === "expression" && parent.type === "TSNonNullExpression") ||
    (key === "object" &&
      parent.type === "MemberExpression" &&
      !parent.optional) ||
    (key === "callee" &&
      parent.type === "CallExpression" &&
      !parent.optional) ||
    (key === "callee" && parent.type === "NewExpression") ||
    (key === "tag" && parent.type === "TaggedTemplateExpression")
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
  while (child.type === "TSNonNullExpression") {
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
    path.key === "expression" && path.parent.type === "TSNonNullExpression"
    // We should exclude if it's in `OptionalCallExpression` or `OptionalMemberExpression`
    // But in these cases it should not matter, since we don't need parentheses anyway
  );
}

/**
@param {AstPath} path
@returns {boolean}
*/
function shouldAddParenthesesToChainElement(path) {
  return (
    (path.node.type === "ChainExpression" || isBabelOptionalChainRoot(path)) &&
    shouldAddParenthesesToChainExpression(path)
  );
}

export { shouldAddParenthesesToChainElement };

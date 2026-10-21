// @nts-check
import {
  group,
  indent,
  label,
  lineSuffixBoundary,
  softline,
} from "../../document/index.js";
import { getCallArguments } from "../utilities/call-arguments.js";
import {
  isCallExpression,
  isChainElementWrapper,
  isMemberExpression,
  isNumericLiteral,
} from "../utilities/node-types.js";
import { stripChainElementWrappers } from "../utilities/strip-chain-element-wrappers.js";
import { printOptionalToken } from "./miscellaneous.js";

/** @import AstPath from "../../common/ast-path.js" */

const isCallExpressionWithArguments = /** @returns {boolean} */ (node) =>
  isCallExpression(node) && getCallArguments(node).length > 0;

/** @returns {boolean} */ function shouldInlineNewExpressionCallee(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path) {
  let { node: child, ancestors } = path;
  for (const ancestor of ancestors) {
    if (!(
      (isMemberExpression(ancestor) && ancestor.object === child) ||
      (ancestor.type === "TSNonNullExpression" && ancestor.expression === child)
    )) {
      return ancestor.type === "NewExpression" && ancestor.callee === child;
    }

    child = ancestor;
  }

  return false;
}

function printMemberExpression(/** @type {AstPath} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  const objectDoc = print("object");
  const lookupDoc = printMemberLookup(path, options, print);
  const { node } = path;
  const firstNonMemberParent = path.findAncestor(
    /** @returns {boolean} */ (node) =>
      !(isMemberExpression(node) || node.type === "TSNonNullExpression"),
  );
  const firstNonChainElementWrapperParent = path.findAncestor(
    /** @returns {boolean} */ (node) => !isChainElementWrapper(node),
  );

  const shouldInline =
    firstNonMemberParent.type === "BindExpression" ||
    (firstNonMemberParent.type === "AssignmentExpression" &&
      firstNonMemberParent.left.type !== "Identifier") ||
    shouldInlineNewExpressionCallee(path) ||
    node.computed ||
    (node.object.type === "Identifier" &&
      node.property.type === "Identifier" &&
      !isMemberExpression(firstNonChainElementWrapperParent)) ||
    ((firstNonChainElementWrapperParent.type === "AssignmentExpression" ||
      firstNonChainElementWrapperParent.type === "VariableDeclarator") &&
      (isCallExpressionWithArguments(stripChainElementWrappers(node.object)) ||
        objectDoc.label?.memberChain));

  return label(objectDoc.label, [
    objectDoc,
    lineSuffixBoundary,
    shouldInline ? lookupDoc : group(indent([softline, lookupDoc])),
  ]);
}

function printMemberLookup(/** @type {AstPath} */ path, options, /** @type {(a0?: any) => any} */ print) {
  const property = print("property");
  const { node } = path;
  const optional = printOptionalToken(path);

  if (!node.computed) {
    return [optional, ".", property];
  }

  if (!node.property || isNumericLiteral(node.property)) {
    return [optional, "[", property, "]"];
  }

  return group([optional, "[", indent([softline, property]), softline, "]"]);
}

export { printMemberExpression, printMemberLookup };

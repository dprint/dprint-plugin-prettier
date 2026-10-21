// @nts-check
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { isObjectProperty } from "../utilities/is-object-property.js";
import { isArrayExpression } from "../utilities/node-types.js";

/** @import AstPath from "../../common/ast-path.js" */

const angularComponentObjectExpressionPredicates = [
  /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node, /** @type {string} */ name) => name === "properties" && node.type === "ObjectExpression",
  /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node, /** @type {string} */ name) =>
    name === "arguments" &&
    node.type === "CallExpression" &&
    node.callee.type === "Identifier" &&
    node.callee.name === "Component",
  /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node, /** @type {string} */ name) => name === "expression" && node.type === "Decorator",
];

/**
 * Angular Components can have:
 * - Inline HTML template
 * - Inline CSS styles
 *
 * ...which are both within template literals somewhere
 * inside of the Component decorator factory.
 *
 * E.g.
 * @Component({
 *  template: `<div>...</div>`,
 *  styles: [`h1 { color: blue; }`]
 * })
 * @returns {boolean}
 */
function isAngularComponentStyles(/** @type {AstPath} */ path) {
  const isTemplateLiteral = /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) => node.type === "TemplateLiteral";
  const isObjectPropertyNamedStyles = /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node, /** @type {string} */ key) =>
    isObjectProperty(node) &&
    !node.computed &&
    node.key.type === "Identifier" &&
    node.key.name === "styles" &&
    key === "value";
  return (
    path.match(
      isTemplateLiteral,
      /** @returns {boolean} */ (node, name) => isArrayExpression(node) && name === "elements",
      isObjectPropertyNamedStyles,
      ...angularComponentObjectExpressionPredicates,
    ) ||
    path.match(
      isTemplateLiteral,
      isObjectPropertyNamedStyles,
      ...angularComponentObjectExpressionPredicates,
    )
  );
}
/** @returns {boolean} */ function isAngularComponentTemplate(/** @type {AstPath} */ path) {
  return path.match(
    /** @returns {boolean} */ (node) => node.type === "TemplateLiteral",
    /** @returns {boolean} */ (node, name) =>
      isObjectProperty(node) &&
      !node.computed &&
      node.key.type === "Identifier" &&
      node.key.name === "template" &&
      name === "value",
    ...angularComponentObjectExpressionPredicates,
  );
}

/** @returns {boolean} */ function hasLeadingBlockCommentWithName(/** @type {import("../types/estree.js").Node} */ node, /** @type {string} */ languageName) {
  // This checks for a leading comment that is exactly `/* GraphQL */`
  // In order to be in line with other implementations of this comment tag
  // we will not trim the comment value and we will expect exactly one space on
  // either side of the GraphQL string
  // Also see ./clean.js
  return hasComment(
    node,
    CommentCheckFlags.Block | CommentCheckFlags.Leading,
    /** @returns {boolean} */ ({ value }) => value === ` ${languageName} `,
  );
}
/** @returns {boolean} */ function hasLanguageComment({ node, parent }, /** @type {string} */ languageName) {
  return (
    hasLeadingBlockCommentWithName(node, languageName) ||
    (isAsConstExpression(parent) &&
      hasLeadingBlockCommentWithName(parent, languageName)) ||
    (parent.type === "ExpressionStatement" &&
      hasLeadingBlockCommentWithName(parent, languageName))
  );
}

/** @returns {boolean} */ function isAsConstExpression(/** @type {import("../types/estree.js").Node} */ node) {
  return (
    node.type === "AsConstExpression" ||
    (node.type === "TSAsExpression" &&
      node.typeAnnotation.type === "TSTypeReference" &&
      node.typeAnnotation.typeName.type === "Identifier" &&
      node.typeAnnotation.typeName.name === "const")
  );
}

export {
  hasLanguageComment,
  isAngularComponentStyles,
  isAngularComponentTemplate,
};

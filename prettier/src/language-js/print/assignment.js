// @nts-check
import {
  canBreak,
  cleanDoc,
  group,
  indent,
  indentIfBreak,
  line,
  lineSuffixBoundary,
  willBreak,
} from "../../document/index.js";
import getStringWidth from "../../utilities/get-string-width.js";
import isNonEmptyArray from "../../utilities/is-non-empty-array.js";
import { getCallArguments } from "../utilities/call-arguments.js";
import { CommentCheckFlags, hasComment } from "../utilities/comments.js";
import { hasLeadingOwnLineComment } from "../utilities/has-leading-own-line-comment.js";
import { isIndentableBlockComment } from "../utilities/indentable-block-comment.js";
import { isLoneShortArgument } from "../utilities/is-lone-short-argument.js";
import { isObjectProperty } from "../utilities/is-object-property.js";
import {
  isBinaryish,
  isBooleanLiteral,
  isCallExpression,
  isChainElementWrapper,
  isIntersectionType,
  isMemberExpression,
  isNumericLiteral,
  isStringLiteral,
  isTypeAlias,
  isUnionType,
} from "../utilities/node-types.js";
import { shouldInlineLogicalExpression } from "./binaryish.js";
import { printCallExpression } from "./call-expression.js";
import { shouldHugUnionType } from "./union-type.js";

/**
 * @import AstPath from "../../common/ast-path.js"
 */

function printAssignment(
  /** @type {AstPath} */ path,
  options,
  /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print,
  leftDoc,
  operator,
  /** @type {string | undefined} */ rightPropertyName,
) {
  /** @type {string} */ const layout = chooseLayout(path, options, print, leftDoc, rightPropertyName);

  const rightDoc = rightPropertyName
    ? print(rightPropertyName, { assignmentLayout: layout })
    : "";

  switch (layout) {
    // First break after operator, then the sides are broken independently on their own lines
    case "break-after-operator":
      return group([group(leftDoc), operator, group(indent([line, rightDoc]))]);

    // First break right-hand side, then left-hand side
    case "never-break-after-operator":
      return group([group(leftDoc), operator, " ", rightDoc]);

    // First break right-hand side, then after operator
    case "fluid": {
      const groupId = Symbol("assignment");
      return group([
        group(leftDoc),
        operator,
        group(indent(line), { id: groupId }),
        lineSuffixBoundary,
        indentIfBreak(rightDoc, { groupId }),
      ]);
    }

    case "break-lhs":
      return group([leftDoc, operator, " ", group(rightDoc)]);

    // Parts of assignment chains aren't wrapped in groups.
    // Once one of them breaks, the chain breaks too.
    case "chain":
      return [group(leftDoc), operator, line, rightDoc];

    case "chain-tail":
      return [group(leftDoc), operator, indent([line, rightDoc])];

    case "chain-tail-arrow-chain":
      return [group(leftDoc), operator, rightDoc];

    case "only-left":
      return leftDoc;
  }
}

function printAssignmentExpression(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  return printAssignment(
    path,
    options,
    print,
    print("left"),
    [" ", node.operator],
    "right",
  );
}

function printVariableDeclarator(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  return printAssignment(path, options, print, print("id"), " =", "init");
}

/** @returns {string} */ function chooseLayout(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print, leftDoc, /** @type {string | undefined} */ rightPropertyName) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  /** @type {import("../types/estree.js").Node} */ const rightNode = node[rightPropertyName];

  if (!rightNode) {
    return "only-left";
  }

  // Short assignment chains (only 2 segments) are NOT formatted as chains.
  //   1) a = b = c; (expression statements)
  //   2) var/let/const a = b = c;

  /** @type {boolean} */ const isTail = !isAssignment(rightNode);
  /** @type {boolean} */ const shouldUseChainFormatting = path.match(
    isAssignment,
    isAssignmentOrVariableDeclarator,
    /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) =>
      !isTail ||
      (node.type !== "ExpressionStatement" &&
        node.type !== "VariableDeclaration"),
  );
  if (shouldUseChainFormatting) {
    return !isTail
      ? "chain"
      : rightNode.type === "ArrowFunctionExpression" &&
          rightNode.body.type === "ArrowFunctionExpression"
        ? "chain-tail-arrow-chain"
        : "chain-tail";
  }
  /** @type {boolean} */ const isHeadOfLongChain = !isTail && isAssignment(rightNode.right);

  if (
    isHeadOfLongChain ||
    (isUnionType(rightNode) && !shouldHugUnionType(rightNode)) ||
    hasLeadingOwnLineComment(options.originalText, rightNode) ||
    hasComment(rightNode, CommentCheckFlags.Leading, isIndentableBlockComment)
  ) {
    return "break-after-operator";
  }

  if (
    node.type === "ImportAttribute" ||
    (rightNode.type === "CallExpression" &&
      rightNode.callee.name === "require") ||
    // do not put values on a separate line from the key in JSON
    path.root.type === "JsonRoot"
  ) {
    return "never-break-after-operator";
  }

  /** @type {boolean} */ const canBreakLeftDoc = canBreak(leftDoc);

  if (
    isComplexDestructuring(node) ||
    hasComplexTypeAnnotation(node) ||
    (isArrowFunctionVariableDeclarator(node) && canBreakLeftDoc)
  ) {
    return "break-lhs";
  }

  // wrapping object properties with very short keys usually doesn't add much value
  /** @type {boolean} */ const hasShortKey = isObjectPropertyWithShortKey(node, leftDoc, options);

  if (
    path.call(
      /** @returns {boolean} */ () => shouldBreakAfterOperator(path, options, print, hasShortKey),
      rightPropertyName,
    )
  ) {
    return "break-after-operator";
  }

  if (isComplexTypeAliasParams(node)) {
    return "break-lhs";
  }

  if (
    !canBreakLeftDoc &&
    (hasShortKey ||
      rightNode.type === "TemplateLiteral" ||
      rightNode.type === "TaggedTemplateExpression" ||
      isBooleanLiteral(rightNode) ||
      isNumericLiteral(rightNode) ||
      rightNode.type === "ClassExpression")
  ) {
    return "never-break-after-operator";
  }

  return "fluid";
}

/** @returns {boolean} */ function shouldBreakAfterOperator(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print, /** @type {boolean} */ hasShortKey) {
  /** @type {import("../types/estree.js").Node} */ const rightNode = path.node;

  if (isBinaryish(rightNode) && !shouldInlineLogicalExpression(rightNode)) {
    return true;
  }

  switch (rightNode.type) {
    case "StringLiteralTypeAnnotation":
    case "SequenceExpression":
      return true;
    case "TSConditionalType":
    case "ConditionalTypeAnnotation":
      if (
        !options.experimentalTernaries &&
        !shouldBreakBeforeConditionalType(rightNode)
      ) {
        break;
      }
      return true;
    case "ConditionalExpression": {
      if (!options.experimentalTernaries) {
        const { test } = rightNode;
        return isBinaryish(test) && !shouldInlineLogicalExpression(test);
      }
      const { consequent, alternate } = rightNode;
      return (
        consequent.type === "ConditionalExpression" ||
        alternate.type === "ConditionalExpression"
      );
    }
    case "ClassExpression":
      return isNonEmptyArray(rightNode.decorators);
  }

  if (hasShortKey) {
    return false;
  }

  let node = rightNode;
  const propertiesForPath = [];
  while (true) {
    if (
      node.type === "UnaryExpression" ||
      node.type === "AwaitExpression" ||
      (node.type === "YieldExpression" && node.argument !== null)
    ) {
      node = node.argument;
      propertiesForPath.push("argument");
    } else if (node.type === "TSNonNullExpression") {
      node = node.expression;
      propertiesForPath.push("expression");
    } else {
      break;
    }
  }
  if (
    isStringLiteral(node) ||
    path.call(
      /** @returns {boolean} */ () => isPoorlyBreakableMemberOrCallChain(path, options, print),
      ...propertiesForPath,
    )
  ) {
    return true;
  }

  return false;
}

// prefer to break destructuring assignment
// if it includes default values or non-shorthand properties
/** @returns {boolean} */ function isComplexDestructuring(/** @type {import("../types/estree.js").Node} */ node) {
  if (isAssignmentOrVariableDeclarator(node)) {
    /** @type {import("../types/estree.js").Node} */ const leftNode = node.left || node.id;
    return (
      leftNode.type === "ObjectPattern" &&
      leftNode.properties.length > 2 &&
      /** @type {import("../types/estree.js").Node[]} */ (leftNode.properties).some(
        /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ property) =>
          isObjectProperty(property) &&
          (!property.shorthand || property.value?.type === "AssignmentPattern"),
      )
    );
  }
  return false;
}

/** @returns {boolean} */ function isAssignment(/** @type {import("../types/estree.js").Node} */ node) {
  return node.type === "AssignmentExpression";
}

/** @returns {boolean} */ function isAssignmentOrVariableDeclarator(/** @type {import("../types/estree.js").Node} */ node) {
  return isAssignment(node) || node.type === "VariableDeclarator";
}

/** @returns {boolean} */ function isComplexTypeAliasParams(/** @type {import("../types/estree.js").Node} */ node) {
  const typeParams = getTypeParametersFromTypeAlias(node);
  if (isNonEmptyArray(typeParams)) {
    /** @type {string} */ const constraintPropertyName =
      node.type === "TSTypeAliasDeclaration" ? "constraint" : "bound";
    if (
      typeParams.length > 1 &&
      typeParams.some((param) => param[constraintPropertyName] || param.default)
    ) {
      return true;
    }
  }
  return false;
}

/** @returns {any[] | undefined} */ function getTypeParametersFromTypeAlias(/** @type {import("../types/estree.js").Node} */ node) {
  if (isTypeAlias(node)) {
    return node.typeParameters?.params;
  }
}

/** @returns {boolean} */ function hasComplexTypeAnnotation(/** @type {import("../types/estree.js").Node} */ node) {
  if (node.type !== "VariableDeclarator") {
    return false;
  }
  const { typeAnnotation } = node.id;
  if (!typeAnnotation || !typeAnnotation.typeAnnotation) {
    return false;
  }
  const typeParams = getTypeParametersFromTypeReference(
    typeAnnotation.typeAnnotation,
  );
  return (
    isNonEmptyArray(typeParams) &&
    typeParams.length > 1 &&
    typeParams.some(
      /** @returns {boolean} */ (param) =>
        isNonEmptyArray(getTypeParametersFromTypeReference(param)) ||
        param.type === "TSConditionalType",
    )
  );
}

/** @returns {boolean} */ function isArrowFunctionVariableDeclarator(/** @type {import("../types/estree.js").Node} */ node) {
  return (
    node.type === "VariableDeclarator" &&
    node.init?.type === "ArrowFunctionExpression"
  );
}

/** @returns {any[] | undefined} */ function getTypeParametersFromTypeReference(/** @type {import("../types/estree.js").Node} */ node) {
  /** @type {any} */
  let typeArguments;
  switch (node.type) {
    case "GenericTypeAnnotation":
      typeArguments = node.typeParameters;
      break;
    case "TSTypeReference":
      typeArguments = node.typeArguments;
      break;
  }
  return typeArguments?.params;
}

/**
 * A chain with no calls at all or whose calls are all without arguments or with lone short arguments,
 * excluding chains printed by `printMemberChain`
 * @returns {boolean}
 */
function isPoorlyBreakableMemberOrCallChain(
  /** @type {AstPath} */ path,
  options,
  /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print,
  deep = false,
) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  const goDeeper = /** @returns {boolean} */ () =>
    isPoorlyBreakableMemberOrCallChain(path, options, print, true);

  if (isChainElementWrapper(node)) {
    return path.call(goDeeper, "expression");
  }

  if (isCallExpression(node)) {
    /** @type {any} TODO */
    const doc = printCallExpression(path, options, print);
    if (doc.label?.memberChain) {
      return false;
    }

    const args = getCallArguments(node);
    /** @type {boolean} */ const isPoorlyBreakableCall =
      args.length === 0 ||
      (args.length === 1 && isLoneShortArgument(args[0], options));
    if (!isPoorlyBreakableCall) {
      return false;
    }

    if (isCallExpressionWithComplexTypeArguments(node, print)) {
      return false;
    }

    return path.call(goDeeper, "callee");
  }

  if (isMemberExpression(node)) {
    return path.call(goDeeper, "object");
  }

  return deep && (node.type === "Identifier" || node.type === "ThisExpression");
}

/** @returns {boolean} */ function isObjectPropertyWithShortKey(/** @type {import("../types/estree.js").Node} */ node, keyDoc, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options) {
  if (!isObjectProperty(node)) {
    return false;
  }
  // TODO: for performance, it might make sense to use a more lightweight
  // version of cleanDoc, such that it would stop once it detects that
  // the doc can't be reduced to a string.
  keyDoc = cleanDoc(keyDoc);
  /** @type {number} */ const MIN_OVERLAP_FOR_BREAK = 3;
  //   ↓↓ - insufficient overlap for a line break
  // key1: longValue1,
  //   ↓↓↓↓↓↓ - overlap is long enough to break
  // key2abcd:
  //   longValue2
  return (
    typeof keyDoc === "string" &&
    getStringWidth(keyDoc) < options.tabWidth + MIN_OVERLAP_FOR_BREAK
  );
}

/** @returns {boolean} */ function isCallExpressionWithComplexTypeArguments(/** @type {import("../types/estree.js").Node} */ node, /** @type {import("../print-options.js").JsPrint} */ print) {
  const typeArgs = node.typeArguments?.params;
  if (isNonEmptyArray(typeArgs)) {
    if (typeArgs.length > 1) {
      return true;
    }
    if (typeArgs.length === 1) {
      /** @type {import("../types/estree.js").Node} */ const firstArg = typeArgs[0];
      if (
        isUnionType(firstArg) ||
        isIntersectionType(firstArg) ||
        firstArg.type === "TSTypeLiteral" ||
        firstArg.type === "ObjectTypeAnnotation"
      ) {
        return true;
      }
    }
    if (willBreak(print("typeArguments"))) {
      return true;
    }
  }
  return false;
}

/** @returns {boolean} */ function isGeneric(/** @type {import("../types/estree.js").Node} */ node) {
  switch (node.type) {
    case "FunctionTypeAnnotation":
    case "GenericTypeAnnotation":
    case "TSFunctionType":
      return Boolean(node.typeParameters);
    case "TSTypeReference":
      return Boolean(node.typeArguments);
    default:
      return false;
  }
}

/** @returns {boolean} */ function shouldBreakBeforeConditionalType(/** @type {import("../types/estree.js").Node} */ node) {
  return isGeneric(node.checkType) || isGeneric(node.extendsType);
}

export {
  isArrowFunctionVariableDeclarator,
  printAssignment,
  printAssignmentExpression,
  printVariableDeclarator,
};

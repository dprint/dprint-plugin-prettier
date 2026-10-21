// @nts-check
import { hasComment } from "./comments.js";
import { createTypeCheckFunction } from "./create-type-check-function.js";
import { isIntersectionType, isTupleType, isUnionType } from "./node-types.js";

const isVoidType = createTypeCheckFunction([
  "VoidTypeAnnotation",
  "TSVoidKeyword",
  "NullLiteralTypeAnnotation",
  "TSNullKeyword",
]);

const isObjectLikeType = createTypeCheckFunction([
  "ObjectTypeAnnotation",
  "TSTypeLiteral",
  // This is a bit aggressive but captures Array<{x}>
  "GenericTypeAnnotation",
  "TSTypeReference",
]);

/** @returns {boolean} */ function isMultipleTupleTypeElement(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path) {
  return (
    path.key === "elementTypes" &&
    isTupleType(path.parent) &&
    path.parent.elementTypes.length > 1
  );
}

/** @returns {boolean} */ function shouldHugUnionType(/** @type {import("../types/estree.js").Node} */ node) {
  const { types } = node;
  if (types.some(/** @returns {boolean} */ (node) => hasComment(node))) {
    return false;
  }

  const objectType = types.find(/** @returns {boolean} */ (node) => isObjectLikeType(node));
  if (!objectType) {
    return false;
  }

  return types.every(/** @returns {boolean} */ (node) => node === objectType || isVoidType(node));
}

/** @returns {boolean} */ function shouldUnionTypePrintOwnComments(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path) {
  /** @type {{ key: any, node: import("../types/estree.js").Node, parent: import("../types/estree.js").Node }} */ const { key, node, parent } = path;
  if (
    shouldHugUnionType(node) ||
    // If it's `types` of union type, parent will print comment for it
    (key === "types" && isUnionType(parent)) ||
    // Inside intersection type let the comment print outside of parentheses
    (key === "types" && isIntersectionType(parent)) ||
    isMultipleTupleTypeElement(path)
  ) {
    return false;
  }

  return true;
}

export {
  isMultipleTupleTypeElement,
  shouldHugUnionType,
  shouldUnionTypePrintOwnComments,
};

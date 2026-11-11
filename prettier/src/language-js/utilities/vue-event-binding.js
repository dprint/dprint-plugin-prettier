// @nts-check
import { createTypeCheckFunction } from "../utilities/create-type-check-function.js";

// https://github.com/vuejs/core/blob/35785f3cd7bd86cbec3f8324022491da2d088b61/packages/compiler-core/src/babelUtils.ts#L498
const isVueEventBindingTsNode = createTypeCheckFunction([
  "TSAsExpression", // `foo as number`
  "TSTypeAssertion", // `(<number>foo)`
  "TSNonNullExpression", // `foo!`
  "TSInstantiationExpression", // `foo<string>`
  "TSSatisfiesExpression", // `foo satisfies T`
]);

// https://github.com/vuejs/core/blob/35785f3cd7bd86cbec3f8324022491da2d088b61/packages/compiler-core/src/babelUtils.ts#L506C8-L512C2
function unwrapVueEventBindingTsNode(/** @type {import("../types/estree.js").Node} */ node) {
  if (isVueEventBindingTsNode(node)) {
    return unwrapVueEventBindingTsNode(node.expression);
  }

  return node;
}

// https://github.com/vuejs/core/blob/35785f3cd7bd86cbec3f8324022491da2d088b61/packages/compiler-core/src/utils.ts#L197
const isVueEventBindingFunctionExpression = createTypeCheckFunction([
  "FunctionExpression",
  "ArrowFunctionExpression",
]);

// https://github.com/vuejs/core/blob/35785f3cd7bd86cbec3f8324022491da2d088b61/packages/compiler-core/src/utils.ts#L161
/** @returns {boolean} */ function isVueEventBindingMemberExpression(/** @type {import("../types/estree.js").Node} */ node) {
  return (
    node.type === "MemberExpression" ||
    node.type === "OptionalMemberExpression" ||
    (node.type === "Identifier" && node.name !== "undefined")
  );
}

export {
  isVueEventBindingFunctionExpression,
  isVueEventBindingMemberExpression,
  unwrapVueEventBindingTsNode,
};

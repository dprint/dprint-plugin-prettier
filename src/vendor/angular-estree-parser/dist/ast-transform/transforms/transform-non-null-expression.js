// @nts-check
//#region src/ast-transform/transforms/transform-non-null-expression.ts
const visitNonNullAssert = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").NonNullAssert} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "TSNonNullExpression",
	expression: transformer.transformChild(node.expression)
});
//#endregion
export { visitNonNullAssert };

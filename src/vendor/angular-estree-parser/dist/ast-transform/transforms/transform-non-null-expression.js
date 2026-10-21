// @nts-check
//#region src/ast-transform/transforms/transform-non-null-expression.ts
const visitNonNullAssert = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").NonNullAssert} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "TSNonNullExpression",
	expression: transformer.transformChild(node.expression)
});
//#endregion
export { visitNonNullAssert };

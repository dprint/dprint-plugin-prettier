// @nts-check
//#region src/ast-transform/transforms/transform-array-expression.ts
const visitLiteralArray = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").LiteralArray} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "ArrayExpression",
	elements: transformer.transformChildren(node.expressions)
});
//#endregion
export { visitLiteralArray };

// @nts-check
//#region src/ast-transform/transforms/transform-array-expression.ts
const visitLiteralArray = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").LiteralArray} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "ArrayExpression",
	elements: transformer.transformChildren(node.expressions)
});
//#endregion
export { visitLiteralArray };

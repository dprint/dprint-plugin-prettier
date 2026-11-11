// @nts-check
//#region src/ast-transform/transforms/transform-chained-expression.ts
const visitChain = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").Chain} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "NGChainedExpression",
	expressions: transformer.transformChildren(node.expressions)
});
//#endregion
export { visitChain };

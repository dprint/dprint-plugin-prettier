// @nts-check
//#region src/ast-transform/transforms/transform-chained-expression.ts
const visitChain = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").Chain} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "NGChainedExpression",
	expressions: transformer.transformChildren(node.expressions)
});
//#endregion
export { visitChain };

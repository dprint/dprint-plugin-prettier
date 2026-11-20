// @nts-check
//#region src/ast-transform/transforms/transform-conditional-expression.ts
const visitConditional = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").Conditional} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => {
	const [test, consequent, alternate] = transformer.transformChildren([
		node.condition,
		node.trueExp,
		node.falseExp
	]);
	return {
		type: "ConditionalExpression",
		test,
		consequent,
		alternate
	};
};
//#endregion
export { visitConditional };

// @nts-check
//#region src/ast-transform/transforms/transform-conditional-expression.ts
const visitConditional = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").Conditional} */ node, transformer) => {
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

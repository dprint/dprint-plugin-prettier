// @nts-check
//#region src/ast-transform/transforms/transform-arrow-function-expression.ts
const commonProperties = {
	id: null,
	generator: false,
	async: false,
	expression: true
};
const visitArrowFunction = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").ArrowFunction} */ node, transformer) => ({
	type: "ArrowFunctionExpression",
	params: node.parameters.map((/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").ArrowFunctionIdentifierParameter} */ parameter) => transformer.createNode({
		type: "Identifier",
		name: parameter.name
	}, parameter.sourceSpan)),
	body: transformer.transformChild(node.body),
	...commonProperties
});
//#endregion
export { visitArrowFunction };

// @nts-check
//#region src/ast-transform/transforms/transform-arrow-function-expression.ts
/** @type {{ id: null, generator: boolean, async: boolean, expression: boolean }} */ const commonProperties = {
	id: null,
	generator: false,
	async: false,
	expression: true
};
const visitArrowFunction = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").ArrowFunction} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "ArrowFunctionExpression",
	params: node.parameters.map((/** @type {import("@angular/compiler").ArrowFunctionIdentifierParameter} */ parameter) => transformer.createNode({
		type: "Identifier",
		name: parameter.name
	}, parameter.sourceSpan)),
	body: transformer.transformChild(node.body),
	...commonProperties
});
//#endregion
export { visitArrowFunction };

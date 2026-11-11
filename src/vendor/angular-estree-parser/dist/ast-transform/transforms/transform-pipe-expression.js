// @nts-check
//#region src/ast-transform/transforms/transform-pipe-expression.ts
const visitPipe = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").BindingPipe} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "NGPipeExpression",
	left: transformer.transformChild(node.exp),
	right: transformer.create({
		type: "Identifier",
		name: node.name
	}, node.nameSpan),
	arguments: transformer.transformChildren(node.args)
});
//#endregion
export { visitPipe };

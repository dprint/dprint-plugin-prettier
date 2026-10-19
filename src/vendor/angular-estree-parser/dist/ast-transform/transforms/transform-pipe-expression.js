// @nts-check
//#region src/ast-transform/transforms/transform-pipe-expression.ts
const visitPipe = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").BindingPipe} */ node, transformer) => ({
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

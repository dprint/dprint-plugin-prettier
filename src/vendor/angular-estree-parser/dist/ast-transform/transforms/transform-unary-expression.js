// @nts-check
//#region src/ast-transform/transforms/transform-unary-expression.ts
const transformUnaryExpression = (/** @type {string} */ operator) => (node, transformer) => ({
	type: "UnaryExpression",
	prefix: true,
	operator,
	argument: transformer.transformChild(node.expression)
});
const visitPrefixNot = transformUnaryExpression("!");
const visitTypeofExpression = transformUnaryExpression("typeof");
const visitVoidExpression = transformUnaryExpression("void");
const visitUnary = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").Unary} */ node, transformer) => ({
	type: "UnaryExpression",
	prefix: true,
	argument: transformer.transformChild(node.expr),
	operator: node.operator
});
//#endregion
export { visitPrefixNot, visitTypeofExpression, visitUnary, visitVoidExpression };

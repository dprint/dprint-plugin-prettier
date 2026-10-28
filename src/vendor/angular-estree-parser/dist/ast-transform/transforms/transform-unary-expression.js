// @nts-check
//#region src/ast-transform/transforms/transform-unary-expression.ts
const transformUnaryExpression = (/** @type {string} */ operator) => /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").PrefixNot | import("@angular/compiler").TypeofExpression | import("@angular/compiler").VoidExpression} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "UnaryExpression",
	prefix: true,
	operator,
	argument: transformer.transformChild(node.expression)
});
const visitPrefixNot = transformUnaryExpression("!");
const visitTypeofExpression = transformUnaryExpression("typeof");
const visitVoidExpression = transformUnaryExpression("void");
const visitUnary = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").Unary} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "UnaryExpression",
	prefix: true,
	argument: transformer.transformChild(node.expr),
	operator: node.operator
});
//#endregion
export { visitPrefixNot, visitTypeofExpression, visitUnary, visitVoidExpression };

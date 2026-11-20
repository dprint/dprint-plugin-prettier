// @nts-check
import { Binary } from "@angular/compiler";
//#region src/ast-transform/transforms/transform-binary-expression.ts
const isLogicalOperator = /** @returns {boolean} */ (/** @type {string} */ operator) => operator === "&&" || operator === "||" || operator === "??";
const visitBinary = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").Binary} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => {
	const { operation: operator } = node;
	const [left, right] = transformer.transformChildren([node.left, node.right]);
	if (isLogicalOperator(operator)) return {
		type: "LogicalExpression",
		operator,
		left,
		right
	};
	if (Binary.isAssignmentOperation(operator)) return {
		type: "AssignmentExpression",
		left,
		right,
		operator
	};
	return {
		left,
		right,
		type: "BinaryExpression",
		operator
	};
};
//#endregion
export { visitBinary };

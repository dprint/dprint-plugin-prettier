// @nts-check
import { Binary } from "@angular/compiler";
//#region src/ast-transform/transforms/transform-binary-expression.ts
const isLogicalOperator = /** @returns {boolean} */ (/** @type {string} */ operator) => operator === "&&" || operator === "||" || operator === "??";
const visitBinary = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").Binary} */ node, transformer) => {
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

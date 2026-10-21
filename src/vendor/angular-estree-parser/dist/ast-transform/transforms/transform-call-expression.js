// @nts-check
import { isOptionalObjectOrCallee } from "../../utilities.js";
//#region src/ast-transform/transforms/transform-call-expression.ts
const callOptions = { optional: false };
const safeCallOptions = { optional: true };
const transformCall = ({ optional }) => (node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => {
	const arguments_ = transformer.transformChildren(node.args);
	const callee = transformer.transformChild(node.receiver);
	if (optional || isOptionalObjectOrCallee(callee)) return {
		type: "OptionalCallExpression",
		callee,
		arguments: arguments_,
		optional
	};
	return {
		type: "CallExpression",
		callee,
		arguments: arguments_
	};
};
const visitCall = transformCall(callOptions);
const visitSafeCall = transformCall(safeCallOptions);
//#endregion
export { visitCall, visitSafeCall };

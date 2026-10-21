// @nts-check
import { isOptionalObjectOrCallee } from "../../utilities.js";
//#region src/ast-transform/transforms/transform-call-expression.ts
/** @type {{ optional: boolean }} */ const callOptions = { optional: false };
/** @type {{ optional: boolean }} */ const safeCallOptions = { optional: true };
const transformCall = (/** @type {{ optional: boolean }} */ { optional }) => /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").Call | import("@angular/compiler").SafeCall} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => {
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

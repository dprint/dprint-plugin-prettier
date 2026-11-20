// @nts-check
import { isOptionalObjectOrCallee } from "../../utilities.js";
import { ImplicitReceiver } from "@angular/compiler";
//#region src/ast-transform/transforms/transform-member-expression.ts
/** @type {{ computed: boolean, optional: boolean }} */ const keyedReadOptions = {
	computed: true,
	optional: false
};
/** @type {{ computed: boolean, optional: boolean }} */ const safeKeyedReadOptions = {
	computed: true,
	optional: true
};
/** @type {{ computed: boolean, optional: boolean }} */ const propertyReadOptions = {
	computed: false,
	optional: false
};
/** @type {{ computed: boolean, optional: boolean }} */ const safePropertyReadOptions = {
	computed: false,
	optional: true
};
const transformMemberExpression = (/** @type {{ computed: boolean, optional: boolean }} */ { computed, optional }) => /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").PropertyRead | import("@angular/compiler").SafePropertyRead | import("@angular/compiler").KeyedRead | import("@angular/compiler").SafeKeyedRead} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => {
	const { receiver } = node;
	/** @type {import("../../source.js").NGNode} */ let property;
	if (computed) {
		const { key } = node;
		property = transformer.transformChild(key);
	} else {
		const isImplicitReceiver = receiver instanceof ImplicitReceiver;
		const { name, nameSpan } = node;
		property = transformer.create({
			type: "Identifier",
			name
		}, nameSpan, isImplicitReceiver ? transformer.ancestors : []);
		if (isImplicitReceiver) return property;
	}
	const object = transformer.transformChild(receiver);
	return optional || isOptionalObjectOrCallee(object) ? {
		type: "OptionalMemberExpression",
		optional,
		property,
		object,
		computed
	} : {
		type: "MemberExpression",
		property,
		object,
		computed
	};
};
const visitKeyedRead = transformMemberExpression(keyedReadOptions);
const visitSafeKeyedRead = transformMemberExpression(safeKeyedReadOptions);
const visitPropertyRead = transformMemberExpression(propertyReadOptions);
const visitSafePropertyRead = transformMemberExpression(safePropertyReadOptions);
//#endregion
export { visitKeyedRead, visitPropertyRead, visitSafeKeyedRead, visitSafePropertyRead };

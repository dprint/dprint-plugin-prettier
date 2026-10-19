import { isOptionalObjectOrCallee } from "../../utilities.js";
import { ImplicitReceiver } from "@angular/compiler";
//#region src/ast-transform/transforms/transform-member-expression.ts
const keyedReadOptions = {
	computed: true,
	optional: false
};
const safeKeyedReadOptions = {
	computed: true,
	optional: true
};
const propertyReadOptions = {
	computed: false,
	optional: false
};
const safePropertyReadOptions = {
	computed: false,
	optional: true
};
const transformMemberExpression = ({ computed, optional }) => (node, transformer) => {
	const { receiver } = node;
	let property;
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

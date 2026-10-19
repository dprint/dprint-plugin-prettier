// @nts-check
//#region src/ast-transform/transforms/transform-literal.ts
const visitLiteralPrimitive = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").LiteralPrimitive} */ node) => {
	const { value } = node;
	switch (typeof value) {
		case "boolean": return {
			type: "BooleanLiteral",
			value
		};
		case "number": return {
			type: "NumericLiteral",
			value
		};
		case "object": return { type: "NullLiteral" };
		case "string": return {
			type: "StringLiteral",
			value
		};
		case "undefined": return {
			type: "Identifier",
			name: "undefined"
		};
		/* c8 ignore next 4 */
		default: throw new Error(`Unexpected 'LiteralPrimitive' value type ${typeof value}`);
	}
};
const visitRegularExpressionLiteral = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").RegularExpressionLiteral} */ node) => ({
	type: "RegExpLiteral",
	pattern: node.body,
	flags: node.flags ?? ""
});
//#endregion
export { visitLiteralPrimitive, visitRegularExpressionLiteral };

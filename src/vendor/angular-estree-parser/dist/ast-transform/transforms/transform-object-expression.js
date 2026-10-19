// @nts-check
//#region src/ast-transform/transforms/transform-object-expression.ts
const visitLiteralMap = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").LiteralMap} */ node, transformer) => {
	const { keys, values } = node;
	const createChild = (properties, location = node) => transformer.create(properties, location, [node, ...transformer.ancestors]);
	return {
		type: "ObjectExpression",
		properties: keys.map((keyNode, /** @type {number} */ index) => {
			const valueNode = values[index];
			const range = [keyNode.sourceSpan.start, valueNode.sourceSpan.end];
			if (keyNode.kind === "spread") return createChild({
				type: "SpreadElement",
				argument: transformer.transformChild(valueNode)
			}, range);
			const shorthand = Boolean(keyNode.isShorthandInitialized);
			return createChild({
				type: "ObjectProperty",
				key: createChild(keyNode.quoted ? {
					type: "StringLiteral",
					value: keyNode.key
				} : {
					type: "Identifier",
					name: keyNode.key
				}, keyNode.sourceSpan),
				value: transformer.transformChild(valueNode),
				shorthand,
				computed: false,
				method: false
			}, range);
		})
	};
};
//#endregion
export { visitLiteralMap };

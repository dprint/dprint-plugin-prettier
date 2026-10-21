// @nts-check
//#region src/ast-transform/transforms/transform-template-literal.ts
const visitTaggedTemplateLiteral = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").TaggedTemplateLiteral} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "TaggedTemplateExpression",
	tag: transformer.transformChild(node.tag),
	quasi: transformer.transformChild(node.template)
});
const visitTemplateLiteral = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").TemplateLiteral} */ node, /** @type {import("../node-transformer.js").NodeTransformer | undefined} */ transformer) => ({
	type: "TemplateLiteral",
	quasis: transformer.transformChildren(node.elements),
	expressions: transformer.transformChildren(node.expressions)
});
const visitTemplateLiteralElement = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").TemplateLiteralElement} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => {
	const [parent] = transformer.ancestors;
	const { elements } = parent;
	const elementIndex = elements.indexOf(node);
	const isFirst = elementIndex === 0;
	const isLast = elementIndex === elements.length - 1;
	const end = node.sourceSpan.end - (isLast ? 1 : 0);
	const start = node.sourceSpan.start + (isFirst ? 1 : 0);
	const raw = transformer.text.slice(start, end);
	return {
		type: "TemplateElement",
		value: {
			cooked: node.text,
			raw
		},
		tail: isLast,
		range: [start, end]
	};
};
//#endregion
export { visitTaggedTemplateLiteral, visitTemplateLiteral, visitTemplateLiteralElement };

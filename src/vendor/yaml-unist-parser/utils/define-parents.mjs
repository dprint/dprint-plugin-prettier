// @nts-check
/** @import { YamlNode } from "../transforms/context.mjs" */
//#region src/utils/define-parents.ts
function defineParents(/** @type {YamlNode} */ node, /** @type {YamlNode | null} */ parent = null) {
	if ("children" in node) node.children.forEach((child) => defineParents(child, node));
	if ("anchor" in node && node.anchor) defineParents(node.anchor, node);
	if ("tag" in node && node.tag) defineParents(node.tag, node);
	// istanbul ignore if -- @preserve
	if ("leadingComments" in node) node.leadingComments.forEach((comment) => defineParents(comment, node));
	if ("middleComments" in node) node.middleComments.forEach((comment) => defineParents(comment, node));
	if ("indicatorComment" in node && node.indicatorComment) defineParents(node.indicatorComment, node);
	if ("trailingComment" in node && node.trailingComment) defineParents(node.trailingComment, node);
	if ("endComments" in node) node.endComments.forEach((comment) => defineParents(comment, node));
	Object.defineProperty(node, "_parent", {
		value: parent,
		enumerable: false
	});
}
//#endregion
export { defineParents };

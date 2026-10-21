// @nts-check
import { createAnchor } from "../factories/anchor.mjs";
import { createContent } from "../factories/content.mjs";
import { createTag } from "../factories/tag.mjs";
//#region src/transforms/content.ts
function transformContentProperties(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar | import("../../yaml/browser/dist/nodes/YAMLMap.js").YAMLMap | import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/nodes/Alias.js").Alias | import("../../yaml/browser/dist/schema/yaml-1.1/omap.js").YAMLOMap | import("../../yaml/browser/dist/schema/yaml-1.1/set.js").YAMLSet} */ node, /** @type {any[]} */ tokens, /** @type {import("./context.mjs").default | undefined} */ context) {
	const middleComments = [];
	let firstTagOrAnchorRange = null;
	let tag = null;
	let anchor = null;
	for (const token of tokens) {
		const tokenRange = [token.offset, token.offset + token.source.length];
		switch (token.type) {
			case "tag":
				{
					firstTagOrAnchorRange ?? (firstTagOrAnchorRange = tokenRange);
					let resolvedTag = node.tag ?? token.source.slice(token.source.startsWith("!!") ? 2 : 1);
					if (resolvedTag === "!") resolvedTag = "tag:yaml.org,2002:str";
					tag = createTag(context.transformRange(tokenRange), resolvedTag);
				}
				break;
			case "anchor":
				firstTagOrAnchorRange ?? (firstTagOrAnchorRange = tokenRange);
				anchor = createAnchor(context.transformRange(tokenRange), node.anchor);
				break;
			case "comment": {
				const comment = context.transformComment(token);
				if (firstTagOrAnchorRange && firstTagOrAnchorRange[0] <= tokenRange[0] && tokenRange[1] <= node.range[0]) middleComments.push(comment);
				break;
			}
			// istanbul ignore next -- @preserve
			default: throw new Error(`Unexpected content property token type: ${token.type}`);
		}
	}
	return createContent(tag, anchor, middleComments);
}
//#endregion
export { transformContentProperties };

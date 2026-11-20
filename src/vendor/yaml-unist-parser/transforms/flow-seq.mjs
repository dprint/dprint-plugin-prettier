// @nts-check
import { createPosition } from "../factories/position.mjs";
import { maybeContentPropertyToken, tokens } from "../cst.mjs";
import { extractComments } from "../utils/extract-comments.mjs";
import { createFlowMappingItem } from "../factories/flow-mapping-item.mjs";
import { transformPair } from "./pair.mjs";
import { createFlowSequence } from "../factories/flow-sequence.mjs";
import { createFlowSequenceItem } from "../factories/flow-sequence-item.mjs";
import { getLast } from "../utils/get-last.mjs";
import * as YAML from "yaml";
//#region src/transforms/flow-seq.ts
/** @returns {import("yaml-unist-types").YamlNode} */ function transformFlowSeq(/** @type {import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/schema/yaml-1.1/omap.js").YAMLOMap} */ flowSeq, /** @type {import("./context.mjs").default} */ context, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	const srcToken = flowSeq.srcToken;
	// istanbul ignore if -- @preserve
	if (!srcToken || srcToken.type !== "flow-collection") throw new Error("Expected flow-collection CST node for flow sequence");
	const flowSequenceItems = flowSeq.items.map((/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar | import("../../yaml/browser/dist/nodes/YAMLMap.js").YAMLMap | import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/nodes/Pair.js").Pair | import("../../yaml/browser/dist/nodes/Alias.js").Alias} */ item, /** @type {number} */ index) => {
		const srcItem = srcToken.items[index];
		if (isBlockMappingOfImmediateChildOfFlowSequence(item, srcItem)) {
			const pair = getLast(item.items);
			return transformPair(pair, srcItem, context, createFlowMappingItem);
		}
		if (!YAML.isPair(item)) {
			/** @type {import("yaml-cst-types").Token[]} */ const propTokens = [];
			for (const token of tokens(srcItem.start)) {
				if (maybeContentPropertyToken(token)) {
					propTokens.push(token);
					continue;
				}
				// istanbul ignore else -- @preserve
				if (token.type === "comma") continue;
				// istanbul ignore next -- @preserve
				throw new Error(`Unexpected token type in sequence item start: ${token.type}`);
			}
			const node = context.transformNode(item, { tokens: propTokens });
			return createFlowSequenceItem(createPosition(node.position.start, node.position.end), node);
		} else return transformPair(item, srcItem, context, createFlowMappingItem);
	});
	if (flowSeq.items.length < srcToken.items.length) for (let i = flowSeq.items.length; i < srcToken.items.length; i++) {
		const srcItem = srcToken.items[i];
		for (const token of extractComments(srcItem.start, context)) {
			// istanbul ignore else -- @preserve
			if (token.type === "comma") continue;
			// istanbul ignore next -- @preserve
			throw new Error(`Unexpected token type in collection item start: ${token.type}`);
		}
	}
	/** @type {import("yaml-cst-types").Token | null} */ let flowSeqEndToken = null;
	for (const token of tokens(srcToken.end)) {
		if (token.type === "comment") {
			context.transformComment(token);
			continue;
		}
		// istanbul ignore else -- @preserve
		if (token.type === "flow-seq-end") {
			flowSeqEndToken = token;
			continue;
		}
		// istanbul ignore next -- @preserve
		throw new Error(`Unexpected token type in flow seq end: ${token.type}`);
	}
	// istanbul ignore if -- @preserve
	if (!flowSeqEndToken) throw new Error("Expected flow-seq-end token");
	return createFlowSequence(context.transformRange([srcToken.start.offset, flowSeqEndToken.offset + flowSeqEndToken.source.length]), context.transformContentProperties(flowSeq, props.tokens), flowSequenceItems);
}
/**
* Checks whether the given item is a block mapping that is an immediate child of a flow sequence.
* This is determined by checking if the item does not have a source token and contains exactly one item.
*
* e.g.
*
* ```yaml
* [ key: value ]
* ```
* @returns {boolean}
*/
function isBlockMappingOfImmediateChildOfFlowSequence(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar | import("../../yaml/browser/dist/nodes/YAMLMap.js").YAMLMap | import("../../yaml/browser/dist/nodes/YAMLSeq.js").YAMLSeq | import("../../yaml/browser/dist/nodes/Pair.js").Pair | import("../../yaml/browser/dist/nodes/Alias.js").Alias} */ item, /** @type {import("yaml-cst-types").CollectionItem} */ srcItem) {
	if (item.srcToken) return false;
	// istanbul ignore if -- @preserve
	if (!YAML.isMap(item)) return false;
	// istanbul ignore if -- @preserve
	if (item.items.length !== 1) return false;
	return item.items[0].srcToken === srcItem;
}
//#endregion
export { transformFlowSeq };

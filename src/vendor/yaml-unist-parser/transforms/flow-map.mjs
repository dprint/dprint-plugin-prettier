// @nts-check
import { extractComments } from "../utils/extract-comments.mjs";
import { createFlowMapping } from "../factories/flow-mapping.mjs";
import { createFlowMappingItem } from "../factories/flow-mapping-item.mjs";
import { transformPair } from "./pair.mjs";
//#region src/transforms/flow-map.ts
function transformFlowMap(flowMap, /** @type {import("./context.mjs").default} */ context, props) {
	const srcToken = flowMap.srcToken;
	// istanbul ignore if -- @preserve
	if (!srcToken || srcToken.type !== "flow-collection") throw new Error("Expected flow-collection CST node for flow map");
	const flowMappingItems = flowMap.items.map((/** @type {import("../../yaml/resolveSeq-67caf78a.js").P} */ pair, /** @type {number} */ index) => {
		const srcItem = srcToken.items[index];
		return transformPair(pair, srcItem, context, createFlowMappingItem);
	});
	if (flowMap.items.length < srcToken.items.length) for (let i = flowMap.items.length; i < srcToken.items.length; i++) {
		const srcItem = srcToken.items[i];
		for (const token of extractComments(srcItem.start, context)) {
			// istanbul ignore else -- @preserve
			if (token.type === "comma") continue;
			// istanbul ignore next -- @preserve
			throw new Error(`Unexpected token type in collection item start: ${token.type}`);
		}
	}
	let flowMapEndToken = null;
	for (const token of extractComments(srcToken.end, context)) {
		// istanbul ignore else -- @preserve
		if (token.type === "flow-map-end") {
			flowMapEndToken = token;
			continue;
		}
		// istanbul ignore next -- @preserve
		throw new Error(`Unexpected token type in flow map end: ${token.type}`);
	}
	// istanbul ignore if -- @preserve
	if (!flowMapEndToken) throw new Error("Expected flow-map-end token");
	return createFlowMapping(context.transformRange([srcToken.start.offset, flowMapEndToken.offset + flowMapEndToken.source.length]), context.transformContentProperties(flowMap, props.tokens), flowMappingItems);
}
//#endregion
export { transformFlowMap };

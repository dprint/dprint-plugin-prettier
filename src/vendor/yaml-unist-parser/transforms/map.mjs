// @nts-check
import { createPosition } from "../factories/position.mjs";
import { extractComments } from "../utils/extract-comments.mjs";
import { transformPair } from "./pair.mjs";
import { getLast } from "../utils/get-last.mjs";
import { createMapping } from "../factories/mapping.mjs";
import { createMappingItem } from "../factories/mapping-item.mjs";
//#region src/transforms/map.ts
function transformMap(/** @type {import("../../yaml/browser/dist/nodes/YAMLMap.js").YAMLMap | import("../../yaml/browser/dist/schema/yaml-1.1/set.js").YAMLSet} */ map, /** @type {import("./context.mjs").default} */ context, props) {
	const srcToken = map.srcToken;
	// istanbul ignore if -- @preserve
	if (!srcToken || srcToken.type !== "block-map") throw new Error("Expected block mapping srcToken");
	const mappingItems = map.items.map((/** @type {import("../../yaml/browser/dist/nodes/Pair.js").Pair} */ pair, /** @type {number} */ index) => {
		const srcItem = srcToken.items[index];
		return transformPair(pair, srcItem, context, createMappingItem);
	});
	if (map.items.length < srcToken.items.length) for (let i = map.items.length; i < srcToken.items.length; i++) {
		const srcItem = srcToken.items[i];
		for (const token of extractComments(srcItem.start, context))
 // istanbul ignore next -- @preserve
		throw new Error(`Unexpected token type in collection item start: ${token.type}`);
	}
	return createMapping(createPosition(mappingItems[0].position.start, getLast(mappingItems).position.end), context.transformContentProperties(map, props.tokens), mappingItems);
}
//#endregion
export { transformMap };

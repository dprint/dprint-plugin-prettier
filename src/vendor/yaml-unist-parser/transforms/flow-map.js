// @nts-check
import { createFlowMapping } from "../factories/flow-mapping.js";
import { createFlowMappingItem } from "../factories/flow-mapping-item.js";
import { extractComments } from "../utils/extract-comments.js";
import { getFlowMapItemAdditionalRanges } from "../utils/get-flow-map-item-additional-ranges.js";
import { getLast } from "../utils/get-last.js";
import { groupCstFlowCollectionItems } from "../utils/group-cst-flow-collection-items.js";
import { transformAstPair } from "./pair.js";
export function transformFlowMap(/** @type {import("../../yaml/resolveSeq-67caf78a.js").d} */ flowMap, context) {
    const cstItemsWithoutComments = extractComments(flowMap.cstNode.items, context);
    const groupedCstItems = groupCstFlowCollectionItems(cstItemsWithoutComments);
    const flowMappingItems = flowMap.items.map((/** @type {import("../../yaml/resolveSeq-67caf78a.js").P} */ pair, /** @type {number} */ index) => {
        const cstNodes = groupedCstItems[index];
        const { additionalKeyRange, additionalValueRange } = getFlowMapItemAdditionalRanges(cstNodes);
        return transformAstPair(pair, context, createFlowMappingItem, additionalKeyRange, additionalValueRange);
    });
    const openMarker = cstItemsWithoutComments[0];
    const closeMarker = getLast(cstItemsWithoutComments);
    return createFlowMapping(context.transformRange({
        origStart: openMarker.origOffset,
        origEnd: closeMarker.origOffset + 1,
    }), context.transformContent(flowMap), flowMappingItems);
}

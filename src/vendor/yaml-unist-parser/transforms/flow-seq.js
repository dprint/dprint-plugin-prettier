// @nts-check
import { createFlowMappingItem } from "../factories/flow-mapping-item.js";
import { createFlowSequence } from "../factories/flow-sequence.js";
import { createFlowSequenceItem } from "../factories/flow-sequence-item.js";
import { createPosition } from "../factories/position.js";
import { extractComments } from "../utils/extract-comments.js";
import { getFlowMapItemAdditionalRanges } from "../utils/get-flow-map-item-additional-ranges.js";
import { getLast } from "../utils/get-last.js";
import { groupCstFlowCollectionItems } from "../utils/group-cst-flow-collection-items.js";
import { transformAstPair } from "./pair.js";
export function transformFlowSeq(/** @type {import("../../yaml/resolveSeq-67caf78a.js").Y} */ flowSeq, context) {
    const cstItemsWithoutComments = extractComments(flowSeq.cstNode.items, context);
    const groupedCstItems = groupCstFlowCollectionItems(cstItemsWithoutComments);
    const flowSequenceItems = flowSeq.items.map((item, /** @type {number} */ index) => {
        if (item.type !== "PAIR") {
            const node = context.transformNode(item);
            return createFlowSequenceItem(createPosition(node.position.start, node.position.end), node);
        }
        else {
            const cstNodes = groupedCstItems[index];
            const { additionalKeyRange, additionalValueRange } = getFlowMapItemAdditionalRanges(cstNodes);
            return transformAstPair(item, context, createFlowMappingItem, additionalKeyRange, additionalValueRange);
        }
    });
    const openMarker = cstItemsWithoutComments[0];
    const closeMarker = getLast(cstItemsWithoutComments);
    return createFlowSequence(context.transformRange({
        origStart: openMarker.origOffset,
        origEnd: closeMarker.origOffset + 1,
    }), context.transformContent(flowSeq), flowSequenceItems);
}

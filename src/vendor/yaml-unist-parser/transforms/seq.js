// @nts-check
import { createPosition } from "../factories/position.js";
import { createSequence } from "../factories/sequence.js";
import { createSequenceItem } from "../factories/sequence-item.js";
import { extractComments } from "../utils/extract-comments.js";
import { extractPropComments } from "../utils/extract-prop-comments.js";
import { getLast } from "../utils/get-last.js";
export function transformSeq(/** @type {import("../../yaml/resolveSeq-67caf78a.js").Y} */ seq, context) {
    const cstItemsWithoutComments = extractComments(seq.cstNode.items, context);
    const sequenceItems = cstItemsWithoutComments.map((cstItem, index) => {
        extractPropComments(cstItem, context);
        const item = context.transformNode(seq.items[index]);
        return createSequenceItem(createPosition(context.transformOffset(cstItem.valueRange.origStart), item === null
            ? context.transformOffset(cstItem.valueRange.origStart + 1)
            : item.position.end), item);
    });
    return createSequence(createPosition(sequenceItems[0].position.start, getLast(sequenceItems).position.end), context.transformContent(seq), sequenceItems);
}

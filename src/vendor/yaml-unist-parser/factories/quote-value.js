// @nts-check
import { createCommentAttachable } from "./comment-attachable.js";
import { createNode } from "./node.js";
export function createQuoteValue(position, content, /** @type {string} */ value) {
    return {
        ...createNode("quoteValue", position),
        ...content,
        ...createCommentAttachable(),
        value,
    };
}

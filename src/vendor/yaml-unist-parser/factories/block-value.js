// @nts-check
import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";
export function createBlockValue(position, content, /** @type {string} */ chomping, /** @type {number | null} */ indent, /** @type {string} */ value, indicatorComment) {
    return {
        ...createNode("blockValue", position),
        ...createLeadingCommentAttachable(),
        ...content,
        chomping,
        indent,
        value,
        indicatorComment,
    };
}

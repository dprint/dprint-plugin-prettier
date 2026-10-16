// @nts-check
import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";
export function createMapping(position, content, /** @type {any[]} */ children) {
    return {
        ...createNode("mapping", position),
        ...createLeadingCommentAttachable(),
        ...content,
        children,
    };
}

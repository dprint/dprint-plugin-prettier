// @nts-check
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";
export function createSequence(position, content, /** @type {any[]} */ children) {
    return {
        ...createNode("sequence", position),
        ...createLeadingCommentAttachable(),
        ...createEndCommentAttachable(),
        ...content,
        children,
    };
}

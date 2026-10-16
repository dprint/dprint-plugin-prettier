// @nts-check
import { createCommentAttachable } from "./comment-attachable.js";
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";
export function createFlowCollection(position, content, /** @type {any[]} */ children) {
    return {
        ...createNode("flowCollection", position),
        ...createCommentAttachable(),
        ...createEndCommentAttachable(),
        ...content,
        children,
    };
}

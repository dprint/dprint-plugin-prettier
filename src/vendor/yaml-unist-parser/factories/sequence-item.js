import { createCommentAttachable } from "./comment-attachable.js";
import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";
export function createSequenceItem(position, content) {
    return {
        ...createNode("sequenceItem", position),
        ...createCommentAttachable(),
        ...createEndCommentAttachable(),
        children: !content ? [] : [content],
    };
}

import { createNode } from "./node.js";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.js";
export function createDocument(position, head, body, trailingComment) {
    return {
        ...createNode("document", position),
        ...createTrailingCommentAttachable(trailingComment),
        children: [head, body],
    };
}

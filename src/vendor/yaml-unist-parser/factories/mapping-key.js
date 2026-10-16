import { createEndCommentAttachable } from "./end-comment-attachable.js";
import { createNode } from "./node.js";
import { createTrailingCommentAttachable } from "./trailing-comment-attachable.js";
export function createMappingKey(position, content) {
    return {
        ...createNode("mappingKey", position),
        ...createTrailingCommentAttachable(),
        ...createEndCommentAttachable(),
        children: !content ? [] : [content],
    };
}

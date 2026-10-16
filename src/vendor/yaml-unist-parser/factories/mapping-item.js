import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";
export function createMappingItem(position, key, value) {
    return {
        ...createNode("mappingItem", position),
        ...createLeadingCommentAttachable(),
        children: [key, value],
    };
}

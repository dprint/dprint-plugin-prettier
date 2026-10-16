import { createLeadingCommentAttachable } from "./leading-comment-attachable.js";
import { createNode } from "./node.js";
export function createFlowMappingItem(position, key, value) {
    return {
        ...createNode("flowMappingItem", position),
        ...createLeadingCommentAttachable(),
        children: [key, value],
    };
}

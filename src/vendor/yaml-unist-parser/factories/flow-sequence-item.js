import { createNode } from "./node.js";
export function createFlowSequenceItem(position, content) {
    return {
        ...createNode("flowSequenceItem", position),
        children: [content],
    };
}

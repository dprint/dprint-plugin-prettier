// @nts-check
import { createCommentAttachable } from "./comment-attachable.js";
import { createNode } from "./node.js";
export function createPlain(position, content, /** @type {string} */ value) {
    return {
        ...createNode("plain", position),
        ...createCommentAttachable(),
        ...content,
        value,
    };
}

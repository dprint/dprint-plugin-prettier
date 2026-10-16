// @nts-check
import { createCommentAttachable } from "./comment-attachable.js";
import { createNode } from "./node.js";
export function createAlias(position, content, /** @type {string | undefined} */ value) {
    return {
        ...createNode("alias", position),
        ...createCommentAttachable(),
        ...content,
        value,
    };
}

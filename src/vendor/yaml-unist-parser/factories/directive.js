// @nts-check
import { createCommentAttachable } from "./comment-attachable.js";
import { createNode } from "./node.js";
export function createDirective(position, /** @type {string} */ name, /** @type {any[]} */ parameters) {
    return {
        ...createNode("directive", position),
        ...createCommentAttachable(),
        name,
        parameters,
    };
}

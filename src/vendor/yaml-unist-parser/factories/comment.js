// @nts-check
import { createNode } from "./node.js";
export function createComment(position, /** @type {string} */ value) {
    return {
        ...createNode("comment", position),
        value,
    };
}

// @nts-check
import { createNode } from "./node.js";
export function createTag(position, /** @type {string} */ value) {
    return {
        ...createNode("tag", position),
        value,
    };
}

// @nts-check
import { createNode } from "./node.js";
export function createAnchor(position, /** @type {string} */ value) {
    return {
        ...createNode("anchor", position),
        value,
    };
}

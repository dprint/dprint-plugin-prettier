// @nts-check
import { createNode } from "./node.js";
export function createRoot(position, /** @type {any[] | undefined} */ children, /** @type {any[] | undefined} */ comments) {
    return {
        ...createNode("root", position),
        children,
        comments,
    };
}

// @nts-check
import { createFlowCollection } from "./flow-collection.js";
export function createFlowMapping(position, content, /** @type {any[]} */ children) {
    return {
        ...createFlowCollection(position, content, children),
        type: "flowMapping",
    };
}

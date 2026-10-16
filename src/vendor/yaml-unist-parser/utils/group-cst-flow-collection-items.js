// @nts-check
import { createSlicer } from "./create-slicer.js";
/** @returns {any[]} */ export function groupCstFlowCollectionItems(/** @type {any[]} */ cstItems) {
    const groups = [];
    const sliceCstItems = createSlicer(cstItems, 1); // exclude `{` or `[`
    /** @type {boolean} */ let hasItem = false;
    for (let i = 1; i < cstItems.length - 1; i++) {
        const cstItem = cstItems[i];
        if ("char" in cstItem && cstItem.char === ",") {
            groups.push(sliceCstItems(i));
            sliceCstItems(i + 1); // exclude `,`
            hasItem = false;
            continue;
        }
        hasItem = true;
    }
    if (hasItem) {
        groups.push(sliceCstItems(cstItems.length - 1)); // exclude `}` or `]`
    }
    return groups;
}

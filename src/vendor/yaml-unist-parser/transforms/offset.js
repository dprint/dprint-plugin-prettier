// @nts-check
import { createPoint } from "../factories/point.js";
export function transformOffset(/** @type {number} */ offset, context) {
    // istanbul ignore next
    if (offset < 0) {
        offset = 0;
    }
    else if (offset > context.text.length) {
        offset = context.text.length;
    }
    const location = context.locator.locationForIndex(offset);
    return createPoint(offset, location.line + 1, location.column + 1);
}

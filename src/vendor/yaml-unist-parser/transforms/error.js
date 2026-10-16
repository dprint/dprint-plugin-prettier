// @nts-check
import { createError } from "../factories/error.js";
export function transformError(/** @type {import("../../yaml/PlainValue-183afbad.js").b} */ error, context) {
    // istanbul ignore next
    const range = (error.source.range || error.source.valueRange);
    return createError(error.message, context.text, context.transformRange(range));
}

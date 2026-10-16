// @nts-check
import { createQuoteSingle } from "../factories/quote-single.js";
import { transformAstQuoteValue } from "./quote-value.js";
export function transformQuoteSingle(/** @type {import("../../yaml/resolveSeq-67caf78a.js").S} */ quoteSingle, context) {
    return createQuoteSingle(transformAstQuoteValue(quoteSingle, context));
}

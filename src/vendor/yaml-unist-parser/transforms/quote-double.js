// @nts-check
import { createQuoteDouble } from "../factories/quote-double.js";
import { transformAstQuoteValue } from "./quote-value.js";
export function transformQuoteDouble(/** @type {import("../../yaml/resolveSeq-67caf78a.js").S} */ quoteDouble, context) {
    return createQuoteDouble(transformAstQuoteValue(quoteDouble, context));
}

// @nts-check
import { createQuoteValue } from "../factories/quote-value.js";
export function transformAstQuoteValue(/** @type {import("../../yaml/resolveSeq-67caf78a.js").S} */ quoteValue, context) {
    const cstNode = quoteValue.cstNode;
    return createQuoteValue(context.transformRange(cstNode.valueRange), context.transformContent(quoteValue), cstNode.strValue);
}

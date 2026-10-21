// @nts-check
import { extractComments } from "../utils/extract-comments.mjs";
import { createQuoteValue } from "../factories/quote-value.mjs";
//#region src/transforms/quote-value.ts
function transformAstQuoteValue(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar} */ quoteValue, srcToken, /** @type {import("./context.mjs").default} */ context, props) {
	for (const token of extractComments(srcToken.end, context))
 // istanbul ignore next -- @preserve
	throw new Error(`Unexpected token type in quote value end: ${token.type}`);
	return createQuoteValue(context.transformRange(quoteValue.range), context.transformContentProperties(quoteValue, props.tokens), quoteValue.source);
}
//#endregion
export { transformAstQuoteValue };

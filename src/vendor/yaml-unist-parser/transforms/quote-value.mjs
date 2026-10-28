// @nts-check
import { extractComments } from "../utils/extract-comments.mjs";
import { createQuoteValue } from "../factories/quote-value.mjs";
//#region src/transforms/quote-value.ts
/** @returns {import("yaml-unist-types").YamlNode} */ function transformAstQuoteValue(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar} */ quoteValue, /** @type {import("yaml-cst-types").Token} */ srcToken, /** @type {import("./context.mjs").default} */ context, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	for (const token of extractComments(srcToken.end, context))
 // istanbul ignore next -- @preserve
	throw new Error(`Unexpected token type in quote value end: ${token.type}`);
	return createQuoteValue(context.transformRange(quoteValue.range), context.transformContentProperties(quoteValue, props.tokens), quoteValue.source);
}
//#endregion
export { transformAstQuoteValue };

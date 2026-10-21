// @nts-check
import { extractComments } from "../utils/extract-comments.mjs";
import { createPlain } from "../factories/plain.mjs";
import { findLastCharIndex } from "../utils/find-last-char-index.mjs";
//#region src/transforms/plain.ts
function transformPlain(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar} */ plain, /** @type {import("./context.mjs").default} */ context, props) {
	if (plain.range[0] === plain.range[1]) {
		const index = findLastCharIndex(context.text, plain.range[0] - 1, /\S/u) + 1;
		return createPlain(context.transformRange([index, index]), context.transformContentProperties(plain, props.tokens), "");
	}
	const srcToken = plain.srcToken;
	// istanbul ignore if -- @preserve
	if (!srcToken || srcToken.type !== "scalar") throw new Error("Expected plain scalar srcToken");
	for (const token of extractComments(srcToken.end, context))
 // istanbul ignore next -- @preserve
	throw new Error(`Unexpected token type in plain scalar end: ${token.type}`);
	return createPlain(context.transformRange(plain.range), context.transformContentProperties(plain, props.tokens), plain.source);
}
//#endregion
export { transformPlain };

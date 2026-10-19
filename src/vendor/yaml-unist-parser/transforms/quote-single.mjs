// @nts-check
import { transformAstQuoteValue } from "./quote-value.mjs";
import { createQuoteSingle } from "../factories/quote-single.mjs";
//#region src/transforms/quote-single.ts
function transformQuoteSingle(/** @type {import("../../../../prettier/node_modules/yaml/browser/dist/nodes/Scalar.js").Scalar} */ quoteSingle, /** @type {import("./context.mjs").default} */ context, props) {
	const srcToken = quoteSingle.srcToken;
	// istanbul ignore if -- @preserve
	if (!srcToken || srcToken.type !== "single-quoted-scalar") throw new Error("Expected single-quoted scalar srcToken");
	return createQuoteSingle(transformAstQuoteValue(quoteSingle, srcToken, context, props));
}
//#endregion
export { transformQuoteSingle };

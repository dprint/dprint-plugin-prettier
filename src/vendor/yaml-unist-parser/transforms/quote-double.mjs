// @nts-check
import { createQuoteDouble } from "../factories/quote-double.mjs";
import { transformAstQuoteValue } from "./quote-value.mjs";
//#region src/transforms/quote-double.ts
/** @returns {import("yaml-unist-types").YamlNode} */ function transformQuoteDouble(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar} */ quoteDouble, /** @type {import("./context.mjs").default} */ context, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	const srcToken = quoteDouble.srcToken;
	// istanbul ignore if -- @preserve
	if (!srcToken || srcToken.type !== "double-quoted-scalar") throw new Error("Expected double-quoted scalar srcToken");
	return createQuoteDouble(transformAstQuoteValue(quoteDouble, srcToken, context, props));
}
//#endregion
export { transformQuoteDouble };

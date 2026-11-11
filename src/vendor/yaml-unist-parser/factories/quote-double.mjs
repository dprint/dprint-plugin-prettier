// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/quote-double.ts
/** @returns {YamlNode} */ function createQuoteDouble(/** @type {YamlNode} */ quoteValue) {
	return {
		...quoteValue,
		type: "quoteDouble"
	};
}
//#endregion
export { createQuoteDouble };

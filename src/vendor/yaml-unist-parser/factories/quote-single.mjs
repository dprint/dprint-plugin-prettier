// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/quote-single.ts
/** @returns {YamlNode} */ function createQuoteSingle(/** @type {YamlNode} */ quoteValue) {
	return {
		...quoteValue,
		type: "quoteSingle"
	};
}
//#endregion
export { createQuoteSingle };

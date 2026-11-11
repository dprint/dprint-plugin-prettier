// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/quote-value.ts
/** @returns {YamlNode} */ function createQuoteValue(/** @type {Position} */ position, /** @type {Content} */ content, /** @type {string} */ value) {
	return {
		type: "quoteValue",
		position,
		...content,
		leadingComments: [],
		trailingComment: null,
		value
	};
}
//#endregion
export { createQuoteValue };

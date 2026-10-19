// @nts-check
//#region src/factories/quote-value.ts
function createQuoteValue(position, content, /** @type {string} */ value) {
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

//#region src/factories/quote-single.ts
function createQuoteSingle(quoteValue) {
	return {
		...quoteValue,
		type: "quoteSingle"
	};
}
//#endregion
export { createQuoteSingle };

//#region src/factories/quote-double.ts
function createQuoteDouble(quoteValue) {
	return {
		...quoteValue,
		type: "quoteDouble"
	};
}
//#endregion
export { createQuoteDouble };

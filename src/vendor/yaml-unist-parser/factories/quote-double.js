export function createQuoteDouble(quoteValue) {
    return {
        ...quoteValue,
        type: "quoteDouble",
    };
}

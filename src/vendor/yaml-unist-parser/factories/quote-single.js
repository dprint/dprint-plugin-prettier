export function createQuoteSingle(quoteValue) {
    return {
        ...quoteValue,
        type: "quoteSingle",
    };
}

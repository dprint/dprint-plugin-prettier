// @nts-check
const locStart = /** @returns {number} */ (node) => node.sourceSpan.start.offset;
const locEnd = /** @returns {number} */ (node) => node.sourceSpan.end.offset;

export { locEnd, locStart };

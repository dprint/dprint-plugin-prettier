// @nts-check
const locStart = /** @returns {number} */ (node) => node.loc.start.offset;
const locEnd = /** @returns {number} */ (node) => node.loc.end.offset;

export { locEnd, locStart };

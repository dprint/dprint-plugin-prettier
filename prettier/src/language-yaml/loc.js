// @nts-check
const locStart = /** @returns {number} */ (node) => node.position.start.offset;
const locEnd = (node) => node.position.end.offset;

export { locEnd, locStart };

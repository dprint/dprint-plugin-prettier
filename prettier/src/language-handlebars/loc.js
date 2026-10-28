// @nts-check
const locStart = /** @returns {number} */ (/** @type {import("./print-types.js").GlimmerNode} */ node) => node.loc.start.offset;
const locEnd = /** @returns {number} */ (/** @type {import("./print-types.js").GlimmerNode} */ node) => node.loc.end.offset;

export { locEnd, locStart };

// @nts-check
const isIndex = /** @returns {boolean} */ (/** @type {number} */ value) => Number.isSafeInteger(value) && value >= 0;

export { isIndex };

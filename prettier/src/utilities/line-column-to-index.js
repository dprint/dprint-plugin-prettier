// @nts-check
// Super inefficient, needs to be cached.
/** @returns {number} */ function lineColumnToIndex(lineColumn, /** @type {string} */ text) {
  /** @type {number} */ let index = 0;
  for (let i = 0; i < lineColumn.line - 1; ++i) {
    index = text.indexOf("\n", index) + 1;
  }
  return index + lineColumn.column;
}

export default lineColumnToIndex;

// @nts-check
/** @type {RegExp} */ const hashColorPattern = /^#[0-9a-fA-F]{6}$|^#[0-9a-fA-F]{3}$/;
/** @type {RegExp} */ const unpaddedFractionalNumbersPattern = /\.[0-9]/;

const isMixinToken = /** @returns {boolean} */ (/** @type {any[]} */ token) => {
  const [, symbol] = token;
  const [char] = symbol;

  return (
    (char === '.' || char === '#') &&
    // ignore hashes used for colors
    hashColorPattern.test(symbol) === false &&
    // ignore dots used for unpadded fractional numbers
    unpaddedFractionalNumbersPattern.test(symbol) === false
  );
};

module.exports = { isMixinToken };

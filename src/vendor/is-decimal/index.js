// @nts-check
'use strict'

module.exports = decimal

// Check if the given character code, or the character code at the first
// character, is decimal.
/** @returns {boolean} */ function decimal(character) {
  /** @type {number} */ var code = typeof character === 'string' ? character.charCodeAt(0) : character

  return code >= 48 && code <= 57 /* 0-9 */
}

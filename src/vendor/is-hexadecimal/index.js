// @nts-check
'use strict'

module.exports = hexadecimal

// Check if the given character code, or the character code at the first
// character, is hexadecimal.
/** @returns {boolean} */ function hexadecimal(/** @type {number} */ character) {
  /** @type {number} */ var code = typeof character === 'string' ? character.charCodeAt(0) : character

  return (
    (code >= 97 /* a */ && code <= 102) /* z */ ||
    (code >= 65 /* A */ && code <= 70) /* Z */ ||
    (code >= 48 /* A */ && code <= 57) /* Z */
  )
}

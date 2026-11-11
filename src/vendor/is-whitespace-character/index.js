// @nts-check
'use strict'

module.exports = whitespace

var fromCode = String.fromCharCode
/** @type {RegExp} */ var re = /\s/

// Check if the given character code, or the character code at the first
// character, is a whitespace character.
/** @returns {boolean} */ function whitespace(character) {
  return re.test(
    typeof character === 'number' ? fromCode(character) : character.charAt(0)
  )
}

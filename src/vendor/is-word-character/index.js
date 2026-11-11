// @nts-check
'use strict'

module.exports = wordCharacter

var fromCode = String.fromCharCode
/** @type {RegExp} */ var re = /\w/

// Check if the given character code, or the character code at the first
// character, is a word character.
/** @returns {boolean} */ function wordCharacter(/** @type {string} */ character) {
  return re.test(
    typeof character === 'number' ? fromCode(character) : character.charAt(0)
  )
}

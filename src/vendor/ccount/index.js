// @nts-check
'use strict'

module.exports = ccount

/** @returns {number} */ function ccount(/** @type {string} */ source, /** @type {string} */ character) {
  /** @type {string} */ var value = String(source)
  /** @type {number} */ var count = 0
  /** @type {number} */ var index

  if (typeof character !== 'string') {
    throw new Error('Expected character')
  }

  index = value.indexOf(character)

  while (index !== -1) {
    count++
    index = value.indexOf(character, index + character.length)
  }

  return count
}

// @nts-check
'use strict'

module.exports = locate

/** @returns {number} */ function locate(/** @type {StringView} */ value, /** @type {number} */ fromIndex) {
  /** @type {number} */ var index = value.indexOf('\n', fromIndex)

  while (index > fromIndex) {
    if (value.charAt(index - 1) !== ' ') {
      break
    }

    index--
  }

  return index
}

// @nts-check
'use strict'

module.exports = locate

var values = ['www.', 'http://', 'https://']

/** @returns {number} */ function locate(/** @type {StringView} */ value, /** @type {number} */ fromIndex) {
  /** @type {number} */ var min = -1
  /** @type {number} */ var index
  /** @type {number} */ var length
  /** @type {number} */ var position

  if (!this.options.gfm) {
    return min
  }

  length = values.length
  index = -1

  while (++index < length) {
    position = value.indexOf(values[index], fromIndex)

    if (position !== -1 && (min === -1 || position < min)) {
      min = position
    }
  }

  return min
}

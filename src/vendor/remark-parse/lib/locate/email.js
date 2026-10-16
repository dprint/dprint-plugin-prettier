// @nts-check
'use strict'

var decimal = require('is-decimal')
var alphabetical = require('is-alphabetical')

/** @type {number} */ var plusSign = 43 // '+'
/** @type {number} */ var dash = 45 // '-'
/** @type {number} */ var dot = 46 // '.'
/** @type {number} */ var underscore = 95 // '_'

module.exports = locate

// See: <https://github.github.com/gfm/#extended-email-autolink>
/** @returns {number} */ function locate(/** @type {StringView} */ value, /** @type {number} */ fromIndex) {
  var self = this
  /** @type {number} */ var at
  /** @type {number} */ var position

  if (!this.options.gfm) {
    return -1
  }

  at = value.indexOf('@', fromIndex)

  if (at === -1) {
    return -1
  }

  position = at

  if (position === fromIndex || !isGfmAtext(value.charCodeAt(position - 1))) {
    return locate.call(self, value, at + 1)
  }

  while (position > fromIndex && isGfmAtext(value.charCodeAt(position - 1))) {
    position--
  }

  return position
}

/** @returns {boolean} */ function isGfmAtext(/** @type {number} */ code) {
  return (
    decimal(code) ||
    alphabetical(code) ||
    code === plusSign ||
    code === dash ||
    code === dot ||
    code === underscore
  )
}

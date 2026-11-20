// @nts-check
'use strict'

module.exports = locate

/** @returns {number} */ function locate(/** @type {StringView} */ value, /** @type {number} */ fromIndex) {
  /** @type {number} */ var asterisk = value.indexOf('*', fromIndex)
  /** @type {number} */ var underscore = value.indexOf('_', fromIndex)

  if (underscore === -1) {
    return asterisk
  }

  if (asterisk === -1) {
    return underscore
  }

  return underscore < asterisk ? underscore : asterisk
}

// @nts-check
'use strict'

module.exports = locate

/** @returns {number} */ function locate(/** @type {StringView} */ value, /** @type {number} */ fromIndex) {
  return value.indexOf('`', fromIndex)
}

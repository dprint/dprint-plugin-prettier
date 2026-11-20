// @nts-check
'use strict'

module.exports = trimTrailingLines

// Remove final newline characters from `value`.
/** @returns {string} */ function trimTrailingLines(/** @type {string} */ value) {
  return String(value).replace(/\n+$/, '')
}

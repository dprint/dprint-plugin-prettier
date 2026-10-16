// @nts-check
'use strict'

var collapseWhiteSpace = require('collapse-white-space')

module.exports = normalize

// Normalize an identifier.  Collapses multiple white space characters into a
// single space, and removes casing.
/** @returns {string} */ function normalize(/** @type {string} */ value) {
  return collapseWhiteSpace(value).toLowerCase()
}

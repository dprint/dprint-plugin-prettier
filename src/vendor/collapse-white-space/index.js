// @nts-check
'use strict'

module.exports = collapse

// `collapse(' \t\nbar \nbaz\t') // ' bar baz '`
/** @returns {string} */ function collapse(/** @type {string} */ value) {
  return String(value).replace(/\s+/g, ' ')
}

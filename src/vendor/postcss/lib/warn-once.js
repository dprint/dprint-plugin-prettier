// @nts-check
/* eslint-disable no-console */
'use strict'

/** @type {Record<string, boolean>} */ let printed = {}

module.exports = function warnOnce(/** @type {string} */ message) {
  if (printed[message]) return
  printed[message] = true

  if (typeof console !== 'undefined' && console.warn) {
    console.warn(message)
  }
}

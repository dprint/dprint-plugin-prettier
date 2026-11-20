// @nts-check
'use strict'

module.exports = factory

/** @type {string} */ var backslash = '\\'

// Factory to de-escape a value, based on a list at `key` in `ctx`.
function factory(ctx, /** @type {string} */ key) {
  return unescape

  // De-escape a string using the expression at `key` in `ctx`.
  /** @returns {string} */ function unescape(/** @type {string} */ value) {
    /** @type {number} */ var previous = 0
    /** @type {number} */ var index = value.indexOf(backslash)
    var escape = ctx[key]
    var queue = []
    /** @type {string} */ var character

    while (index !== -1) {
      queue.push(value.slice(previous, index))
      previous = index + 1
      character = value.charAt(previous)

      // If the following character is not a valid escape, add the slash.
      if (!character || escape.indexOf(character) === -1) {
        queue.push(backslash)
      }

      index = value.indexOf(backslash, previous + 1)
    }

    queue.push(value.slice(previous))

    return queue.join('')
  }
}

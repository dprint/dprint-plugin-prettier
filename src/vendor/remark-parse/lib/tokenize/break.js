// @nts-check
'use strict'

var locate = require('../locate/break')

module.exports = hardBreak
hardBreak.locator = locate

/** @type {string} */ var space = ' '
/** @type {string} */ var lineFeed = '\n'
/** @type {number} */ var minBreakLength = 2

function hardBreak(/** @type {import("../tokenizer.js").RemarkEat} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  /** @type {number} */ var length = value.length
  /** @type {number} */ var index = -1
  /** @type {string} */ var queue = ''
  /** @type {string} */ var character

  while (++index < length) {
    character = value.charAt(index)

    if (character === lineFeed) {
      if (index < minBreakLength) {
        return
      }

      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true
      }

      queue += character

      return eat(queue)({type: 'break'})
    }

    if (character !== space) {
      return
    }

    queue += character
  }
}

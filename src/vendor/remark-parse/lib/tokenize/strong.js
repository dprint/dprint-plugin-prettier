// @nts-check
'use strict'

var trim = require('trim')
var whitespace = require('is-whitespace-character')
var locate = require('../locate/strong')

module.exports = strong
strong.locator = locate

/** @type {string} */ var backslash = '\\'
/** @type {string} */ var asterisk = '*'
/** @type {string} */ var underscore = '_'

/** @this {import("../parser.js").RemarkParser} */ function strong(eat, /** @type {StringView} */ value, silent) {
  var self = this
  /** @type {number} */ var index = 0
  /** @type {string} */ var character = value.charAt(index)
  var now
  /** @type {boolean} */ var pedantic
  /** @type {string} */ var marker
  /** @type {string} */ var queue
  /** @type {string} */ var subvalue
  /** @type {number} */ var length
  /** @type {string} */ var previous

  if (
    (character !== asterisk && character !== underscore) ||
    value.charAt(++index) !== character
  ) {
    return
  }

  pedantic = self.options.pedantic
  marker = character
  subvalue = marker + marker
  length = value.length
  index++
  queue = ''
  character = ''

  if (pedantic && whitespace(value.charAt(index))) {
    return
  }

  while (index < length) {
    previous = character
    character = value.charAt(index)

    if (
      character === marker &&
      value.charAt(index + 1) === marker &&
      (!pedantic || !whitespace(previous))
    ) {
      character = value.charAt(index + 2)

      if (character !== marker) {
        if (!trim(queue)) {
          return
        }

        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        now = eat.now()
        now.column += 2
        now.offset += 2

        return eat(subvalue + queue + subvalue)({
          type: 'strong',
          children: self.tokenizeInline(queue, now)
        })
      }
    }

    if (!pedantic && character === backslash) {
      queue += character
      character = value.charAt(++index)
    }

    queue += character
    index++
  }
}

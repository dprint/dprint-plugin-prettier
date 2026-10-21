// @nts-check
'use strict'

var trim = require('trim')
var word = require('is-word-character')
var whitespace = require('is-whitespace-character')
var locate = require('../locate/emphasis')

module.exports = emphasis
emphasis.locator = locate

/** @type {string} */ var asterisk = '*'
/** @type {string} */ var underscore = '_'
/** @type {string} */ var backslash = '\\'

/** @this {import("../parser.js").RemarkParser} */ function emphasis(/** @type {import("../tokenizer.js").RemarkEat} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  var self = this
  /** @type {number} */ var index = 0
  /** @type {string} */ var character = value.charAt(index)
  /** @type {import("../tokenizer.js").RemarkPoint} */ var now
  /** @type {boolean} */ var pedantic
  /** @type {string} */ var marker
  /** @type {string} */ var queue
  /** @type {string} */ var subvalue
  /** @type {number} */ var length
  /** @type {string} */ var previous

  if (character !== asterisk && character !== underscore) {
    return
  }

  pedantic = self.options.pedantic
  subvalue = character
  marker = character
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

    if (character === marker && (!pedantic || !whitespace(previous))) {
      character = value.charAt(++index)

      if (character !== marker) {
        if (!trim(queue) || previous === marker) {
          return
        }

        if (!pedantic && marker === underscore && word(character)) {
          queue += marker
          continue
        }

        /* istanbul ignore if - never used (yet) */
        if (silent) {
          return true
        }

        now = eat.now()
        now.column++
        now.offset++

        return eat(subvalue + queue + marker)({
          type: 'emphasis',
          children: self.tokenizeInline(queue, now)
        })
      }

      queue += marker
    }

    if (!pedantic && character === backslash) {
      queue += character
      character = value.charAt(++index)
    }

    queue += character
    index++
  }
}

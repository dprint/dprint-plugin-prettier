// @nts-check
'use strict'

var trim = require('trim')
var trimTrailingLines = require('trim-trailing-lines')
var interrupt = require('../util/interrupt')

module.exports = paragraph

/** @type {string} */ var tab = '\t'
/** @type {string} */ var lineFeed = '\n'
/** @type {string} */ var space = ' '

/** @type {number} */ var tabSize = 4

// Tokenise paragraph.
/** @this {import("../parser.js").RemarkParser} */ function paragraph(eat, /** @type {StringView} */ value, silent) {
  var self = this
  var settings = self.options
  /** @type {boolean} */ var commonmark = settings.commonmark
  var tokenizers = self.blockTokenizers
  var interruptors = self.interruptParagraph
  /** @type {number} */ var index = value.indexOf(lineFeed)
  /** @type {number} */ var length = value.length
  /** @type {number | undefined} */ var position
  /** @type {StringView | undefined} */ var subvalue
  /** @type {string | undefined} */ var character
  /** @type {number | undefined} */ var size
  var now

  while (index < length) {
    // Eat everything if there’s no following newline.
    if (index === -1) {
      index = length
      break
    }

    // Stop if the next character is NEWLINE.
    if (value.charAt(index + 1) === lineFeed) {
      break
    }

    // In commonmark-mode, following indented lines are part of the paragraph.
    if (commonmark) {
      size = 0
      position = index + 1

      while (position < length) {
        character = value.charAt(position)

        if (character === tab) {
          size = tabSize
          break
        } else if (character === space) {
          size++
        } else {
          break
        }

        position++
      }

      if (size >= tabSize && character !== lineFeed) {
        index = value.indexOf(lineFeed, index + 1)
        continue
      }
    }

    subvalue = value.slice(index + 1)

    // Check if the following code contains a possible block.
    if (interrupt(interruptors, tokenizers, self, [eat, subvalue, true])) {
      break
    }

    position = index
    index = value.indexOf(lineFeed, index + 1)

    if (index !== -1 && trim(value.slice(position, index)) === '') {
      index = position
      break
    }
  }

  subvalue = value.slice(0, index)

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  now = eat.now()
  subvalue = trimTrailingLines(/** @type {string} */ (subvalue))

  return eat(/** @type {string} */ (subvalue))({
    type: 'paragraph',
    children: self.tokenizeInline(subvalue, now)
  })
}

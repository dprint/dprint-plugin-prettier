// @nts-check
'use strict'

var trim = require('trim')
var interrupt = require('../util/interrupt')

module.exports = blockquote

/** @type {string} */ var lineFeed = '\n'
/** @type {string} */ var tab = '\t'
/** @type {string} */ var space = ' '
/** @type {string} */ var greaterThan = '>'

/** @this {import("../parser.js").RemarkParser} */ function blockquote(/** @type {import("../tokenizer.js").RemarkEat} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  var self = this
  var offsets = self.offset
  var tokenizers = self.blockTokenizers
  var interruptors = self.interruptBlockquote
  var now = eat.now()
  /** @type {number} */ var currentLine = now.line
  /** @type {number} */ var length = value.length
  var values = []
  var contents = []
  var indents = []
  /** @type {import("../tokenizer.js").RemarkApply} */ var add
  /** @type {number} */ var index = 0
  /** @type {string | undefined} */ var character
  /** @type {StringView | undefined} */ var rest
  /** @type {number} */ var nextIndex
  /** @type {string} */ var content
  /** @type {string} */ var line
  /** @type {number} */ var startIndex
  /** @type {boolean} */ var prefixed
  /** @type {() => void} */ var exit

  while (index < length) {
    character = value.charAt(index)

    if (character !== space && character !== tab) {
      break
    }

    index++
  }

  if (value.charAt(index) !== greaterThan) {
    return
  }

  if (silent) {
    return true
  }

  index = 0

  while (index < length) {
    nextIndex = value.indexOf(lineFeed, index)
    startIndex = index
    prefixed = false

    if (nextIndex === -1) {
      nextIndex = length
    }

    while (index < length) {
      character = value.charAt(index)

      if (character !== space && character !== tab) {
        break
      }

      index++
    }

    if (value.charAt(index) === greaterThan) {
      index++
      prefixed = true

      if (value.charAt(index) === space) {
        index++
      }
    } else {
      index = startIndex
    }

    content = value.slice(index, nextIndex)

    if (!prefixed && !trim(content)) {
      index = startIndex
      break
    }

    if (!prefixed) {
      rest = value.slice(index)

      // Check if the following code contains a possible block.
      if (interrupt(interruptors, tokenizers, self, [eat, rest, true])) {
        break
      }
    }

    line = startIndex === index ? content : value.slice(startIndex, nextIndex)

    indents.push(index - startIndex)
    values.push(line)
    contents.push(content)

    index = nextIndex + 1
  }

  index = -1
  length = indents.length
  add = eat(values.join(lineFeed))

  while (++index < length) {
    offsets[currentLine] = (offsets[currentLine] || 0) + indents[index]
    currentLine++
  }

  exit = self.enterBlock()
  contents = self.tokenizeBlock(contents.join(lineFeed), now)
  exit()

  return add({type: 'blockquote', children: contents})
}

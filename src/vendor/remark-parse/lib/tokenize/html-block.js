// @nts-check
'use strict'

/** @type {RegExp} */ var openCloseTag = require('../util/html').openCloseTag

module.exports = blockHtml

/** @type {string} */ var tab = '\t'
/** @type {string} */ var space = ' '
/** @type {string} */ var lineFeed = '\n'
/** @type {string} */ var lessThan = '<'

/** @type {RegExp} */ var rawOpenExpression = /^<(script|pre|style)(?=(\s|>|$))/i
/** @type {RegExp} */ var rawCloseExpression = /<\/(script|pre|style)>/i
/** @type {RegExp} */ var commentOpenExpression = /^<!--/
/** @type {RegExp} */ var commentCloseExpression = /-->/
/** @type {RegExp} */ var instructionOpenExpression = /^<\?/
/** @type {RegExp} */ var instructionCloseExpression = /\?>/
/** @type {RegExp} */ var directiveOpenExpression = /^<![A-Za-z]/
/** @type {RegExp} */ var directiveCloseExpression = />/
/** @type {RegExp} */ var cdataOpenExpression = /^<!\[CDATA\[/
/** @type {RegExp} */ var cdataCloseExpression = /]]>/
/** @type {RegExp} */ var elementCloseExpression = /^$/
/** @type {RegExp} */ var otherElementOpenExpression = new RegExp(openCloseTag.source + '\\s*$')

function blockHtml(/** @type {(a0?: any) => any} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  var self = this
  /** @type {string} */ var blocks = self.options.blocks.join('|')
  /** @type {RegExp} */ var elementOpenExpression = new RegExp(
    '^</?(' + blocks + ')(?=(\\s|/?>|$))',
    'i'
  )
  /** @type {number} */ var length = value.length
  /** @type {number} */ var index = 0
  /** @type {number} */ var next
  /** @type {string} */ var line
  /** @type {number} */ var offset
  /** @type {string} */ var character
  /** @type {number} */ var count
  var sequence
  /** @type {string} */ var subvalue

  var sequences = [
    [rawOpenExpression, rawCloseExpression, true],
    [commentOpenExpression, commentCloseExpression, true],
    [instructionOpenExpression, instructionCloseExpression, true],
    [directiveOpenExpression, directiveCloseExpression, true],
    [cdataOpenExpression, cdataCloseExpression, true],
    [elementOpenExpression, elementCloseExpression, true],
    [otherElementOpenExpression, elementCloseExpression, false]
  ]

  // Eat initial spacing.
  while (index < length) {
    character = value.charAt(index)

    if (character !== tab && character !== space) {
      break
    }

    index++
  }

  if (value.charAt(index) !== lessThan) {
    return
  }

  next = value.indexOf(lineFeed, index + 1)
  next = next === -1 ? length : next
  line = value.slice(index, next)
  offset = -1
  count = sequences.length

  while (++offset < count) {
    if (sequences[offset][0].test(line)) {
      sequence = sequences[offset]
      break
    }
  }

  if (!sequence) {
    return
  }

  if (silent) {
    return sequence[2]
  }

  index = next

  if (!sequence[1].test(line)) {
    while (index < length) {
      next = value.indexOf(lineFeed, index + 1)
      next = next === -1 ? length : next
      line = value.slice(index + 1, next)

      if (sequence[1].test(line)) {
        if (line) {
          index = next
        }

        break
      }

      index = next
    }
  }

  subvalue = value.slice(0, index)

  return eat(subvalue)({type: 'html', value: subvalue})
}

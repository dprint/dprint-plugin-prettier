// @nts-check
'use strict'

var repeat = require('repeat-string')
var trim = require('trim-trailing-lines')

module.exports = indentedCode

/** @type {string} */ var lineFeed = '\n'
/** @type {string} */ var tab = '\t'
/** @type {string} */ var space = ' '

/** @type {number} */ var tabSize = 4
/** @type {string} */ var codeIndent = repeat(space, tabSize)

function indentedCode(/** @type {import("../tokenizer.js").RemarkEat} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  /** @type {number} */ var index = -1
  /** @type {number} */ var length = value.length
  /** @type {string} */ var subvalue = ''
  /** @type {string} */ var content = ''
  /** @type {string} */ var subvalueQueue = ''
  /** @type {string} */ var contentQueue = ''
  /** @type {string} */ var character
  /** @type {string | undefined} */ var blankQueue
  /** @type {boolean | undefined} */ var indent

  while (++index < length) {
    character = value.charAt(index)

    if (indent) {
      indent = false

      subvalue += subvalueQueue
      content += contentQueue
      subvalueQueue = ''
      contentQueue = ''

      if (character === lineFeed) {
        subvalueQueue = character
        contentQueue = character
      } else {
        subvalue += character
        content += character

        while (++index < length) {
          character = value.charAt(index)

          if (!character || character === lineFeed) {
            contentQueue = character
            subvalueQueue = character
            break
          }

          subvalue += character
          content += character
        }
      }
    } else if (
      character === space &&
      value.charAt(index + 1) === character &&
      value.charAt(index + 2) === character &&
      value.charAt(index + 3) === character
    ) {
      subvalueQueue += codeIndent
      index += 3
      indent = true
    } else if (character === tab) {
      subvalueQueue += character
      indent = true
    } else {
      blankQueue = ''

      while (character === tab || character === space) {
        blankQueue += character
        character = value.charAt(++index)
      }

      if (character !== lineFeed) {
        break
      }

      subvalueQueue += blankQueue + character
      contentQueue += character
    }
  }

  if (content) {
    if (silent) {
      return true
    }

    return eat(subvalue)({
      type: 'code',
      lang: null,
      meta: null,
      value: trim(content)
    })
  }
}

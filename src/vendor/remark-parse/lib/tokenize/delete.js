// @nts-check
'use strict'

var whitespace = require('is-whitespace-character')
var locate = require('../locate/delete')

module.exports = strikethrough
strikethrough.locator = locate

/** @type {string} */ var tilde = '~'
/** @type {string} */ var fence = '~~'

function strikethrough(eat, /** @type {StringView} */ value, silent) {
  var self = this
  /** @type {string} */ var character = ''
  /** @type {string} */ var previous = ''
  /** @type {string} */ var preceding = ''
  /** @type {string} */ var subvalue = ''
  /** @type {number} */ var index
  /** @type {number} */ var length
  var now

  if (
    !self.options.gfm ||
    value.charAt(0) !== tilde ||
    value.charAt(1) !== tilde ||
    whitespace(value.charAt(2))
  ) {
    return
  }

  index = 1
  length = value.length
  now = eat.now()
  now.column += 2
  now.offset += 2

  while (++index < length) {
    character = value.charAt(index)

    if (
      character === tilde &&
      previous === tilde &&
      (!preceding || !whitespace(preceding))
    ) {
      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true
      }

      return eat(fence + subvalue + fence)({
        type: 'delete',
        children: self.tokenizeInline(subvalue, now)
      })
    }

    subvalue += previous
    preceding = previous
    previous = character
  }
}

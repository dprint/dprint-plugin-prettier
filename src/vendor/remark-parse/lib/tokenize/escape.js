// @nts-check
'use strict'

var locate = require('../locate/escape')

module.exports = escape
escape.locator = locate

/** @type {string} */ var lineFeed = '\n'
/** @type {string} */ var backslash = '\\'

/** @this {import("../parser.js").RemarkParser} */ function escape(/** @type {import("../tokenizer.js").RemarkEat} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  var self = this
  /** @type {string | undefined} */ var character
  /** @type {import("../tokenizer.js").RemarkNode} */ var node

  if (value.charAt(0) === backslash) {
    character = value.charAt(1)

    if (self.escape.indexOf(character) !== -1) {
      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true
      }

      if (character === lineFeed) {
        node = {type: 'break'}
      } else {
        node = {type: 'text', value: character}
      }

      return eat(backslash + character)(node)
    }
  }
}

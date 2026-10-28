// @nts-check
'use strict'

var decode = require('parse-entities')
var decimal = require('is-decimal')
var alphabetical = require('is-alphabetical')
var locate = require('../locate/email')

module.exports = email
email.locator = locate
email.notInLink = true

/** @type {number} */ var plusSign = 43 // '+'
/** @type {number} */ var dash = 45 // '-'
/** @type {number} */ var dot = 46 // '.'
/** @type {number} */ var atSign = 64 // '@'
/** @type {number} */ var underscore = 95 // '_'

/** @this {import("../parser.js").RemarkParser} */ function email(/** @type {import("../tokenizer.js").RemarkEat} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  var self = this
  /** @type {boolean} */ var gfm = self.options.gfm
  var tokenizers = self.inlineTokenizers
  /** @type {number} */ var index = 0
  /** @type {number} */ var length = value.length
  /** @type {number} */ var firstDot = -1
  /** @type {number} */ var code
  /** @type {string} */ var content
  /** @type {any[]} */ var children
  /** @type {() => void} */ var exit

  if (!gfm) {
    return
  }

  code = value.charCodeAt(index)

  while (
    decimal(code) ||
    alphabetical(code) ||
    code === plusSign ||
    code === dash ||
    code === dot ||
    code === underscore
  ) {
    code = value.charCodeAt(++index)
  }

  if (index === 0) {
    return
  }

  if (code !== atSign) {
    return
  }

  index++

  while (index < length) {
    code = value.charCodeAt(index)

    if (
      decimal(code) ||
      alphabetical(code) ||
      code === dash ||
      code === dot ||
      code === underscore
    ) {
      index++

      if (firstDot === -1 && code === dot) {
        firstDot = index
      }

      continue
    }

    break
  }

  if (
    firstDot === -1 ||
    firstDot === index ||
    code === dash ||
    code === underscore
  ) {
    return
  }

  if (code === dot) {
    index--
  }

  content = value.slice(0, index)

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  exit = self.enterLink()

  // Temporarily remove all tokenizers except text in url.
  self.inlineTokenizers = {text: tokenizers.text}
  children = self.tokenizeInline(content, eat.now())
  self.inlineTokenizers = tokenizers

  exit()

  return eat(content)({
    type: 'link',
    title: null,
    url: 'mailto:' + decode(content, {nonTerminated: false}),
    children: children
  })
}

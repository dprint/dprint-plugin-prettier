// @nts-check
'use strict'

var whitespace = require('is-whitespace-character')
var decode = require('parse-entities')
var locate = require('../locate/tag')

module.exports = autoLink
autoLink.locator = locate
autoLink.notInLink = true

/** @type {string} */ var lessThan = '<'
/** @type {string} */ var greaterThan = '>'
/** @type {string} */ var atSign = '@'
/** @type {string} */ var slash = '/'
/** @type {string} */ var mailto = 'mailto:'
/** @type {number} */ var mailtoLength = mailto.length

/** @this {import("../parser.js").RemarkParser} */ function autoLink(eat, /** @type {StringView} */ value, silent) {
  var self = this
  /** @type {string} */ var subvalue = ''
  /** @type {number} */ var length = value.length
  /** @type {number} */ var index = 0
  /** @type {string} */ var queue = ''
  /** @type {boolean} */ var hasAtCharacter = false
  /** @type {string} */ var link = ''
  /** @type {string | undefined} */ var character
  var now
  var content
  var tokenizers
  var exit

  if (value.charAt(0) !== lessThan) {
    return
  }

  index++
  subvalue = lessThan

  while (index < length) {
    character = value.charAt(index)

    if (
      whitespace(character) ||
      character === greaterThan ||
      character === atSign ||
      (character === ':' && value.charAt(index + 1) === slash)
    ) {
      break
    }

    queue += character
    index++
  }

  if (!queue) {
    return
  }

  link += queue
  queue = ''

  character = value.charAt(index)
  link += character
  index++

  if (character === atSign) {
    hasAtCharacter = true
  } else {
    if (character !== ':' || value.charAt(index + 1) !== slash) {
      return
    }

    link += slash
    index++
  }

  while (index < length) {
    character = value.charAt(index)

    if (whitespace(character) || character === greaterThan) {
      break
    }

    queue += character
    index++
  }

  character = value.charAt(index)

  if (!queue || character !== greaterThan) {
    return
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  link += queue
  content = link
  subvalue += link + character
  now = eat.now()
  now.column++
  now.offset++

  if (hasAtCharacter) {
    if (link.slice(0, mailtoLength).toLowerCase() === mailto) {
      content = content.slice(mailtoLength)
      now.column += mailtoLength
      now.offset += mailtoLength
    } else {
      link = mailto + link
    }
  }

  // Temporarily remove all tokenizers except text in autolinks.
  tokenizers = self.inlineTokenizers
  self.inlineTokenizers = {text: tokenizers.text}

  exit = self.enterLink()

  content = self.tokenizeInline(content, now)

  self.inlineTokenizers = tokenizers
  exit()

  return eat(subvalue)({
    type: 'link',
    title: null,
    url: decode(link, {nonTerminated: false}),
    children: content
  })
}

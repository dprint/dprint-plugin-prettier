// @nts-check
'use strict'

var ccount = require('ccount')
var decode = require('parse-entities')
var decimal = require('is-decimal')
var alphabetical = require('is-alphabetical')
var whitespace = require('is-whitespace-character')
var locate = require('../locate/url')

module.exports = url
url.locator = locate
url.notInLink = true

/** @type {number} */ var exclamationMark = 33 // '!'
/** @type {number} */ var ampersand = 38 // '&'
/** @type {number} */ var rightParenthesis = 41 // ')'
/** @type {number} */ var asterisk = 42 // '*'
/** @type {number} */ var comma = 44 // ','
/** @type {number} */ var dash = 45 // '-'
/** @type {number} */ var dot = 46 // '.'
/** @type {number} */ var colon = 58 // ':'
/** @type {number} */ var semicolon = 59 // ';'
/** @type {number} */ var questionMark = 63 // '?'
/** @type {number} */ var lessThan = 60 // '<'
/** @type {number} */ var underscore = 95 // '_'
/** @type {number} */ var tilde = 126 // '~'

/** @type {string} */ var leftParenthesisCharacter = '('
/** @type {string} */ var rightParenthesisCharacter = ')'

function url(eat, /** @type {StringView} */ value, silent) {
  var self = this
  /** @type {boolean} */ var gfm = self.options.gfm
  var tokenizers = self.inlineTokenizers
  /** @type {number} */ var length = value.length
  /** @type {number} */ var previousDot = -1
  /** @type {boolean} */ var protocolless = false
  var dots
  /** @type {number} */ var lastTwoPartsStart
  /** @type {number} */ var start
  /** @type {number | undefined} */ var index
  /** @type {number} */ var pathStart
  /** @type {string | undefined} */ var path
  /** @type {number | undefined} */ var code
  /** @type {number} */ var end
  /** @type {number | undefined} */ var leftCount
  /** @type {number | undefined} */ var rightCount
  /** @type {string} */ var content
  var children
  /** @type {string} */ var url
  var exit

  if (!gfm) {
    return
  }

  // `WWW.` doesn’t work.
  if (value.slice(0, 4) === 'www.') {
    protocolless = true
    index = 4
  } else if (value.slice(0, 7).toLowerCase() === 'http://') {
    index = 7
  } else if (value.slice(0, 8).toLowerCase() === 'https://') {
    index = 8
  } else {
    return
  }

  // Act as if the starting boundary is a dot.
  previousDot = index - 1

  // Parse a valid domain.
  start = index
  dots = []

  while (index < length) {
    code = value.charCodeAt(index)

    if (code === dot) {
      // Dots may not appear after each other.
      if (previousDot === index - 1) {
        break
      }

      dots.push(index)
      previousDot = index
      index++
      continue
    }

    if (
      decimal(code) ||
      alphabetical(code) ||
      code === dash ||
      code === underscore
    ) {
      index++
      continue
    }

    break
  }

  // Ignore a final dot:
  if (code === dot) {
    dots.pop()
    index--
  }

  // If there are not dots, exit.
  if (dots[0] === undefined) {
    return
  }

  // If there is an underscore in the last two domain parts, exit:
  // `www.example.c_m` and `www.ex_ample.com` are not OK, but
  // `www.sub_domain.example.com` is.
  lastTwoPartsStart = dots.length < 2 ? start : dots[dots.length - 2] + 1

  if (value.slice(lastTwoPartsStart, index).indexOf('_') !== -1) {
    return
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  end = index
  pathStart = index

  // Parse a path.
  while (index < length) {
    code = value.charCodeAt(index)

    if (whitespace(code) || code === lessThan) {
      break
    }

    index++

    if (
      code === exclamationMark ||
      code === asterisk ||
      code === comma ||
      code === dot ||
      code === colon ||
      code === questionMark ||
      code === underscore ||
      code === tilde
    ) {
      // Empty
    } else {
      end = index
    }
  }

  index = end

  // If the path ends in a closing paren, and the count of closing parens is
  // higher than the opening count, then remove the supefluous closing parens.
  if (value.charCodeAt(index - 1) === rightParenthesis) {
    path = value.slice(pathStart, index)
    leftCount = ccount(path, leftParenthesisCharacter)
    rightCount = ccount(path, rightParenthesisCharacter)

    while (rightCount > leftCount) {
      index = pathStart + path.lastIndexOf(rightParenthesisCharacter)
      path = value.slice(pathStart, index)
      rightCount--
    }
  }

  if (value.charCodeAt(index - 1) === semicolon) {
    // GitHub doesn’t document this, but final semicolons aren’t paret of the
    // URL either.
    index--

    // // If the path ends in what looks like an entity, it’s not part of the path.
    if (alphabetical(value.charCodeAt(index - 1))) {
      end = index - 2

      while (alphabetical(value.charCodeAt(end))) {
        end--
      }

      if (value.charCodeAt(end) === ampersand) {
        index = end
      }
    }
  }

  content = value.slice(0, index)
  url = decode(content, {nonTerminated: false})

  if (protocolless) {
    url = 'http://' + url
  }

  exit = self.enterLink()

  // Temporarily remove all tokenizers except text in url.
  self.inlineTokenizers = {text: tokenizers.text}
  children = self.tokenizeInline(content, eat.now())
  self.inlineTokenizers = tokenizers

  exit()

  return eat(content)({type: 'link', title: null, url: url, children: children})
}

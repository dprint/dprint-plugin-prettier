// @nts-check
'use strict'

var alphabetical = require('is-alphabetical')
var locate = require('../locate/tag')
/** @type {RegExp} */ var tag = require('../util/html').tag

module.exports = inlineHTML
inlineHTML.locator = locate

/** @type {string} */ var lessThan = '<'
/** @type {string} */ var questionMark = '?'
/** @type {string} */ var exclamationMark = '!'
/** @type {string} */ var slash = '/'

/** @type {RegExp} */ var htmlLinkOpenExpression = /^<a /i
/** @type {RegExp} */ var htmlLinkCloseExpression = /^<\/a>/i

/** @this {import("../parser.js").RemarkParser} */ function inlineHTML(/** @type {(a0?: any) => any} */ eat, /** @type {StringView} */ value, silent) {
  var self = this
  /** @type {number} */ var length = value.length
  /** @type {string} */ var character
  var subvalue

  if (value.charAt(0) !== lessThan || length < 3) {
    return
  }

  character = value.charAt(1)

  if (
    !alphabetical(character) &&
    character !== questionMark &&
    character !== exclamationMark &&
    character !== slash
  ) {
    return
  }

  subvalue = value.match(tag)

  if (!subvalue) {
    return
  }

  /* istanbul ignore if - not used yet. */
  if (silent) {
    return true
  }

  subvalue = subvalue[0]

  if (!self.inLink && htmlLinkOpenExpression.test(subvalue)) {
    self.inLink = true
  } else if (self.inLink && htmlLinkCloseExpression.test(subvalue)) {
    self.inLink = false
  }

  return eat(subvalue)({type: 'html', value: subvalue})
}

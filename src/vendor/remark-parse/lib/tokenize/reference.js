// @nts-check
'use strict'

var whitespace = require('is-whitespace-character')
var locate = require('../locate/link')
var normalize = require('../util/normalize')

module.exports = reference
reference.locator = locate

/** @type {string} */ var link = 'link'
/** @type {string} */ var image = 'image'
/** @type {string} */ var shortcut = 'shortcut'
/** @type {string} */ var collapsed = 'collapsed'
/** @type {string} */ var full = 'full'
/** @type {string} */ var exclamationMark = '!'
/** @type {string} */ var leftSquareBracket = '['
/** @type {string} */ var backslash = '\\'
/** @type {string} */ var rightSquareBracket = ']'

function reference(eat, /** @type {StringView} */ value, silent) {
  var self = this
  /** @type {boolean} */ var commonmark = self.options.commonmark
  /** @type {string} */ var character = value.charAt(0)
  /** @type {number} */ var index = 0
  /** @type {number} */ var length = value.length
  /** @type {string} */ var subvalue = ''
  /** @type {string} */ var intro = ''
  /** @type {string} */ var type = link
  /** @type {string} */ var referenceType = shortcut
  /** @type {string} */ var content
  /** @type {string | undefined} */ var identifier
  var now
  var node
  var exit
  /** @type {string} */ var queue
  /** @type {boolean | undefined} */ var bracketed
  /** @type {number} */ var depth

  // Check whether we’re eating an image.
  if (character === exclamationMark) {
    type = image
    intro = character
    character = value.charAt(++index)
  }

  if (character !== leftSquareBracket) {
    return
  }

  index++
  intro += character
  queue = ''

  // Eat the text.
  depth = 0

  while (index < length) {
    character = value.charAt(index)

    if (character === leftSquareBracket) {
      bracketed = true
      depth++
    } else if (character === rightSquareBracket) {
      if (!depth) {
        break
      }

      depth--
    }

    if (character === backslash) {
      queue += backslash
      character = value.charAt(++index)
    }

    queue += character
    index++
  }

  subvalue = queue
  content = queue
  character = value.charAt(index)

  if (character !== rightSquareBracket) {
    return
  }

  index++
  subvalue += character
  queue = ''

  if (!commonmark) {
    // The original markdown syntax definition explicitly allows for whitespace
    // between the link text and link label; commonmark departs from this, in
    // part to improve support for shortcut reference links
    while (index < length) {
      character = value.charAt(index)

      if (!whitespace(character)) {
        break
      }

      queue += character
      index++
    }
  }

  character = value.charAt(index)

  if (character === leftSquareBracket) {
    identifier = ''
    queue += character
    index++

    while (index < length) {
      character = value.charAt(index)

      if (character === leftSquareBracket || character === rightSquareBracket) {
        break
      }

      if (character === backslash) {
        identifier += backslash
        character = value.charAt(++index)
      }

      identifier += character
      index++
    }

    character = value.charAt(index)

    if (character === rightSquareBracket) {
      referenceType = identifier ? full : collapsed
      queue += identifier + character
      index++
    } else {
      identifier = ''
    }

    subvalue += queue
    queue = ''
  } else {
    if (!content) {
      return
    }

    identifier = content
  }

  // Brackets cannot be inside the identifier.
  if (referenceType !== full && bracketed) {
    return
  }

  subvalue = intro + subvalue

  if (type === link && self.inLink) {
    return null
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  now = eat.now()
  now.column += intro.length
  now.offset += intro.length
  identifier = referenceType === full ? identifier : content

  node = {
    type: type + 'Reference',
    identifier: normalize(identifier),
    label: identifier,
    referenceType: referenceType
  }

  if (type === link) {
    exit = self.enterLink()
    node.children = self.tokenizeInline(content, now)
    exit()
  } else {
    node.alt = self.decode.raw(self.unescape(content), now) || null
  }

  return eat(subvalue)(node)
}

// @nts-check
'use strict'

module.exports = setextHeading

/** @type {string} */ var lineFeed = '\n'
/** @type {string} */ var tab = '\t'
/** @type {string} */ var space = ' '
/** @type {string} */ var equalsTo = '='
/** @type {string} */ var dash = '-'

/** @type {number} */ var maxIndent = 3

/** @type {number} */ var equalsToDepth = 1
/** @type {number} */ var dashDepth = 2

function setextHeading(eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  var self = this
  var now = eat.now()
  /** @type {number} */ var length = value.length
  /** @type {number} */ var index = -1
  /** @type {string} */ var subvalue = ''
  /** @type {string} */ var content
  /** @type {string} */ var queue
  /** @type {string | undefined} */ var character
  /** @type {string} */ var marker
  /** @type {number} */ var depth

  // Eat initial indentation.
  while (++index < length) {
    character = value.charAt(index)

    if (character !== space || index >= maxIndent) {
      index--
      break
    }

    subvalue += character
  }

  // Eat content.
  content = ''
  queue = ''

  while (++index < length) {
    character = value.charAt(index)

    if (character === lineFeed) {
      index--
      break
    }

    if (character === space || character === tab) {
      queue += character
    } else {
      content += queue + character
      queue = ''
    }
  }

  now.column += subvalue.length
  now.offset += subvalue.length
  subvalue += content + queue

  // Ensure the content is followed by a newline and a valid marker.
  character = value.charAt(++index)
  marker = value.charAt(++index)

  if (character !== lineFeed || (marker !== equalsTo && marker !== dash)) {
    return
  }

  subvalue += character

  // Eat Setext-line.
  queue = marker
  depth = marker === equalsTo ? equalsToDepth : dashDepth

  while (++index < length) {
    character = value.charAt(index)

    if (character !== marker) {
      if (character !== lineFeed) {
        return
      }

      index--
      break
    }

    queue += character
  }

  if (silent) {
    return true
  }

  return eat(subvalue + queue)({
    type: 'heading',
    depth: depth,
    children: self.tokenizeInline(content, now)
  })
}

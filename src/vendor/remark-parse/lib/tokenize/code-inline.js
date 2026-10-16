// @nts-check
'use strict'

var locate = require('../locate/code-inline')

module.exports = inlineCode
inlineCode.locator = locate

/** @type {number} */ var lineFeed = 10 //  '\n'
/** @type {number} */ var space = 32 // ' '
/** @type {number} */ var graveAccent = 96 //  '`'

function inlineCode(/** @type {(a0?: any) => any} */ eat, /** @type {StringView} */ value, silent) {
  /** @type {number | undefined} */ var length = value.length
  /** @type {number} */ var index = 0
  /** @type {number} */ var openingFenceEnd
  /** @type {number | undefined} */ var closingFenceStart
  /** @type {number | undefined} */ var closingFenceEnd
  /** @type {number | undefined} */ var code
  /** @type {number} */ var next
  /** @type {boolean | undefined} */ var found

  while (index < length) {
    if (value.charCodeAt(index) !== graveAccent) {
      break
    }

    index++
  }

  if (index === 0 || index === length) {
    return
  }

  openingFenceEnd = index
  next = value.charCodeAt(index)

  while (index < length) {
    code = next
    next = value.charCodeAt(index + 1)

    if (code === graveAccent) {
      if (closingFenceStart === undefined) {
        closingFenceStart = index
      }

      closingFenceEnd = index + 1

      if (
        next !== graveAccent &&
        closingFenceEnd - closingFenceStart === openingFenceEnd
      ) {
        found = true
        break
      }
    } else if (closingFenceStart !== undefined) {
      closingFenceStart = undefined
      closingFenceEnd = undefined
    }

    index++
  }

  if (!found) {
    return
  }

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  // Remove the initial and final space (or line feed), iff they exist and there
  // are non-space characters in the content.
  index = openingFenceEnd
  length = closingFenceStart
  code = value.charCodeAt(index)
  next = value.charCodeAt(length - 1)
  found = false

  if (
    length - index > 2 &&
    (code === space || code === lineFeed) &&
    (next === space || next === lineFeed)
  ) {
    index++
    length--

    while (index < length) {
      code = value.charCodeAt(index)

      if (code !== space && code !== lineFeed) {
        found = true
        break
      }

      index++
    }

    if (found === true) {
      openingFenceEnd++
      closingFenceStart--
    }
  }

  return eat(value.slice(0, closingFenceEnd))({
    type: 'inlineCode',
    value: value.slice(openingFenceEnd, closingFenceStart)
  })
}

// @nts-check
'use strict'

module.exports = thematicBreak

/** @type {string} */ var tab = '\t'
/** @type {string} */ var lineFeed = '\n'
/** @type {string} */ var space = ' '
/** @type {string} */ var asterisk = '*'
/** @type {string} */ var dash = '-'
/** @type {string} */ var underscore = '_'

/** @type {number} */ var maxCount = 3

function thematicBreak(/** @type {(a0?: any) => any} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  /** @type {number} */ var index = -1
  /** @type {number} */ var length = value.length + 1
  /** @type {string} */ var subvalue = ''
  /** @type {string | undefined} */ var character
  /** @type {string} */ var marker
  /** @type {number} */ var markerCount
  /** @type {string} */ var queue

  while (++index < length) {
    character = value.charAt(index)

    if (character !== tab && character !== space) {
      break
    }

    subvalue += character
  }

  if (
    character !== asterisk &&
    character !== dash &&
    character !== underscore
  ) {
    return
  }

  marker = character
  subvalue += character
  markerCount = 1
  queue = ''

  while (++index < length) {
    character = value.charAt(index)

    if (character === marker) {
      markerCount++
      subvalue += queue + marker
      queue = ''
    } else if (character === space) {
      queue += character
    } else if (
      markerCount >= maxCount &&
      (!character || character === lineFeed)
    ) {
      subvalue += queue

      if (silent) {
        return true
      }

      return eat(subvalue)({type: 'thematicBreak'})
    } else {
      return
    }
  }
}

// @nts-check
'use strict'

var trim = require('trim')
var repeat = require('repeat-string')
var getIndent = require('./get-indentation')

module.exports = indentation

/** @type {string} */ var lineFeed = '\n'
/** @type {string} */ var space = ' '
/** @type {string} */ var exclamationMark = '!'

// Remove the minimum indent from every line in `value`.  Supports both tab,
// spaced, and mixed indentation (as well as possible).
/** @returns {string} */ function indentation(/** @type {string} */ value, /** @type {number} */ maximum) {
  var values = value.split(lineFeed)
  /** @type {number} */ var position = values.length + 1
  /** @type {number} */ var minIndent = Infinity
  var matrix = []
  /** @type {number | undefined} */ var index
  var indentation
  var stops

  values.unshift(repeat(space, maximum) + exclamationMark)

  while (position--) {
    indentation = getIndent(values[position])

    matrix[position] = indentation.stops

    if (trim(values[position]).length === 0) {
      continue
    }

    if (indentation.indent) {
      if (indentation.indent > 0 && indentation.indent < minIndent) {
        minIndent = indentation.indent
      }
    } else {
      minIndent = Infinity

      break
    }
  }

  if (minIndent !== Infinity) {
    position = values.length

    while (position--) {
      stops = matrix[position]
      index = minIndent

      while (index && !(index in stops)) {
        index--
      }

      values[position] = values[position].slice(stops[index] + 1)
    }
  }

  values.shift()

  return values.join(lineFeed)
}

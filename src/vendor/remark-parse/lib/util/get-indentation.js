// @nts-check
'use strict'

module.exports = indentation

/** @type {string} */ var tab = '\t'
/** @type {string} */ var space = ' '

/** @type {number} */ var spaceSize = 1
/** @type {number} */ var tabSize = 4

// Gets indentation information for a line.
/** @returns {{indent: number, stops: Record<string, number>}} */ function indentation(/** @type {string} */ value) {
  /** @type {number} */ var index = 0
  /** @type {number} */ var indent = 0
  /** @type {string} */ var character = value.charAt(index)
  /** @type {Record<string, number>} */ var stops = {}
  /** @type {number} */ var size
  /** @type {number} */ var lastIndent = 0

  while (character === tab || character === space) {
    size = character === tab ? tabSize : spaceSize

    indent += size

    if (size > 1) {
      indent = Math.floor(indent / size) * size
    }

    while (lastIndent < indent) {
      stops[++lastIndent] = index
    }

    character = value.charAt(++index)
  }

  return {indent: indent, stops: stops}
}

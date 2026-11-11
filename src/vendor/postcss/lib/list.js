// @nts-check
'use strict'

let list = {
  /** @returns {string[]} */ comma(/** @type {string} */ string) {
    return list.split(string, [','], true)
  },

  /** @returns {string[]} */ space(/** @type {string} */ string) {
    /** @type {string[]} */ let spaces = [' ', '\n', '\t']
    return list.split(string, spaces)
  },

  /** @returns {string[]} */ split(/** @type {string} */ string, /** @type {string[]} */ separators, /** @type {boolean | undefined} */ last) {
    /** @type {string[]} */ let array = []
    /** @type {string} */ let current = ''
    /** @type {boolean} */ let split = false

    /** @type {number} */ let func = 0
    /** @type {boolean} */ let inQuote = false
    /** @type {string} */ let prevQuote = ''
    /** @type {boolean} */ let escape = false

    for (let letter of string) {
      if (escape) {
        escape = false
      } else if (letter === '\\') {
        escape = true
      } else if (inQuote) {
        if (letter === prevQuote) {
          inQuote = false
        }
      } else if (letter === '"' || letter === "'") {
        inQuote = true
        prevQuote = letter
      } else if (letter === '(') {
        func += 1
      } else if (letter === ')') {
        if (func > 0) func -= 1
      } else if (func === 0) {
        if (separators.includes(letter)) split = true
      }

      if (split) {
        if (current !== '') array.push(current.trim())
        current = ''
        split = false
      } else {
        current += letter
      }
    }

    if (last || current !== '') array.push(current.trim())
    return array
  }
}

module.exports = list
list.default = list

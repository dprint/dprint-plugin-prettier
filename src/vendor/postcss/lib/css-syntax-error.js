// @nts-check
'use strict'

let pico = require('picocolors')

let terminalHighlight = require('./terminal-highlight')

/**
 * @property {import("./input").ErrorInput} [input] given by the input that the error is of
 */
class CssSyntaxError extends Error {
  constructor(/** @type {string} */ message, /** @type {any} */ line, /** @type {any} */ column, /** @type {string} */ source, /** @type {undefined | string} */ file, /** @type {undefined | string} */ plugin) {
    super(message)
    /** @type {string} */ this.name = 'CssSyntaxError'
    /** @type {string} */ this.reason = message

    if (file) {
      this.file = file
    }
    if (source) {
      this.source = source
    }
    if (plugin) {
      this.plugin = plugin
    }
    if (typeof line !== 'undefined' && typeof column !== 'undefined') {
      if (typeof line === 'number') {
        /** @type {number | undefined} */ this.line = line
        /** @type {number | undefined} */ this.column = column
      } else {
        this.line = line.line
        this.column = line.column
        /** @type {number | undefined} */ this.endLine = column.line
        /** @type {number | undefined} */ this.endColumn = column.column
      }
    }

    this.setMessage()

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CssSyntaxError)
    }
  }

  setMessage() {
    this.message = this.plugin ? this.plugin + ': ' : ''
    this.message += this.file ? this.file : '<css input>'
    if (typeof this.line !== 'undefined') {
      this.message += ':' + this.line + ':' + this.column
    }
    this.message += ': ' + this.reason
  }

  /** @returns {string} */ showSourceCode(/** @type {undefined | boolean} */ color) {
    if (!this.source) return ''

    let css = this.source
    if (color == null) color = pico.isColorSupported

    /** @type {(text: string) => string} */ let aside = text => text
    /** @type {(text: string) => string} */ let mark = text => text
    /** @type {(text: string) => string} */ let highlight = text => text
    if (color) {
      let { bold, gray, red } = pico.createColors(true)
      mark = text => bold(red(text))
      aside = text => gray(text)
      if (terminalHighlight) {
        highlight = text => terminalHighlight(text)
      }
    }

    /** @type {string[]} */ let lines = css.split(/\r?\n/)
    /** @type {number} */ let start = Math.max(this.line - 3, 0)
    /** @type {number} */ let end = Math.min(this.line + 2, lines.length)
    /** @type {number} */ let maxWidth = String(end).length

    return lines
      .slice(start, end)
      .map(/** @returns {string} */ (/** @type {string} */ line, /** @type {number} */ index) => {
        let number = start + 1 + index
        let gutter = ' ' + (' ' + number).slice(-maxWidth) + ' | '
        if (number === this.line) {
          if (line.length > 160) {
            let padding = 20
            let subLineStart = Math.max(0, this.column - padding)
            let subLineEnd = Math.max(
              this.column + padding,
              this.endColumn + padding
            )
            let subLine = line.slice(subLineStart, subLineEnd)

            let spacing =
              aside(gutter.replace(/\d/g, ' ')) +
              line
                .slice(0, Math.min(this.column - 1, padding - 1))
                .replace(/[^\t]/g, ' ')

            return (
              mark('>') +
              aside(gutter) +
              highlight(subLine) +
              '\n ' +
              spacing +
              mark('^')
            )
          }

          let spacing =
            aside(gutter.replace(/\d/g, ' ')) +
            line.slice(0, this.column - 1).replace(/[^\t]/g, ' ')

          return (
            mark('>') +
            aside(gutter) +
            highlight(line) +
            '\n ' +
            spacing +
            mark('^')
          )
        }

        return ' ' + aside(gutter) + highlight(line)
      })
      .join('\n')
  }

  /** @returns {string} */ toString() {
    let code = this.showSourceCode()
    if (code) {
      code = '\n\n' + code + '\n'
    }
    return this.name + ': ' + this.message + code
  }
}

module.exports = CssSyntaxError
CssSyntaxError.default = CssSyntaxError

// @nts-check
'use strict'

let { nanoid } = require('nanoid/non-secure')
let { isAbsolute, resolve } = require('path')
let { SourceMapConsumer, SourceMapGenerator } = require('source-map-js')
let { fileURLToPath, pathToFileURL } = require('url')

let CssSyntaxError = require('./css-syntax-error')
let PreviousMap = require('./previous-map')
let terminalHighlight = require('./terminal-highlight')

let lineToIndexCache = Symbol('lineToIndexCache')

/**
 * what an input is made with
 * @typedef {{ from?: string, map?: any, document?: string }} InputOptions
 * a line and a column of the text, which nothing changes
 * @typedef {Readonly<{ col: number, line: number }>} FilePosition
 * where an error is, which the error is given
 * @typedef {{ column: number, endColumn?: number, endLine?: number, endOffset?: number, line: number, offset: number, source: string, url?: string, file?: string }} ErrorInput
 * where a place of the input was in the text that a source map says it was made from
 * @typedef {{ column: number, endColumn?: number, endLine?: number, line: number, url: string, file?: string, source?: string }} Origin
 */

/** @type {boolean} */ let sourceMapAvailable = Boolean(SourceMapConsumer && SourceMapGenerator)
/** @type {boolean} */ let pathAvailable = Boolean(resolve && isAbsolute)

/** @returns {number[]} */ function getLineToIndex(/** @type {Input} */ input) {
  if (input[lineToIndexCache]) return input[lineToIndexCache]
  /** @type {string[]} */ let lines = input.css.split('\n')
  /** @type {number[]} */ let lineToIndex = new Array(lines.length)
  /** @type {number} */ let prevIndex = 0

  for (let i = 0, l = lines.length; i < l; i++) {
    lineToIndex[i] = prevIndex
    prevIndex += lines[i].length + 1
  }

  input[lineToIndexCache] = lineToIndex
  return lineToIndex
}

/**
 * @property {string} [type] what prettier reads of every object of its tree, which an input never has
 */
class Input {
  /** @returns {string} */ get from() {
    return this.file || this.id
  }

  constructor(/** @type {string} */ css, /** @type {InputOptions} */ opts = {}) {
    if (
      css === null ||
      typeof css === 'undefined' ||
      (typeof css === 'object' && !css.toString)
    ) {
      throw new Error(`PostCSS received ${css} instead of CSS string`)
    }

    /** @type {string} */ this.css = css.toString()

    if (this.css[0] === '\uFEFF' || this.css[0] === '\uFFFE') {
      /** @type {boolean} */ this.hasBOM = true
      this.css = this.css.slice(1)
    } else {
      this.hasBOM = false
    }

    /** @type {string} */ this.document = this.css
    if (opts.document) this.document = opts.document.toString()

    if (opts.from) {
      if (
        !pathAvailable ||
        /^\w+:\/\//.test(opts.from) ||
        isAbsolute(opts.from)
      ) {
        /** @type {string} */ this.file = opts.from
      } else {
        this.file = resolve(opts.from)
      }
    }

    if (pathAvailable && sourceMapAvailable) {
      let map = new PreviousMap(this.css, opts)
      if (map.text) {
        /** @type {import("./previous-map")} */ this.map = map
        let file = map.consumer().file
        if (!this.file && file) this.file = this.mapResolve(file)
      }
    }

    if (!this.file) {
      /** @type {string} */ this.id = '<input css ' + nanoid(6) + '>'
    }
    if (this.map) this.map.file = this.from
  }

  /** @returns {import("./css-syntax-error")} */ error(/** @type {string} */ message, /** @type {any} */ line, /** @type {any} */ column, /** @type {{ plugin?: string }} */ opts = {}) {
    /** @type {number | undefined} */ let endColumn
    /** @type {number | undefined} */ let endLine
    /** @type {number | undefined} */ let endOffset
    /** @type {number} */ let offset
    /** @type {import("./css-syntax-error")} */ let result

    if (line && typeof line === 'object') {
      /** @type {import("./node").Position} */ let start = line
      /** @type {import("./node").Position} */ let end = column
      if (typeof start.offset === 'number') {
        offset = start.offset
        let pos = this.fromOffset(offset)
        line = pos.line
        column = pos.col
      } else {
        line = start.line
        column = start.column
        offset = this.fromLineAndColumn(line, column)
      }
      if (typeof end.offset === 'number') {
        endOffset = end.offset
        let pos = this.fromOffset(endOffset)
        endLine = pos.line
        endColumn = pos.col
      } else {
        endLine = end.line
        endColumn = end.column
        endOffset = this.fromLineAndColumn(end.line, end.column)
      }
    } else if (!column) {
      offset = line
      let pos = this.fromOffset(offset)
      line = pos.line
      column = pos.col
    } else {
      offset = this.fromLineAndColumn(line, column)
    }

    /** @type {false | Origin} */ let origin = this.origin(line, column, endLine, endColumn)
    if (origin) {
      result = new CssSyntaxError(
        message,
        origin.endLine === undefined
          ? origin.line
          : { column: origin.column, line: origin.line },
        origin.endLine === undefined
          ? origin.column
          : { column: origin.endColumn, line: origin.endLine },
        origin.source,
        origin.file,
        opts.plugin
      )
    } else {
      result = new CssSyntaxError(
        message,
        endLine === undefined ? line : { column, line },
        endLine === undefined ? column : { column: endColumn, line: endLine },
        this.css,
        this.file,
        opts.plugin
      )
    }

    result.input = {
      column,
      endColumn,
      endLine,
      endOffset,
      line,
      offset,
      source: this.css
    }
    if (this.file) {
      if (pathToFileURL) {
        result.input.url = pathToFileURL(this.file).toString()
      }
      result.input.file = this.file
    }

    return result
  }

  /** @returns {number} */ fromLineAndColumn(/** @type {number} */ line, /** @type {number} */ column) {
    /** @type {number[]} */ let lineToIndex = getLineToIndex(this)
    /** @type {number} */ let index = lineToIndex[line - 1]
    return index + column - 1
  }

  /** @returns {FilePosition} */ fromOffset(/** @type {number} */ offset) {
    /** @type {number[]} */ let lineToIndex = getLineToIndex(this)
    /** @type {number} */ let lastLine = lineToIndex[lineToIndex.length - 1]

    /** @type {number} */ let min = 0
    if (offset >= lastLine) {
      min = lineToIndex.length - 1
    } else {
      /** @type {number} */ let max = lineToIndex.length - 2
      /** @type {number} */ let mid
      while (min < max) {
        mid = min + ((max - min) >> 1)
        if (offset < lineToIndex[mid]) {
          max = mid - 1
        } else if (offset >= lineToIndex[mid + 1]) {
          min = mid + 1
        } else {
          min = mid
          break
        }
      }
    }
    return {
      col: offset - lineToIndex[min] + 1,
      line: min + 1
    }
  }

  /** @returns {string} */ mapResolve(/** @type {string} */ file) {
    if (/^\w+:\/\//.test(file)) {
      return file
    }
    return resolve(this.map.consumer().sourceRoot || this.map.root || '.', file)
  }

  /** @returns {false | Origin} */ origin(/** @type {number} */ line, /** @type {number} */ column, /** @type {number | undefined} */ endLine, /** @type {number | undefined} */ endColumn) {
    if (!this.map) return false
    /** @type {any} */ let consumer = this.map.consumer()

    /** @type {any} */ let from = consumer.originalPositionFor({ column: column - 1, line })
    if (!from.source) return false

    /** @type {any} */ let to
    if (typeof endLine === 'number') {
      to = consumer.originalPositionFor({
        column: endColumn - 1,
        line: endLine
      })
    }

    /** @type {any} */ let fromUrl

    if (isAbsolute(from.source)) {
      fromUrl = pathToFileURL(from.source)
    } else {
      fromUrl = new URL(
        from.source,
        this.map.consumer().sourceRoot || pathToFileURL(this.map.mapFile)
      )
    }

    /** @type {Origin} */ let result = {
      column: from.column + 1,
      endColumn: to && to.column + 1,
      endLine: to && to.line,
      line: from.line,
      url: fromUrl.toString()
    }

    if (fromUrl.protocol === 'file:') {
      if (fileURLToPath) {
        result.file = fileURLToPath(fromUrl)
      } else {
        /* c8 ignore next 2 */
        throw new Error(`file: protocol is not available in this PostCSS build`)
      }
    }

    /** @type {string | undefined} */ let source = consumer.sourceContentFor(from.source)
    if (source) result.source = source

    return result
  }

  /** @returns {any} */ toJSON() {
    /** @type {Record<string, any>} */ let json = {}
    for (let name of ['hasBOM', 'css', 'file', 'id']) {
      if (this[name] != null) {
        json[name] = this[name]
      }
    }
    if (this.map) {
      json.map = { ...this.map }
      if (json.map.consumerCache) {
        json.map.consumerCache = undefined
      }
    }
    return json
  }
}

module.exports = Input
Input.default = Input

if (terminalHighlight && terminalHighlight.registerInput) {
  terminalHighlight.registerInput(Input)
}

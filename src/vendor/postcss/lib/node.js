// @nts-check
'use strict'

let CssSyntaxError = require('./css-syntax-error')
let Stringifier = require('./stringifier')
let stringify = require('./stringify')
let { isClean, my } = require('./symbols')

/** @returns {any} */ function cloneNode(/** @type {any} */ obj, /** @type {any} */ parent) {
  let cloned = new obj.constructor()

  for (let i in obj) {
    if (!Object.prototype.hasOwnProperty.call(obj, i)) {
      /* c8 ignore next 2 */
      continue
    }
    if (i === 'proxyCache') continue
    let value = obj[i]
    let type = typeof value

    if (i === 'parent' && type === 'object') {
      if (parent) cloned[i] = parent
    } else if (i === 'source') {
      cloned[i] = value
    } else if (Array.isArray(value)) {
      cloned[i] = value.map(j => cloneNode(j, cloned))
    } else {
      if (type === 'object' && value !== null) value = cloneNode(value)
      cloned[i] = value
    }
  }

  return cloned
}

/** @returns {number} */ function sourceOffset(/** @type {string} */ inputCSS, /** @type {Position | undefined} */ position) {
  // Not all custom syntaxes support `offset` in `source.start` and `source.end`
  if (position && typeof position.offset !== 'undefined') {
    return position.offset
  }

  let column = 1
  let line = 1
  let offset = 0

  for (let i = 0; i < inputCSS.length; i++) {
    if (line === position.line && column === position.column) {
      offset = i
      break
    }

    if (inputCSS[i] === '\n') {
      column = 1
      line += 1
    } else {
      column += 1
    }
  }

  return offset
}

/**
 * what is kept of the text around a node; the parser writes records of the selector, value and params, which
 * prettier writes over with texts
 * @typedef {{
 *   before?: string,
 *   after?: string,
 *   between?: string,
 *   afterName?: string,
 *   semicolon?: boolean,
 *   ownSemicolon?: string,
 *   important?: string,
 *   identifier?: string,
 *   indent?: string,
 *   inline?: boolean,
 *   left?: string,
 *   right?: string,
 *   text?: string,
 *   begin?: string,
 *   scssDefault?: string,
 *   scssGlobal?: string,
 *   selector?: any,
 *   value?: any,
 *   params?: any,
 * }} Raws
 * where a node is, which prettier gives its offsets as well
 * @typedef {{ input?: import("./input"), start?: Position, end?: Position, startOffset?: number, endOffset?: number | null }} Source
 * @typedef {{ column: number, line: number, offset?: number }} Position
 * what a range of a node is asked for with
 * @typedef {{ index?: number, endIndex?: number, word?: string, start?: Position, end?: Position, plugin?: string }} RangeOptions
 */

/**
 * @property {Source} [source]
 * @property {import("./container") | undefined} [parent]
 * @property {Node[]} [nodes]
 * @property {string} [name]
 * @property {any} [params]
 * @property {any} [selector]
 * @property {string} [prop]
 * @property {any} [value]
 * @property {boolean} [important]
 * @property {string} [text]
 * @property {number} [lastEach]
 * @property {Record<string, number>} [indexes]
 * @property {any} [proxyCache]
 */
class Node {
  get proxyOf() {
    return this
  }

  constructor(/** @type {any} */ defaults = {}) {
    /** @type {Raws} */ this.raws = {}
    this[isClean] = false
    this[my] = true

    for (let name in defaults) {
      if (name === 'nodes') {
        /** @type {Node[]} */ this.nodes = []
        for (let node of defaults[name]) {
          // Clone only nodes that already belong to another tree, so passing a
          // freshly created (parent-less) node adopts that instance instead of
          // a copy and keeps the caller's reference usable. See #1987.
          if (typeof node.clone === 'function' && node.parent) {
            this.append(node.clone())
          } else {
            this.append(node)
          }
        }
      } else {
        this[name] = defaults[name]
      }
    }
  }

  addToError(/** @type {any} */ error) {
    error.postcssNode = this
    if (error.stack && this.source && /\n\s{4}at /.test(error.stack)) {
      let s = this.source
      error.stack = error.stack.replace(
        /\n\s{4}at /,
        `$&${s.input.from}:${s.start.line}:${s.start.column}$&`
      )
    }
    return error
  }

  /** @returns {Node} */ after(add) {
    this.parent.insertAfter(this, add)
    return this
  }

  assign(overrides = {}) {
    for (let name in overrides) {
      this[name] = overrides[name]
    }
    return this
  }

  /** @returns {Node} */ before(add) {
    this.parent.insertBefore(this, add)
    return this
  }

  cleanRaws(/** @type {undefined | boolean} */ keepBetween) {
    delete this.raws.before
    delete this.raws.after
    if (!keepBetween) delete this.raws.between
  }

  clone(overrides = {}) {
    let cloned = cloneNode(this)
    for (let name in overrides) {
      cloned[name] = overrides[name]
    }
    return cloned
  }

  cloneAfter(overrides = {}) {
    let cloned = this.clone(overrides)
    this.parent.insertAfter(this, cloned)
    return cloned
  }

  cloneBefore(overrides = {}) {
    let cloned = this.clone(overrides)
    this.parent.insertBefore(this, cloned)
    return cloned
  }

  /** @returns {import("./css-syntax-error")} */ error(/** @type {string} */ message, /** @type {RangeOptions} */ opts = {}) {
    if (this.source) {
      let { end, start } = this.rangeBy(opts)
      return this.source.input.error(
        message,
        { column: start.column, line: start.line },
        { column: end.column, line: end.line },
        opts
      )
    }
    return new CssSyntaxError(message)
  }

  getProxyProcessor() {
    return {
      get(node, prop) {
        if (prop === 'proxyOf') {
          return node
        } else if (prop === 'root') {
          return () => node.root().toProxy()
        } else {
          return node[prop]
        }
      },

      set(node, prop, value) {
        if (node[prop] === value) return true
        node[prop] = value
        if (
          prop === 'prop' ||
          prop === 'value' ||
          prop === 'name' ||
          prop === 'params' ||
          prop === 'important' ||
          /* c8 ignore next */
          prop === 'text'
        ) {
          node.markDirty()
        }
        return true
      }
    }
  }

  /* c8 ignore next 3 */
  markClean() {
    this[isClean] = true
  }

  markDirty() {
    if (this[isClean]) {
      this[isClean] = false
      /** @type {Node | undefined} */ let next = this
      while ((next = next.parent)) {
        next[isClean] = false
      }
    }
  }

  /** @returns {Node | undefined} */ next() {
    if (!this.parent) return undefined
    /** @type {number} */ let index = this.parent.index(this)
    return this.parent.nodes[index + 1]
  }

  /** @returns {Position} */ positionBy(/** @type {RangeOptions} */ opts = {}) {
    /** @type {string} */ let inputString =
      'document' in this.source.input
        ? this.source.input.document
        : this.source.input.css
    /** @type {Position} */ let pos = {
      column: this.source.start.column,
      line: this.source.start.line,
      offset: sourceOffset(inputString, this.source.start)
    }
    if (opts.index) {
      pos = this.positionInside(opts.index)
    } else if (opts.word) {
      let stringRepresentation = inputString.slice(
        sourceOffset(inputString, this.source.start),
        sourceOffset(inputString, this.source.end)
      )
      let index = stringRepresentation.indexOf(opts.word)
      if (index !== -1) pos = this.positionInside(index)
    }
    return pos
  }

  /** @returns {Position} */ positionInside(/** @type {number} */ index) {
    /** @type {number} */ let column = this.source.start.column
    /** @type {number} */ let line = this.source.start.line
    /** @type {string} */ let inputString =
      'document' in this.source.input
        ? this.source.input.document
        : this.source.input.css
    /** @type {number} */ let offset = sourceOffset(inputString, this.source.start)
    /** @type {number} */ let end = offset + index

    for (let i = offset; i < end; i++) {
      if (inputString[i] === '\n') {
        column = 1
        line += 1
      } else {
        column += 1
      }
    }

    return { column, line, offset: end }
  }

  /** @returns {Node | undefined} */ prev() {
    if (!this.parent) return undefined
    /** @type {number} */ let index = this.parent.index(this)
    return this.parent.nodes[index - 1]
  }

  /** @returns {{ end: Position, start: Position }} */ rangeBy(/** @type {RangeOptions} */ opts = {}) {
    /** @type {string} */ let inputString =
      'document' in this.source.input
        ? this.source.input.document
        : this.source.input.css
    /** @type {Position} */ let start = {
      column: this.source.start.column,
      line: this.source.start.line,
      offset: sourceOffset(inputString, this.source.start)
    }
    /** @type {Position} */ let end = this.source.end
      ? {
          column: this.source.end.column + 1,
          line: this.source.end.line,
          offset:
            typeof this.source.end.offset === 'number'
              ? // `source.end.offset` is exclusive, so we don't need to add 1
                this.source.end.offset
              : // Since line/column in this.source.end is inclusive,
                // the `sourceOffset(... , this.source.end)` returns an inclusive offset.
                // So, we add 1 to convert it to exclusive.
                sourceOffset(inputString, this.source.end) + 1
        }
      : {
          column: start.column + 1,
          line: start.line,
          offset: start.offset + 1
        }

    if (opts.word) {
      let stringRepresentation = inputString.slice(
        sourceOffset(inputString, this.source.start),
        sourceOffset(inputString, this.source.end)
      )
      let index = stringRepresentation.indexOf(opts.word)
      if (index !== -1) {
        start = this.positionInside(index)
        end = this.positionInside(index + opts.word.length)
      }
    } else {
      if (opts.start) {
        start = {
          column: opts.start.column,
          line: opts.start.line,
          offset: sourceOffset(inputString, opts.start)
        }
      } else if (typeof opts.index === 'number') {
        start = this.positionInside(opts.index)
      }

      if (opts.end) {
        end = {
          column: opts.end.column,
          line: opts.end.line,
          offset: sourceOffset(inputString, opts.end)
        }
      } else if (typeof opts.endIndex === 'number') {
        end = this.positionInside(opts.endIndex)
      } else if (typeof opts.index === 'number') {
        end = this.positionInside(opts.index + 1)
      }
    }

    if (
      end.line < start.line ||
      (end.line === start.line && end.column <= start.column)
    ) {
      end = {
        column: start.column + 1,
        line: start.line,
        offset: start.offset + 1
      }
    }

    return { end, start }
  }

  /** @returns {string} */ raw(/** @type {string} */ prop, /** @type {undefined | string} */ defaultType) {
    let str = new Stringifier()
    return str.raw(this, prop, defaultType)
  }

  /** @returns {Node} */ remove() {
    if (this.parent) {
      this.parent.removeChild(this)
    }
    /** @type {import("./container") | undefined} */ this.parent = undefined
    return this
  }

  /** @returns {Node} */ replaceWith(...nodes) {
    if (this.parent) {
      /** @type {any} */ let bookmark = this
      let foundSelf = false
      for (let node of nodes) {
        if (node === this) {
          foundSelf = true
        } else if (foundSelf) {
          this.parent.insertAfter(bookmark, node)
          bookmark = node
        } else {
          this.parent.insertBefore(bookmark, node)
        }
      }

      if (!foundSelf) {
        this.remove()
      }
    }

    return this
  }

  /** @returns {Node} */ root() {
    /** @type {Node} */ let result = this
    while (result.parent && result.parent.type !== 'document') {
      result = result.parent
    }
    return result
  }

  /** @returns {any} */ toJSON(/** @type {any} */ _, /** @type {Map<any, number> | undefined} */ inputs) {
    /** @type {Record<string, any>} */ let fixed = {}
    /** @type {boolean} */ let emitInputs = inputs == null
    inputs = inputs || new Map()
    /** @type {number} */ let inputsNextIndex = 0

    for (let name in this) {
      if (!Object.prototype.hasOwnProperty.call(this, name)) {
        /* c8 ignore next 2 */
        continue
      }
      if (name === 'parent' || name === 'proxyCache') continue
      /** @type {any} */ let value = this[name]

      if (Array.isArray(value)) {
        fixed[name] = value.map(/** @returns {any} */ (/** @type {any} */ i) => {
          if (typeof i === 'object' && i.toJSON) {
            return i.toJSON(null, inputs)
          } else {
            return i
          }
        })
      } else if (typeof value === 'object' && value.toJSON) {
        fixed[name] = value.toJSON(null, inputs)
      } else if (name === 'source') {
        if (value == null) continue
        /** @type {number | undefined} */ let inputId = inputs.get(value.input)
        if (inputId == null) {
          inputId = inputsNextIndex
          inputs.set(value.input, inputsNextIndex)
          inputsNextIndex++
        }
        fixed[name] = {
          end: value.end,
          inputId,
          start: value.start
        }
      } else {
        fixed[name] = value
      }
    }

    if (emitInputs) {
      fixed.inputs = [...inputs.keys()].map(/** @returns {any} */ (/** @type {any} */ input) => input.toJSON())
    }

    return fixed
  }

  /** @returns {any} */ toProxy() {
    if (!this.proxyCache) {
      this.proxyCache = new Proxy(this, this.getProxyProcessor())
    }
    return this.proxyCache
  }

  /** @returns {string} */ toString(/** @type {any} */ stringifier = stringify) {
    if (stringifier.stringify) stringifier = stringifier.stringify
    /** @type {string} */ let result = ''
    stringifier(this, (/** @type {string} */ i) => {
      result += i
    })
    return result
  }

  warn(/** @type {import("./result")} */ result, /** @type {string} */ text, opts = {}) {
    /** @type {Record<string, any>} */ let data = { node: this }
    for (let i in opts) data[i] = opts[i]
    return result.warn(text, data)
  }
}

module.exports = Node
Node.default = Node

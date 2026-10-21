'use strict'

/**
 * @property {any} [node] given with the options
 * @property {number} [index] given with the options
 * @property {string} [plugin] given with the options
 * @property {string} [word] given with the options
 */
class Warning {
  constructor(/** @type {string} */ text, /** @type {any} */ opts = {}) {
    /** @type {string} */ this.type = 'warning'
    /** @type {string} */ this.text = text

    if (opts.node && opts.node.source) {
      let range = opts.node.rangeBy(opts)
      /** @type {number | undefined} */ this.line = range.start.line
      /** @type {number | undefined} */ this.column = range.start.column
      /** @type {number | undefined} */ this.endLine = range.end.line
      /** @type {number | undefined} */ this.endColumn = range.end.column
    }

    for (let opt in opts) this[opt] = opts[opt]
  }

  /** @returns {string} */ toString() {
    if (this.node) {
      return this.node.error(this.text, {
        index: this.index,
        plugin: this.plugin,
        word: this.word
      }).message
    }

    if (this.plugin) {
      return this.plugin + ': ' + this.text
    }

    return this.text
  }
}

module.exports = Warning
Warning.default = Warning

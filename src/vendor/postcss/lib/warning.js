'use strict'

let Container = require('./container')
let { my } = require('./symbols')

class Warning {
  constructor(/** @type {string} */ text, /** @type {any} */ opts = {}) {
    /** @type {string} */ this.type = 'warning'
    /** @type {string} */ this.text = text

    if (opts.node && opts.node.source) {
      if (!opts.node[my]) {
        // The node comes from another PostCSS copy in node_modules, so it does
        // not have this copy’s methods. Container#normalize() rebuilds such
        // nodes on insert, but a node passed straight to Result#warn() never
        // goes through it.
        Container.rebuild(opts.node)
      }
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
        start: this.start,
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

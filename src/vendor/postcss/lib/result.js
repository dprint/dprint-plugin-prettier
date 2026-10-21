'use strict'

let Warning = require('./warning')

/**
 * @property {any} [lastPlugin] given by the result that runs the plugins
 */
class Result {
  /** @returns {string} */ get content() {
    return this.css
  }

  constructor(/** @type {any} */ processor, /** @type {any} */ root, /** @type {any} */ opts) {
    /** @type {any} */ this.processor = processor
    /** @type {any[]} */ this.messages = []
    /** @type {any} */ this.root = root
    /** @type {any} */ this.opts = opts
    /** @type {string} */ this.css = ''
    /** @type {any} */ this.map = undefined
  }

  /** @returns {string} */ toString() {
    return this.css
  }

  /** @returns {import("./warning")} */ warn(/** @type {string} */ text, /** @type {any} */ opts = {}) {
    if (!opts.plugin) {
      if (this.lastPlugin && this.lastPlugin.postcssPlugin) {
        opts.plugin = this.lastPlugin.postcssPlugin
      }
    }

    let warning = new Warning(text, opts)
    this.messages.push(warning)

    return warning
  }

  /** @returns {any[]} */ warnings() {
    return this.messages.filter(/** @returns {boolean} */ i => i.type === 'warning')
  }
}

module.exports = Result
Result.default = Result

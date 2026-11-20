// @nts-check
'use strict'

let Container = require('./container')
let list = require('./list')

/**
 * @property {boolean} [mixin] given by postcss-less
 * @property {boolean} [extend] given by postcss-less and prettier
 * @property {boolean} [isScssNestedProperty] given by prettier
 */
class Rule extends Container {
  /** @returns {string[]} */ get selectors() {
    return list.comma(this.selector)
  }

  set selectors(/** @type {string[]} */ values) {
    /** @type {RegExpMatchArray | null} */ let match = this.selector ? this.selector.match(/,\s*/) : null
    /** @type {string} */ let sep = match ? match[0] : ',' + this.raw('between', 'beforeOpen')
    this.selector = values.join(sep)
  }

  constructor(/** @type {any} */ defaults) {
    super(defaults)
    /** @type {string} */ this.type = 'rule'
    if (!this.nodes) this.nodes = []
  }
}

module.exports = Rule
Rule.default = Rule

Container.registerRule(Rule)

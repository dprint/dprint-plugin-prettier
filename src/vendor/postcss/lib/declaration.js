// @nts-check
'use strict'

let Node = require('./node')

/**
 * @property {boolean} [extend] given by postcss-less and prettier
 * @property {boolean} [scssGlobal] given by prettier
 * @property {boolean} [scssDefault] given by prettier
 * @property {boolean} [isNested] given by postcss-scss
 */
class Declaration extends Node {
  get variable() {
    return this.prop.startsWith('--') || this.prop[0] === '$'
  }

  constructor(/** @type {any} */ defaults) {
    if (
      defaults &&
      typeof defaults.value !== 'undefined' &&
      typeof defaults.value !== 'string'
    ) {
      defaults = { ...defaults, value: String(defaults.value) }
    }
    super(defaults)
    /** @type {string} */ this.type = 'decl'
  }
}

module.exports = Declaration
Declaration.default = Declaration

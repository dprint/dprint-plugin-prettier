// @nts-check
'use strict'

let Container = require('./container')

/**
 * @property {boolean} [mixin] given by postcss-less
 * @property {boolean} [variable] given by postcss-less and prettier
 * @property {boolean} [function] given by postcss-less
 * @property {boolean} [import] given by postcss-less and prettier
 * @property {string} [customSelector] given by prettier
 */
class AtRule extends Container {
  constructor(defaults) {
    super(defaults)
    /** @type {string} */ this.type = 'atrule'
  }

  append(...children) {
    if (!this.proxyOf.nodes) this.nodes = []
    return super.append(...children)
  }

  prepend(...children) {
    if (!this.proxyOf.nodes) this.nodes = []
    return super.prepend(...children)
  }
}

module.exports = AtRule
AtRule.default = AtRule

Container.registerAtRule(AtRule)

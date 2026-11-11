// @nts-check
const { Container } = require('postcss')

class NestedDeclaration extends Container {
  constructor(defaults) {
    super(defaults)
    /** @type {string} */ this.type = 'decl'
    /** @type {boolean} */ this.isNested = true
    if (!this.nodes) this.nodes = []
  }
}

module.exports = NestedDeclaration

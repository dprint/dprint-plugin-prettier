// @nts-check
let Stringifier = require('postcss/lib/stringifier')

class ScssStringifier extends Stringifier {
  comment(/** @type {import("postcss/lib/node")} */ node) {
    /** @type {string} */ let left = this.raw(node, 'left', 'commentLeft')
    /** @type {string} */ let right = this.raw(node, 'right', 'commentRight')

    if (node.raws.inline) {
      /** @type {string} */ let text = node.raws.text || node.text
      this.builder('//' + left + text + right, node)
    } else {
      this.builder('/*' + left + node.text + right + '*/', node)
    }
  }

  decl(/** @type {import("postcss/lib/node")} */ node, /** @type {undefined | boolean} */ semicolon) {
    if (!node.isNested) {
      super.decl(node, semicolon)
    } else {
      /** @type {string} */ let between = this.raw(node, 'between', 'colon')
      /** @type {string} */ let string = node.prop + between + this.rawValue(node, 'value')
      if (node.important) {
        string += node.raws.important || ' !important'
      }

      this.builder(string + '{', node, 'start')

      /** @type {string} */ let after
      if (node.nodes && node.nodes.length) {
        this.body(node)
        after = this.raw(node, 'after')
      } else {
        after = this.raw(node, 'after', 'emptyBody')
      }
      if (after) this.builder(after)
      this.builder('}', node, 'end')
    }
  }

  /** @returns {any} */ rawValue(/** @type {import("postcss/lib/node")} */ node, /** @type {string} */ prop) {
    let value = node[prop]
    let raw = node.raws[prop]
    if (raw && raw.value === value) {
      return raw.scss ? raw.scss : raw.raw
    } else {
      return value
    }
  }
}

module.exports = ScssStringifier

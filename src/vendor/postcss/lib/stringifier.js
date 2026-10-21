// @nts-check
'use strict'

// Escapes sequences that could break out of an HTML <style> context.
// Uses CSS unicode escaping (\3c = '<') which is valid CSS and parsed
// correctly by all compliant CSS consumers.
/** @type {RegExp} */ const STYLE_TAG = /(<)(\/?style\b)/gi
/** @type {RegExp} */ const COMMENT_OPEN = /(<)(!--)/g

/**
 * what a node is written out to, with the node it is of and whether it is its start or its end
 * @typedef {(str: string, node?: import("./node"), type?: string) => void} Builder
 */

/** @returns {any} */ function escapeHTMLInCSS(/** @type {any} */ str) {
  if (typeof str !== 'string') return str
  if (!str.includes('<')) return str
  return str.replace(STYLE_TAG, '\\3c $2').replace(COMMENT_OPEN, '\\3c $2')
}

/** @type {Record<string, string | boolean>} */ const DEFAULT_RAW = {
  after: '\n',
  beforeClose: '\n',
  beforeComment: '\n',
  beforeDecl: '\n',
  beforeOpen: ' ',
  beforeRule: '\n',
  colon: ': ',
  commentLeft: ' ',
  commentRight: ' ',
  emptyBody: '',
  indent: '    ',
  semicolon: false
}

/** @returns {string} */ function capitalize(/** @type {string} */ str) {
  return str[0].toUpperCase() + str.slice(1)
}

class Stringifier {
  constructor(/** @type {Builder} */ builder) {
    /** @type {Builder} */ this.builder = builder
  }

  atrule(/** @type {import("./node")} */ node, /** @type {undefined | boolean} */ semicolon) {
    let raws = node.raws
    /** @type {string} */ let name = '@' + node.name
    /** @type {string} */ let params = node.params ? this.rawValue(node, 'params') : ''

    if (typeof raws.afterName !== 'undefined') {
      name += raws.afterName
    } else if (params) {
      name += ' '
    }

    if (node.nodes) {
      this.block(node, name + params)
    } else {
      let end = (raws.between || '') + (semicolon ? ';' : '')
      this.builder(escapeHTMLInCSS(name + params + end), node)
    }
  }

  /** @returns {string} */ beforeAfter(/** @type {import("./node")} */ node, /** @type {string} */ detect) {
    /** @type {string} */ let value
    if (node.type === 'decl') {
      value = this.raw(node, null, 'beforeDecl')
    } else if (node.type === 'comment') {
      value = this.raw(node, null, 'beforeComment')
    } else if (detect === 'before') {
      value = this.raw(node, null, 'beforeRule')
    } else {
      value = this.raw(node, null, 'beforeClose')
    }

    /** @type {import("./node") | undefined} */ let buf = node.parent
    let depth = 0
    while (buf && buf.type !== 'root') {
      depth += 1
      buf = buf.parent
    }

    if (value.includes('\n')) {
      /** @type {string} */ let indent = this.raw(node, null, 'indent')
      if (indent.length) {
        for (let step = 0; step < depth; step++) value += indent
      }
    }

    return value
  }

  block(/** @type {import("./node")} */ node, /** @type {string} */ start) {
    /** @type {string} */ let between = this.raw(node, 'between', 'beforeOpen')
    this.builder(escapeHTMLInCSS(start + between) + '{', node, 'start')

    /** @type {string} */ let after
    if (node.nodes && node.nodes.length) {
      this.body(node)
      after = this.raw(node, 'after')
    } else {
      after = this.raw(node, 'after', 'emptyBody')
    }

    if (after) this.builder(escapeHTMLInCSS(after))
    this.builder('}', node, 'end')
  }

  body(/** @type {import("./node")} */ node) {
    let nodes = node.nodes
    let last = nodes.length - 1
    while (last > 0) {
      if (nodes[last].type !== 'comment') break
      last -= 1
    }

    /** @type {boolean} */ let semicolon = this.raw(node, 'semicolon')
    let isDocument = node.type === 'document'
    for (let i = 0; i < nodes.length; i++) {
      let child = nodes[i]
      /** @type {string} */ let before = this.raw(child, 'before')
      if (before) this.builder(isDocument ? before : escapeHTMLInCSS(before))
      this.stringify(child, last !== i || semicolon)
    }
  }

  comment(/** @type {import("./node")} */ node) {
    /** @type {string} */ let left = this.raw(node, 'left', 'commentLeft')
    /** @type {string} */ let right = this.raw(node, 'right', 'commentRight')
    this.builder(escapeHTMLInCSS('/*' + left + node.text + right + '*/'), node)
  }

  decl(/** @type {import("./node")} */ node, /** @type {undefined | boolean} */ semicolon) {
    let raws = node.raws
    /** @type {string} */ let between = this.raw(node, 'between', 'colon')

    /** @type {string} */ let string = node.prop + between + this.rawValue(node, 'value')

    if (node.important) {
      string += raws.important || ' !important'
    }

    if (semicolon) string += ';'
    this.builder(escapeHTMLInCSS(string), node)
  }

  document(/** @type {import("./node")} */ node) {
    this.body(node)
  }

  /** @returns {any} */ raw(/** @type {import("./node")} */ node, /** @type {null | string} */ own, /** @type {undefined | string} */ detect) {
    /** @type {any} */ let value
    if (!detect) detect = own

    // Already had
    if (own) {
      value = node.raws[own]
      if (typeof value !== 'undefined') return value
    }

    /** @type {import("./container") | undefined} */ let parent = node.parent

    if (detect === 'before') {
      // Hack for first rule in CSS
      if (!parent || (parent.type === 'root' && parent.first === node)) {
        return ''
      }

      // `root` nodes in `document` should use only their own raws
      if (parent && parent.type === 'document') {
        return ''
      }
    }

    // Floating child without parent
    if (!parent) return DEFAULT_RAW[detect]

    // Detect style by other nodes
    /** @type {any} */ let root = node.root()
    let cache = root.rawCache || (root.rawCache = {})
    if (typeof cache[detect] !== 'undefined') {
      return cache[detect]
    }

    if (detect === 'before' || detect === 'after') {
      return this.beforeAfter(node, detect)
    } else {
      /** @type {string} */ let method = 'raw' + capitalize(detect)
      if (this[method]) {
        value = this[method](root, node)
      } else {
        root.walk((/** @type {import("./node")} */ i) => {
          value = i.raws[own]
          if (typeof value !== 'undefined') return false
        })
      }
    }

    if (typeof value === 'undefined') value = DEFAULT_RAW[detect]

    cache[detect] = value
    return value
  }

  /** @returns {undefined | string} */ rawBeforeClose(/** @type {import("./container")} */ root) {
    /** @type {string | undefined} */ let value
    root.walk(i => {
      if (i.nodes && i.nodes.length > 0) {
        if (typeof i.raws.after !== 'undefined') {
          value = i.raws.after
          if (value.includes('\n')) {
            value = value.replace(/[^\n]+$/, '')
          }
          return false
        }
      }
    })
    if (value) value = value.replace(/\S/g, '')
    return value
  }

  /** @returns {undefined | string} */ rawBeforeComment(/** @type {import("./container")} */ root, /** @type {import("./node")} */ node) {
    /** @type {string | undefined} */ let value
    root.walkComments((/** @type {import("./node")} */ i) => {
      if (typeof i.raws.before !== 'undefined') {
        value = i.raws.before
        if (value.includes('\n')) {
          value = value.replace(/[^\n]+$/, '')
        }
        return false
      }
    })
    if (typeof value === 'undefined') {
      value = this.raw(node, null, 'beforeDecl')
    } else if (value) {
      value = value.replace(/\S/g, '')
    }
    return value
  }

  /** @returns {undefined | string} */ rawBeforeDecl(/** @type {import("./container")} */ root, /** @type {import("./node")} */ node) {
    /** @type {string | undefined} */ let value
    root.walkDecls((/** @type {import("./node")} */ i) => {
      if (typeof i.raws.before !== 'undefined') {
        value = i.raws.before
        if (value.includes('\n')) {
          value = value.replace(/[^\n]+$/, '')
        }
        return false
      }
    })
    if (typeof value === 'undefined') {
      value = this.raw(node, null, 'beforeRule')
    } else if (value) {
      value = value.replace(/\S/g, '')
    }
    return value
  }

  /** @returns {undefined | string} */ rawBeforeOpen(/** @type {import("./container")} */ root) {
    /** @type {string | undefined} */ let value
    root.walk(i => {
      if (i.type !== 'decl') {
        value = i.raws.between
        if (typeof value !== 'undefined') return false
      }
    })
    return value
  }

  /** @returns {undefined | string} */ rawBeforeRule(/** @type {import("./container")} */ root) {
    /** @type {string | undefined} */ let value
    root.walk(i => {
      if (i.nodes && (i.parent !== root || root.first !== i)) {
        if (typeof i.raws.before !== 'undefined') {
          value = i.raws.before
          if (value.includes('\n')) {
            value = value.replace(/[^\n]+$/, '')
          }
          return false
        }
      }
    })
    if (value) value = value.replace(/\S/g, '')
    return value
  }

  /** @returns {undefined | string} */ rawColon(/** @type {import("./container")} */ root) {
    /** @type {string | undefined} */ let value
    root.walkDecls((/** @type {import("./node")} */ i) => {
      if (typeof i.raws.between !== 'undefined') {
        value = i.raws.between.replace(/[^\s:]/g, '')
        return false
      }
    })
    return value
  }

  /** @returns {undefined | string} */ rawEmptyBody(/** @type {import("./container")} */ root) {
    /** @type {string | undefined} */ let value
    root.walk(i => {
      if (i.nodes && i.nodes.length === 0) {
        value = i.raws.after
        if (typeof value !== 'undefined') return false
      }
    })
    return value
  }

  /** @returns {undefined | string} */ rawIndent(/** @type {import("./container")} */ root) {
    if (root.raws.indent) return root.raws.indent
    /** @type {string | undefined} */ let value
    root.walk(i => {
      /** @type {import("./container") | undefined} */ let p = i.parent
      if (p && p !== root && p.parent && p.parent === root) {
        if (typeof i.raws.before !== 'undefined') {
          /** @type {string[]} */ let parts = i.raws.before.split('\n')
          value = parts[parts.length - 1]
          value = value.replace(/\S/g, '')
          return false
        }
      }
    })
    return value
  }

  /** @returns {undefined | boolean} */ rawSemicolon(/** @type {import("./container")} */ root) {
    /** @type {boolean | undefined} */ let value
    root.walk(i => {
      if (i.nodes && i.nodes.length && i.last.type === 'decl') {
        value = i.raws.semicolon
        if (typeof value !== 'undefined') return false
      }
    })
    return value
  }

  /** @returns {any} */ rawValue(/** @type {import("./node")} */ node, /** @type {string} */ prop) {
    let value = node[prop]
    let raw = node.raws[prop]
    if (raw && raw.value === value) {
      return raw.raw
    }

    return value
  }

  root(/** @type {import("./node")} */ node) {
    this.body(node)
    if (node.raws.after) {
      /** @type {string} */ let after = node.raws.after
      /** @type {boolean} */ let isDocument = node.parent && node.parent.type === 'document'
      this.builder(isDocument ? after : escapeHTMLInCSS(after))
    }
  }

  rule(/** @type {import("./node")} */ node) {
    this.block(node, this.rawValue(node, 'selector'))
    if (node.raws.ownSemicolon) {
      this.builder(escapeHTMLInCSS(node.raws.ownSemicolon), node, 'end')
    }
  }

  stringify(/** @type {import("./node")} */ node, /** @type {undefined | boolean} */ semicolon) {
    /* c8 ignore start */
    if (!this[node.type]) {
      throw new Error(
        'Unknown AST node type ' +
          node.type +
          '. ' +
          'Maybe you need to change PostCSS stringifier.'
      )
    }
    /* c8 ignore stop */
    this[node.type](node, semicolon)
  }
}

module.exports = Stringifier
Stringifier.default = Stringifier

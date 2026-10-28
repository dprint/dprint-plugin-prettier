// @nts-check
'use strict'

let Comment = require('./comment')
let Declaration = require('./declaration')
let Node = require('./node')
let { isClean, my } = require('./symbols')

/** @type {typeof import("./at-rule")} */ let AtRule
/** @type {(css: string, opts?: any) => import("./root")} */ let parse
/** @type {typeof import("./root")} */ let Root
/** @type {typeof import("./rule")} */ let Rule

/** @returns {import("./node")[]} */ function cleanSource(/** @type {import("./node")[]} */ nodes) {
  return nodes.map(/** @returns {import("./node")} */ i => {
    if (i.nodes) i.nodes = cleanSource(i.nodes)
    delete i.source
    return i
  })
}

function markTreeDirty(/** @type {import("./node")} */ node) {
  node[isClean] = false
  if (node.proxyOf.nodes) {
    for (let i of node.proxyOf.nodes) {
      markTreeDirty(i)
    }
  }
}

class Container extends Node {
  /** @returns {import("./node") | undefined} */ get first() {
    if (!this.proxyOf.nodes) return undefined
    return this.proxyOf.nodes[0]
  }

  /** @returns {import("./node") | undefined} */ get last() {
    if (!this.proxyOf.nodes) return undefined
    return this.proxyOf.nodes[this.proxyOf.nodes.length - 1]
  }

  /** @returns {Container} */ append(...children) {
    for (let child of children) {
      let nodes = this.normalize(child, this.last)
      for (let node of nodes) this.proxyOf.nodes.push(node)
    }

    this.markDirty()

    return this
  }

  cleanRaws(/** @type {undefined | boolean} */ keepBetween) {
    super.cleanRaws(keepBetween)
    if (this.nodes) {
      for (let node of this.nodes) node.cleanRaws(keepBetween)
    }
  }

  /** @returns {undefined | boolean} */ each(/** @type {(a0?: any, a1?: any) => any} */ callback) {
    if (!this.proxyOf.nodes) return undefined
    /** @type {number} */ let iterator = this.getIterator()

    /** @type {number} */ let index
    /** @type {any} */ let result
    while (this.indexes[iterator] < this.proxyOf.nodes.length) {
      index = this.indexes[iterator]
      result = callback(this.proxyOf.nodes[index], index)
      if (result === false) break

      this.indexes[iterator] += 1
    }

    delete this.indexes[iterator]
    return result
  }

  /** @returns {boolean} */ every(/** @type {(node: import("./node"), index: number, nodes: import("./node")[]) => boolean} */ condition) {
    return this.nodes.every(condition)
  }

  /** @returns {number} */ getIterator() {
    if (!this.lastEach) this.lastEach = 0
    if (!this.indexes) this.indexes = {}

    this.lastEach += 1
    /** @type {number} */ let iterator = this.lastEach
    this.indexes[iterator] = 0

    return iterator
  }

  getProxyProcessor() {
    return {
      get(node, prop) {
        if (prop === 'proxyOf') {
          return node
        } else if (!node[prop]) {
          return node[prop]
        } else if (
          prop === 'each' ||
          (typeof prop === 'string' && prop.startsWith('walk'))
        ) {
          return (...args) => {
            return node[prop](
              ...args.map(i => {
                if (typeof i === 'function') {
                  return (child, index) => i(child.toProxy(), index)
                } else {
                  return i
                }
              })
            )
          }
        } else if (prop === 'every' || prop === 'some') {
          return cb => {
            return node[prop]((child, ...other) =>
              cb(child.toProxy(), ...other)
            )
          }
        } else if (prop === 'root') {
          return () => node.root().toProxy()
        } else if (prop === 'nodes') {
          return node.nodes.map(i => i.toProxy())
        } else if (prop === 'first' || prop === 'last') {
          return node[prop].toProxy()
        } else {
          return node[prop]
        }
      },

      set(node, prop, value) {
        if (node[prop] === value) return true
        node[prop] = value
        if (prop === 'name' || prop === 'params' || prop === 'selector') {
          node.markDirty()
        }
        return true
      }
    }
  }

  /** @returns {number} */ index(/** @type {any} */ child) {
    if (typeof child === 'number') return child
    if (child.proxyOf) child = child.proxyOf
    return this.proxyOf.nodes.indexOf(child)
  }

  /** @returns {Container} */ insertAfter(exist, add) {
    /** @type {number} */ let existIndex = this.index(exist)
    /** @type {import("./node")[]} */ let nodes = this.normalize(add, this.proxyOf.nodes[existIndex]).reverse()
    existIndex = this.index(exist)
    for (let node of nodes) this.proxyOf.nodes.splice(existIndex + 1, 0, node)

    /** @type {number} */ let index
    for (let id in this.indexes) {
      index = this.indexes[id]
      if (existIndex < index) {
        this.indexes[id] = index + nodes.length
      }
    }

    this.markDirty()

    return this
  }

  /** @returns {Container} */ insertBefore(exist, add) {
    /** @type {number} */ let existIndex = this.index(exist)
    let type = existIndex === 0 ? 'prepend' : false
    /** @type {import("./node")[]} */ let nodes = this.normalize(
      add,
      this.proxyOf.nodes[existIndex],
      type
    ).reverse()
    existIndex = this.index(exist)
    for (let node of nodes) this.proxyOf.nodes.splice(existIndex, 0, node)

    /** @type {number} */ let index
    for (let id in this.indexes) {
      index = this.indexes[id]
      if (existIndex <= index) {
        this.indexes[id] = index + nodes.length
      }
    }

    this.markDirty()

    return this
  }

  /** @returns {import("./node")[]} */ normalize(nodes, /** @type {import("./node") | undefined} */ sample) {
    if (typeof nodes === 'string') {
      nodes = cleanSource(parse(nodes).nodes)
    } else if (typeof nodes === 'undefined') {
      nodes = []
    } else if (Array.isArray(nodes)) {
      nodes = nodes.slice(0)
      for (let i of nodes) {
        if (i.parent) i.parent.removeChild(i, 'ignore')
      }
    } else if (nodes.type === 'root' && this.type !== 'document') {
      nodes = nodes.nodes.slice(0)
      for (let i of nodes) {
        if (i.parent) i.parent.removeChild(i, 'ignore')
      }
    } else if (nodes.type) {
      nodes = [nodes]
    } else if (nodes.prop) {
      if (typeof nodes.value === 'undefined') {
        throw new Error('Value field is missed in node creation')
      } else if (typeof nodes.value !== 'string') {
        nodes.value = String(nodes.value)
      }
      nodes = [new Declaration(nodes)]
    } else if (nodes.selector || nodes.selectors) {
      nodes = [new Rule(nodes)]
    } else if (nodes.name) {
      nodes = [new AtRule(nodes)]
    } else if (nodes.text) {
      nodes = [new Comment(nodes)]
    } else {
      throw new Error('Unknown node type in node creation')
    }

    /** @type {any[]} */ let processed = nodes.map(/** @returns {any} */ (/** @type {any} */ i) => {
      /* c8 ignore next */
      if (!i[my]) Container.rebuild(i)
      i = i.proxyOf
      if (i.parent) i.parent.removeChild(i)
      if (i[isClean]) markTreeDirty(i)

      if (!i.raws) i.raws = {}
      if (typeof i.raws.before === 'undefined') {
        if (sample && typeof sample.raws.before !== 'undefined') {
          i.raws.before = sample.raws.before.replace(/\S/g, '')
        }
      }
      i.parent = this.proxyOf
      return i
    })

    return processed
  }

  /** @returns {Container} */ prepend(...children) {
    children = children.reverse()
    for (let child of children) {
      /** @type {import("./node")[]} */ let nodes = this.normalize(child, this.first, 'prepend').reverse()
      for (let node of nodes) this.proxyOf.nodes.unshift(node)
      for (let id in this.indexes) {
        this.indexes[id] = this.indexes[id] + nodes.length
      }
    }

    this.markDirty()

    return this
  }

  /** @returns {Container} */ push(/** @type {import("./node")} */ child) {
    child.parent = this
    this.proxyOf.nodes.push(child)
    return this
  }

  /** @returns {Container} */ removeAll() {
    for (let node of this.proxyOf.nodes) node.parent = undefined
    this.proxyOf.nodes = []

    this.markDirty()

    return this
  }

  /** @returns {Container} */ removeChild(child) {
    child = this.index(child)
    this.proxyOf.nodes[child].parent = undefined
    this.proxyOf.nodes.splice(child, 1)

    /** @type {number} */ let index
    for (let id in this.indexes) {
      index = this.indexes[id]
      if (index >= child) {
        this.indexes[id] = index - 1
      }
    }

    this.markDirty()

    return this
  }

  /** @returns {Container} */ replaceValues(/** @type {any} */ pattern, /** @type {any} */ opts, /** @type {any} */ callback) {
    if (!callback) {
      callback = opts
      opts = {}
    }

    this.walkDecls((/** @type {import("./node")} */ decl) => {
      if (opts.props && !opts.props.includes(decl.prop)) return
      if (opts.fast && !decl.value.includes(opts.fast)) return

      decl.value = decl.value.replace(pattern, callback)
    })

    this.markDirty()

    return this
  }

  /** @returns {boolean} */ some(/** @type {(node: import("./node"), index: number, nodes: import("./node")[]) => boolean} */ condition) {
    return this.nodes.some(condition)
  }

  /** @returns {undefined | boolean} */ walk(/** @type {(node: import("./node"), index: number) => any} */ callback) {
    return this.each((/** @type {import("./node")} */ child, /** @type {number} */ i) => {
      /** @type {any} */ let result
      try {
        result = callback(child, i)
      } catch (e) {
        throw child.addToError(e)
      }
      if (result !== false && child.walk) {
        result = child.walk(callback)
      }

      return result
    })
  }

  /** @returns {undefined | boolean} */ walkAtRules(/** @type {any} */ name, /** @type {any} */ callback) {
    if (!callback) {
      callback = name
      return this.walk((child, i) => {
        if (child.type === 'atrule') {
          return callback(child, i)
        }
      })
    }
    if (name instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === 'atrule' && name.test(child.name)) {
          return callback(child, i)
        }
      })
    }
    return this.walk((child, i) => {
      if (child.type === 'atrule' && child.name === name) {
        return callback(child, i)
      }
    })
  }

  /** @returns {undefined | boolean} */ walkComments(/** @type {(node: import("./node"), index: number) => any} */ callback) {
    return this.walk((child, i) => {
      if (child.type === 'comment') {
        return callback(child, i)
      }
    })
  }

  /** @returns {undefined | boolean} */ walkDecls(/** @type {any} */ prop, /** @type {any} */ callback) {
    if (!callback) {
      callback = prop
      return this.walk((child, i) => {
        if (child.type === 'decl') {
          return callback(child, i)
        }
      })
    }
    if (prop instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === 'decl' && prop.test(child.prop)) {
          return callback(child, i)
        }
      })
    }
    return this.walk((child, i) => {
      if (child.type === 'decl' && child.prop === prop) {
        return callback(child, i)
      }
    })
  }

  /** @returns {undefined | boolean} */ walkRules(/** @type {any} */ selector, /** @type {any} */ callback) {
    if (!callback) {
      callback = selector

      return this.walk((child, i) => {
        if (child.type === 'rule') {
          return callback(child, i)
        }
      })
    }
    if (selector instanceof RegExp) {
      return this.walk((child, i) => {
        if (child.type === 'rule' && selector.test(child.selector)) {
          return callback(child, i)
        }
      })
    }
    return this.walk((child, i) => {
      if (child.type === 'rule' && child.selector === selector) {
        return callback(child, i)
      }
    })
  }
}

Container.registerParse = (/** @type {(css: string, opts?: any) => import("./root")} */ dependant) => {
  parse = dependant
}

Container.registerRule = (/** @type {typeof import("./rule")} */ dependant) => {
  Rule = dependant
}

Container.registerAtRule = (/** @type {typeof import("./at-rule")} */ dependant) => {
  AtRule = dependant
}

Container.registerRoot = (/** @type {typeof import("./root")} */ dependant) => {
  Root = dependant
}

module.exports = Container
Container.default = Container

/* c8 ignore start */
Container.rebuild = (/** @type {any} */ node) => {
  if (node.type === 'atrule') {
    Object.setPrototypeOf(node, AtRule.prototype)
  } else if (node.type === 'rule') {
    Object.setPrototypeOf(node, Rule.prototype)
  } else if (node.type === 'decl') {
    Object.setPrototypeOf(node, Declaration.prototype)
  } else if (node.type === 'comment') {
    Object.setPrototypeOf(node, Comment.prototype)
  } else if (node.type === 'root') {
    Object.setPrototypeOf(node, Root.prototype)
  }

  node[my] = true

  if (node.nodes) {
    node.nodes.forEach((/** @type {any} */ child) => {
      Container.rebuild(child)
    })
  }
}
/* c8 ignore stop */

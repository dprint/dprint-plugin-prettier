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
  let stack = nodes.slice()
  while (stack.length > 0) {
    let node = stack.pop()
    delete node.source
    if (node.nodes) {
      node.nodes = node.nodes.slice()
      for (let i of node.nodes) stack.push(i)
    }
  }
  return nodes.slice()
}

function markTreeDirty(/** @type {import("./node")} */ node) {
  let stack = [node]
  while (stack.length > 0) {
    let next = stack.pop()
    next[isClean] = false
    if (next.proxyOf.nodes) {
      for (let i of next.proxyOf.nodes) stack.push(i)
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
    let stack = [this]
    while (stack.length > 0) {
      let node = stack.pop()
      if (node !== this && node.cleanRaws !== Container.prototype.cleanRaws) {
        // Subclass with own logic; let it handle its subtree
        node.cleanRaws(keepBetween)
        continue
      }
      Node.prototype.cleanRaws.call(node, keepBetween)
      if (node.nodes) {
        for (let child of node.nodes) stack.push(child)
      }
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
    if (!this.proxyOf.nodes) return undefined

    // An explicit stack instead of recursive `each()` calls to survive
    // deeply nested trees. Each frame keeps a live `indexes` slot, so
    // insertion and removal during the walk behave like `each()`: the
    // slot stays at the current child until its subtree is finished.
    let stack = [{ iterator: this.getIterator(), node: this.proxyOf }]

    while (stack.length > 0) {
      let { iterator, node } = stack[stack.length - 1]
      let index = node.indexes[iterator]

      if (index >= node.proxyOf.nodes.length) {
        delete node.indexes[iterator]
        stack.pop()
        let parent = stack[stack.length - 1]
        // Finish the parent’s step for the child subtree we just left
        if (parent) parent.node.indexes[parent.iterator] += 1
        continue
      }

      let child = node.proxyOf.nodes[index]
      /** @type {any} */ let result
      try {
        result = callback(child, index)
      } catch (e) {
        throw child.addToError(e)
      }
      if (result === false) {
        for (let opened of stack) {
          delete opened.node.indexes[opened.iterator]
        }
        return false
      }
      if (child.walk && child.proxyOf.nodes) {
        stack.push({ iterator: child.getIterator(), node: child })
      } else {
        node.indexes[iterator] += 1
      }
    }

    return undefined
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
  let stack = [node]
  while (stack.length > 0) {
    let next = stack.pop()
    if (next.type === 'atrule') {
      Object.setPrototypeOf(next, AtRule.prototype)
    } else if (next.type === 'rule') {
      Object.setPrototypeOf(next, Rule.prototype)
    } else if (next.type === 'decl') {
      Object.setPrototypeOf(next, Declaration.prototype)
    } else if (next.type === 'comment') {
      Object.setPrototypeOf(next, Comment.prototype)
    } else if (next.type === 'root') {
      Object.setPrototypeOf(next, Root.prototype)
    }

    next[my] = true

    if (next.nodes) {
      for (let child of next.nodes) stack.push(child)
    }
  }
}
/* c8 ignore stop */

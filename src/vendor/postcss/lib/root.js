// @nts-check
'use strict'

let Container = require('./container')

/** @type {typeof import("./lazy-result")} */ let LazyResult
/** @type {typeof import("./processor")} */ let Processor

class Root extends Container {
  constructor(/** @type {any} */ defaults) {
    super(defaults)
    /** @type {string} */ this.type = 'root'
    if (!this.nodes) this.nodes = []
  }

  /** @returns {import("./node")[]} */ normalize(child, /** @type {import("./node") | undefined} */ sample, /** @type {any} */ type) {
    /** @type {import("./node")[]} */ let nodes = super.normalize(child)

    if (sample) {
      if (type === 'prepend') {
        if (this.nodes.length > 1) {
          sample.raws.before = this.nodes[1].raws.before
        } else {
          delete sample.raws.before
        }
      } else if (this.first !== sample) {
        for (let node of nodes) {
          node.raws.before = sample.raws.before
        }
      }
    }

    return nodes
  }

  /** @returns {import("./container")} */ removeChild(child, /** @type {any} */ ignore) {
    /** @type {number} */ let index = this.index(child)

    if (!ignore && index === 0 && this.nodes.length > 1) {
      this.nodes[1].raws.before = this.nodes[index].raws.before
    }

    return super.removeChild(child)
  }

  /** @returns {any} */ toResult(/** @type {any} */ opts = {}) {
    let lazy = new LazyResult(new Processor(), this, opts)
    return lazy.stringify()
  }
}

Root.registerLazyResult = (/** @type {typeof import("./lazy-result")} */ dependant) => {
  LazyResult = dependant
}

Root.registerProcessor = (/** @type {typeof import("./processor")} */ dependant) => {
  Processor = dependant
}

module.exports = Root
Root.default = Root

Container.registerRoot(Root)

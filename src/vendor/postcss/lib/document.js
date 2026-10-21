// @nts-check
'use strict'

let Container = require('./container')

/** @type {typeof import("./lazy-result")} */ let LazyResult
/** @type {typeof import("./processor")} */ let Processor

class Document extends Container {
  constructor(/** @type {any} */ defaults) {
    // type needs to be passed to super, otherwise child roots won't be normalized correctly
    super({ type: 'document', ...defaults })

    if (!this.nodes) {
      this.nodes = []
    }
  }

  /** @returns {any} */ toResult(/** @type {any} */ opts = {}) {
    let lazy = new LazyResult(new Processor(), this, opts)

    return lazy.stringify()
  }
}

Document.registerLazyResult = (/** @type {typeof import("./lazy-result")} */ dependant) => {
  LazyResult = dependant
}

Document.registerProcessor = (/** @type {typeof import("./processor")} */ dependant) => {
  Processor = dependant
}

module.exports = Document
Document.default = Document

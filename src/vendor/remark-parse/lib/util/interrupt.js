// @nts-check
'use strict'

module.exports = interrupt

/** @returns {boolean} */ function interrupt(/** @type {any[]} */ interruptors, /** @type {Record<string, import("../tokenizer.js").RemarkTokenizer>} */ tokenizers, /** @type {import("../parser.js").RemarkParser} */ ctx, /** @type {any[]} */ parameters) {
  /** @type {number} */ var length = interruptors.length
  /** @type {number} */ var index = -1
  /** @type {any[]} */ var interruptor
  /** @type {{pedantic?: boolean, commonmark?: boolean}} */ var config

  while (++index < length) {
    interruptor = interruptors[index]
    config = interruptor[1] || {}

    if (
      config.pedantic !== undefined &&
      config.pedantic !== ctx.options.pedantic
    ) {
      continue
    }

    if (
      config.commonmark !== undefined &&
      config.commonmark !== ctx.options.commonmark
    ) {
      continue
    }

    if (tokenizers[interruptor[0]].apply(ctx, parameters)) {
      return true
    }
  }

  return false
}

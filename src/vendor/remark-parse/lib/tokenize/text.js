// @nts-check
'use strict'

module.exports = text

/** @this {import("../parser.js").RemarkParser} */ function text(/** @type {import("../tokenizer.js").RemarkEat} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
  var self = this
  /** @type {string[]} */ var methods
  /** @type {Record<string, import("../tokenizer.js").RemarkTokenizer>} */ var tokenizers
  /** @type {number} */ var index
  /** @type {number} */ var length
  /** @type {string} */ var subvalue
  /** @type {number} */ var position
  /** @type {(this: import("../parser.js").RemarkParser, value: StringView, fromIndex: number) => number} */ var tokenizer
  /** @type {string} */ var name
  /** @type {number} */ var min
  /** @type {import("../tokenizer.js").RemarkPoint} */ var now

  /* istanbul ignore if - never used (yet) */
  if (silent) {
    return true
  }

  methods = self.inlineMethods
  length = methods.length
  tokenizers = self.inlineTokenizers
  index = -1
  min = value.length

  while (++index < length) {
    name = methods[index]

    if (name === 'text' || !tokenizers[name]) {
      continue
    }

    tokenizer = tokenizers[name].locator

    if (!tokenizer) {
      eat.file.fail('Missing locator: `' + name + '`')
    }

    position = tokenizer.call(self, value, 1)

    if (position !== -1 && position < min) {
      min = position
    }
  }

  subvalue = value.slice(0, min)
  now = eat.now()

  self.decode(subvalue, now, handler)

  function handler(/** @type {string | undefined} */ content, position, /** @type {string | undefined} */ source) {
    eat(source || content)({type: 'text', value: content})
  }
}

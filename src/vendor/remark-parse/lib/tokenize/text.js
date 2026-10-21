// @nts-check
'use strict'

module.exports = text

/** @this {import("../parser.js").RemarkParser} */ function text(eat, /** @type {StringView} */ value, silent) {
  var self = this
  var methods
  var tokenizers
  /** @type {number} */ var index
  /** @type {number} */ var length
  /** @type {string} */ var subvalue
  /** @type {number} */ var position
  var tokenizer
  /** @type {string} */ var name
  /** @type {number} */ var min
  var now

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

// @nts-check
'use strict'

var xtend = require('xtend')
var entities = require('parse-entities')

module.exports = factory

/**
 * Decodes the entities of a text into text nodes that it gives a handler, or into a text (`raw`)
 * @typedef {{
 *   (value: string, position: import("./tokenizer.js").RemarkPoint, handler: Function): void,
 *   raw: (value: string, position: import("./tokenizer.js").RemarkPoint, options?: any) => string,
 * }} RemarkDecode
 */

// Factory to create an entity decoder.
/** @returns {RemarkDecode} */ function factory(/** @type {import("./parser.js").RemarkParser} */ ctx) {
  decoder.raw = decodeRaw

  return decoder

  // Normalize `position` to add an `indent`.
  function normalize(/** @type {import("./tokenizer.js").RemarkPoint} */ position) {
    var offsets = ctx.offset
    /** @type {number} */ var line = position.line
    /** @type {number[]} */ var result = []

    while (++line) {
      if (!(line in offsets)) {
        break
      }

      result.push((offsets[line] || 0) + 1)
    }

    return {start: position, indent: result}
  }

  // Decode `value` (at `position`) into text-nodes.
  function decoder(/** @type {string} */ value, /** @type {import("./tokenizer.js").RemarkPoint} */ position, /** @type {Function} */ handler) {
    entities(value, {
      position: normalize(position),
      warning: handleWarning,
      text: handler,
      reference: handler,
      textContext: ctx,
      referenceContext: ctx
    })
  }

  // Decode `value` (at `position`) into a string.
  /** @returns {string} */ function decodeRaw(/** @type {string} */ value, /** @type {import("./tokenizer.js").RemarkPoint} */ position, options) {
    return entities(
      value,
      xtend(options, {position: normalize(position), warning: handleWarning})
    )
  }

  // Handle a warning.
  // See <https://github.com/wooorm/parse-entities> for the warnings.
  function handleWarning(/** @type {string} */ reason, position, /** @type {number} */ code) {
    if (code !== 3) {
      ctx.file.message(reason, position)
    }
  }
}

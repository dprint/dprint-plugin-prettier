// @nts-check
var util = require('./util')

module.exports = mathInline

/** @type {number} */ const tab = 9 // '\t'
/** @type {number} */ const space = 32 // ' '
/** @type {number} */ const dollarSign = 36 // '$'
/** @type {number} */ const digit0 = 48 // '0'
/** @type {number} */ const digit9 = 57 // '9'
/** @type {number} */ const backslash = 92 // '\\'

const classList = ['math', 'math-inline']
/** @type {string} */ const mathDisplay = 'math-display'

function mathInline(options) {
  const parser = this.Parser
  const compiler = this.Compiler

  if (util.isRemarkParser(parser)) {
    attachParser(parser, options)
  }

  if (util.isRemarkCompiler(compiler)) {
    attachCompiler(compiler, options)
  }
}

function attachParser(parser, options) {
  const proto = parser.prototype
  const inlineMethods = proto.inlineMethods

  mathInlineTokenizer.locator = locator

  proto.inlineTokenizers.math = mathInlineTokenizer

  inlineMethods.splice(inlineMethods.indexOf('text'), 0, 'math')

  /** @returns {number} */ function locator(/** @type {string} */ value, /** @type {number} */ fromIndex) {
    return value.indexOf('$', fromIndex)
  }

  function mathInlineTokenizer(/** @type {(a0?: any) => any} */ eat, /** @type {StringView} */ value, silent) {
    /** @type {number} */ const length = value.length
    /** @type {boolean} */ let double = false
    /** @type {boolean} */ let escaped = false
    /** @type {number} */ let index = 0
    /** @type {number | undefined} */ let previous
    /** @type {number} */ let code
    /** @type {number} */ let next
    /** @type {number} */ let contentStart
    /** @type {number | undefined} */ let contentEnd
    /** @type {number | undefined} */ let valueEnd
    /** @type {string} */ let content

    if (value.charCodeAt(index) === backslash) {
      escaped = true
      index++
    }

    if (value.charCodeAt(index) !== dollarSign) {
      return
    }

    index++

    // Support escaped dollars.
    if (escaped) {
      /* istanbul ignore if - never used (yet) */
      if (silent) {
        return true
      }

      return eat(value.slice(0, index))({type: 'text', value: '$'})
    }

    if (value.charCodeAt(index) === dollarSign) {
      double = true
      index++
    }

    next = value.charCodeAt(index)

    // Opening fence cannot be followed by a space or a tab.
    if (next === space || next === tab) {
      return
    }

    contentStart = index

    while (index < length) {
      code = next
      next = value.charCodeAt(index + 1)

      if (code === dollarSign) {
        previous = value.charCodeAt(index - 1)

        // Closing fence cannot be preceded by a space or a tab, or followed by
        // a digit.
        // If a double marker was used to open, the closing fence must consist
        // of two dollars as well.
        if (
          previous !== space &&
          previous !== tab &&
          // eslint-disable-next-line no-self-compare
          (next !== next || next < digit0 || next > digit9) &&
          (!double || next === dollarSign)
        ) {
          contentEnd = index - 1

          index++

          if (double) {
            index++
          }

          valueEnd = index
          break
        }
      } else if (code === backslash) {
        index++
        next = value.charCodeAt(index + 1)
      }

      index++
    }

    if (valueEnd === undefined) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    content = value.slice(contentStart, contentEnd + 1)

    return eat(value.slice(0, valueEnd))({
      type: 'inlineMath',
      value: content,
      data: {
        hName: 'span',
        hProperties: {
          className: classList.concat(
            double && options.inlineMathDouble ? [mathDisplay] : []
          )
        },
        hChildren: [{type: 'text', value: content}]
      }
    })
  }
}

function attachCompiler(compiler) {
  const proto = compiler.prototype

  proto.visitors.inlineMath = compileInlineMath

  function compileInlineMath(node) {
    let fence = '$'
    const classes =
      (node.data && node.data.hProperties && node.data.hProperties.className) ||
      []

    if (classes.includes(mathDisplay)) {
      fence = '$$'
    }

    return fence + node.value + fence
  }
}

// @nts-check
const util = require('./util')

module.exports = mathBlock

/** @type {number} */ const lineFeed = 10 //  '\n'
/** @type {number} */ const space = 32 // ' '
/** @type {number} */ const dollarSign = 36 // '$'

/** @type {string} */ const lineFeedChar = '\n'
/** @type {string} */ const dollarSignChar = '$'

/** @type {number} */ const minFenceCount = 2

const classList = ['math', 'math-display']

function mathBlock() {
  const parser = this.Parser
  const compiler = this.Compiler

  if (util.isRemarkParser(parser)) {
    attachParser(parser)
  }

  if (util.isRemarkCompiler(compiler)) {
    attachCompiler(compiler)
  }
}

function attachParser(parser) {
  const proto = parser.prototype
  const blockMethods = proto.blockMethods
  const interruptParagraph = proto.interruptParagraph
  const interruptList = proto.interruptList
  const interruptBlockquote = proto.interruptBlockquote

  proto.blockTokenizers.math = mathBlockTokenizer

  blockMethods.splice(blockMethods.indexOf('fencedCode') + 1, 0, 'math')

  // Inject math to interrupt rules
  interruptParagraph.splice(interruptParagraph.indexOf('fencedCode') + 1, 0, [
    'math'
  ])
  interruptList.splice(interruptList.indexOf('fencedCode') + 1, 0, ['math'])
  interruptBlockquote.splice(interruptBlockquote.indexOf('fencedCode') + 1, 0, [
    'math'
  ])

  function mathBlockTokenizer(/** @type {import("../remark-parse/lib/tokenizer.js").RemarkEat} */ eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
    /** @type {number} */ var length = value.length
    /** @type {number} */ var index = 0
    /** @type {number} */ let code
    let content
    /** @type {number} */ let lineEnd
    /** @type {number} */ let lineIndex
    /** @type {number} */ let openingFenceIndentSize
    /** @type {number} */ let openingFenceSize
    /** @type {number} */ let openingFenceContentStart
    /** @type {boolean} */ let closingFence
    /** @type {number} */ let closingFenceSize
    /** @type {number} */ let lineContentStart
    /** @type {number} */ let lineContentEnd

    // Skip initial spacing.
    while (index < length && value.charCodeAt(index) === space) {
      index++
    }

    openingFenceIndentSize = index

    // Skip the fence.
    while (index < length && value.charCodeAt(index) === dollarSign) {
      index++
    }

    openingFenceSize = index - openingFenceIndentSize

    // Exit if there is not enough of a fence.
    if (openingFenceSize < minFenceCount) {
      return
    }

    // Skip spacing after the fence.
    while (index < length && value.charCodeAt(index) === space) {
      index++
    }

    openingFenceContentStart = index

    // Eat everything after the fence.
    while (index < length) {
      code = value.charCodeAt(index)

      // We don’t allow dollar signs here, as that could interfere with inline
      // math.
      if (code === dollarSign) {
        return
      }

      if (code === lineFeed) {
        break
      }

      index++
    }

    if (value.charCodeAt(index) !== lineFeed) {
      return
    }

    if (silent) {
      return true
    }

    content = []

    if (openingFenceContentStart !== index) {
      content.push(value.slice(openingFenceContentStart, index))
    }

    index++
    lineEnd = value.indexOf(lineFeedChar, index + 1)
    lineEnd = lineEnd === -1 ? length : lineEnd

    while (index < length) {
      closingFence = false
      lineContentStart = index
      lineContentEnd = lineEnd
      lineIndex = lineEnd
      closingFenceSize = 0

      // First, let’s see if this is a valid closing fence.
      // Skip trailing white space
      while (
        lineIndex > lineContentStart &&
        value.charCodeAt(lineIndex - 1) === space
      ) {
        lineIndex--
      }

      // Skip the fence.
      while (
        lineIndex > lineContentStart &&
        value.charCodeAt(lineIndex - 1) === dollarSign
      ) {
        closingFenceSize++
        lineIndex--
      }

      // Check if this is a valid closing fence line.
      if (
        openingFenceSize <= closingFenceSize &&
        value.indexOf(dollarSignChar, lineContentStart) === lineIndex
      ) {
        closingFence = true
        lineContentEnd = lineIndex
      }

      // Sweet, next, we need to trim the line.
      // Skip initial spacing.
      while (
        lineContentStart <= lineContentEnd &&
        lineContentStart - index < openingFenceIndentSize &&
        value.charCodeAt(lineContentStart) === space
      ) {
        lineContentStart++
      }

      // If this is a closing fence, skip final spacing.
      if (closingFence) {
        while (
          lineContentEnd > lineContentStart &&
          value.charCodeAt(lineContentEnd - 1) === space
        ) {
          lineContentEnd--
        }
      }

      // If this is a content line, or if there is content before the fence:
      if (!closingFence || lineContentStart !== lineContentEnd) {
        content.push(value.slice(lineContentStart, lineContentEnd))
      }

      if (closingFence) {
        break
      }

      index = lineEnd + 1
      lineEnd = value.indexOf(lineFeedChar, index + 1)
      lineEnd = lineEnd === -1 ? length : lineEnd
    }

    content = content.join('\n')

    return eat(value.slice(0, lineEnd))({
      type: 'math',
      value: content,
      data: {
        hName: 'div',
        hProperties: {className: classList.concat()},
        hChildren: [{type: 'text', value: content}]
      }
    })
  }
}

function attachCompiler(compiler) {
  const proto = compiler.prototype

  proto.visitors.math = compileBlockMath

  function compileBlockMath(node) {
    return '$$\n' + node.value + '\n$$'
  }
}

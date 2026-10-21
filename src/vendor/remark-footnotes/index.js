// @nts-check
'use strict'

module.exports = footnotes

/** @type {number} */ var tab = 9 // '\t'
/** @type {number} */ var lineFeed = 10 // '\n'
/** @type {number} */ var space = 32
/** @type {number} */ var exclamationMark = 33 // '!'
/** @type {number} */ var colon = 58 // ':'
/** @type {number} */ var leftSquareBracket = 91 // '['
/** @type {number} */ var backslash = 92 // '\'
/** @type {number} */ var rightSquareBracket = 93 // ']'
/** @type {number} */ var caret = 94 // '^'
/** @type {number} */ var graveAccent = 96 //  '`'

/** @type {number} */ var tabSize = 4
/** @type {number} */ var maxSlice = 1024

/**
 * A place in the file, which remark-parse's tokenizer writes out as an object
 * @typedef {{ line: number, column: number, offset: number }} RemarkPoint
 */

/**
 * A line of a footnote's definition, with where its content starts and ends
 * @typedef {{ start: number, contentStart: number, contentEnd: number, end: number }} FootnoteLine
 */

function footnotes(options) {
  var parser = this.Parser
  var compiler = this.Compiler

  if (isRemarkParser(parser)) {
    attachParser(parser, options)
  }

  if (isRemarkCompiler(compiler)) {
    attachCompiler(compiler)
  }
}

/** @returns {boolean} */ function isRemarkParser(parser) {
  return Boolean(parser && parser.prototype && parser.prototype.blockTokenizers)
}

/** @returns {boolean} */ function isRemarkCompiler(compiler) {
  return Boolean(compiler && compiler.prototype && compiler.prototype.visitors)
}

function attachParser(parser, options) {
  var settings = options || {}
  var proto = parser.prototype
  var blocks = proto.blockTokenizers
  var spans = proto.inlineTokenizers
  var blockMethods = proto.blockMethods
  var inlineMethods = proto.inlineMethods
  var originalDefinition = blocks.definition
  var originalReference = spans.reference
  var interruptors = []
  /** @type {number} */ var index = -1
  /** @type {number} */ var length = blockMethods.length
  /** @type {string} */ var method

  // Interrupt by anything except for indented code or paragraphs.
  while (++index < length) {
    method = blockMethods[index]

    if (
      method === 'newline' ||
      method === 'indentedCode' ||
      method === 'paragraph' ||
      method === 'footnoteDefinition'
    ) {
      continue
    }

    interruptors.push([method])
  }

  interruptors.push(['footnoteDefinition'])

  // Insert tokenizers.
  if (settings.inlineNotes) {
    before(inlineMethods, 'reference', 'inlineNote')
    spans.inlineNote = footnote
  }

  before(blockMethods, 'definition', 'footnoteDefinition')
  before(inlineMethods, 'reference', 'footnoteCall')

  blocks.definition = definition
  blocks.footnoteDefinition = footnoteDefinition
  spans.footnoteCall = footnoteCall
  spans.reference = reference

  proto.interruptFootnoteDefinition = interruptors
  reference.locator = originalReference.locator
  footnoteCall.locator = locateFootnoteCall
  footnote.locator = locateFootnote

  function footnoteDefinition(eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
    var self = this
    var interruptors = self.interruptFootnoteDefinition
    var offsets = self.offset
    /** @type {number} */ var length = value.length + 1
    /** @type {number} */ var index = 0
    /** @type {string[]} */ var content = []
    /** @type {string} */ var label
    /** @type {number} */ var labelStart
    /** @type {number | undefined} */ var labelEnd
    /** @type {number | undefined} */ var code
    /** @type {RemarkPoint} */ var now
    var add
    /** @type {() => void} */ var exit
    var children
    /** @type {number} */ var start
    /** @type {number | undefined} */ var indent
    /** @type {number | undefined} */ var contentStart
    /** @type {FootnoteLine[]} */ var lines
    /** @type {FootnoteLine} */ var line

    // Skip initial whitespace.
    while (index < length) {
      code = value.charCodeAt(index)
      if (code !== tab && code !== space) break
      index++
    }

    // Parse `[^`.
    if (value.charCodeAt(index++) !== leftSquareBracket) return
    if (value.charCodeAt(index++) !== caret) return

    // Parse label.
    labelStart = index

    while (index < length) {
      code = value.charCodeAt(index)

      // Exit on white space.
      if (
        code !== code ||
        code === lineFeed ||
        code === tab ||
        code === space
      ) {
        return
      }

      if (code === rightSquareBracket) {
        labelEnd = index
        index++
        break
      }

      index++
    }

    // Exit if we didn’t find an end, no label, or there’s no colon.
    if (
      labelEnd === undefined ||
      labelStart === labelEnd ||
      value.charCodeAt(index++) !== colon
    ) {
      return
    }

    // Found it!
    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    label = value.slice(labelStart, labelEnd)

    // Now, to get all lines.
    now = eat.now()
    start = 0
    indent = 0
    contentStart = index
    lines = []

    while (index < length) {
      code = value.charCodeAt(index)

      if (code !== code || code === lineFeed) {
        line = {
          start: start,
          contentStart: contentStart || index,
          contentEnd: index,
          end: index
        }

        lines.push(line)

        // Prepare a new line.
        if (code === lineFeed) {
          start = index + 1
          indent = 0
          contentStart = undefined

          line.end = start
        }
      } else if (indent !== undefined) {
        if (code === space || code === tab) {
          indent += code === space ? 1 : tabSize - (indent % tabSize)

          if (indent > tabSize) {
            indent = undefined
            contentStart = index
          }
        } else {
          // If this line is not indented and it’s either preceded by a blank
          // line or starts a new block, exit.
          if (
            indent < tabSize &&
            line &&
            (line.contentStart === line.contentEnd ||
              interrupt(interruptors, blocks, self, [
                eat,
                value.slice(index, maxSlice),
                true
              ]))
          ) {
            break
          }

          indent = undefined
          contentStart = index
        }
      }

      index++
    }

    // Remove trailing lines without content.
    index = -1
    length = lines.length

    while (length > 0) {
      line = lines[length - 1]

      if (line.contentStart !== line.contentEnd) {
        break
      }

      length--
    }

    // Add all, but ignore the final line feed.
    add = eat(value.slice(0, line.contentEnd))

    // Add indent offsets and get content w/o indents.
    while (++index < length) {
      line = lines[index]

      offsets[now.line + index] =
        (offsets[now.line + index] || 0) + (line.contentStart - line.start)

      content.push(value.slice(line.contentStart, line.end))
    }

    // Parse content.
    exit = self.enterBlock()
    children = self.tokenizeBlock(content.join(''), now)
    exit()

    return add({
      type: 'footnoteDefinition',
      identifier: label.toLowerCase(),
      label: label,
      children: children
    })
  }

  // Parse a footnote call / footnote reference, such as `[^label]`
  function footnoteCall(/** @type {(a0?: any) => any} */ eat, /** @type {StringView} */ value, silent) {
    /** @type {number} */ var length = value.length + 1
    /** @type {number} */ var index = 0
    /** @type {string} */ var label
    /** @type {number} */ var labelStart
    /** @type {number | undefined} */ var labelEnd
    /** @type {number} */ var code

    if (value.charCodeAt(index++) !== leftSquareBracket) return
    if (value.charCodeAt(index++) !== caret) return

    labelStart = index

    while (index < length) {
      code = value.charCodeAt(index)

      if (
        code !== code ||
        code === lineFeed ||
        code === tab ||
        code === space
      ) {
        return
      }

      if (code === rightSquareBracket) {
        labelEnd = index
        index++
        break
      }

      index++
    }

    if (labelEnd === undefined || labelStart === labelEnd) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    label = value.slice(labelStart, labelEnd)

    return eat(value.slice(0, index))({
      type: 'footnoteReference',
      identifier: label.toLowerCase(),
      label: label
    })
  }

  // Parse an inline note / footnote, such as `^[text]`
  function footnote(eat, /** @type {StringView} */ value, silent) {
    var self = this
    /** @type {number} */ var length = value.length + 1
    /** @type {number} */ var index = 0
    /** @type {number} */ var balance = 0
    /** @type {RemarkPoint} */ var now
    /** @type {number} */ var code
    /** @type {number} */ var contentStart
    /** @type {number | undefined} */ var contentEnd
    /** @type {number} */ var fenceStart
    /** @type {number | undefined} */ var fenceOpenSize
    /** @type {number | undefined} */ var fenceCloseSize

    if (value.charCodeAt(index++) !== caret) return
    if (value.charCodeAt(index++) !== leftSquareBracket) return

    contentStart = index

    while (index < length) {
      code = value.charCodeAt(index)

      // EOF:
      if (code !== code) {
        return
      }

      // If we’re not in code:
      if (fenceOpenSize === undefined) {
        if (code === backslash) {
          index += 2
        } else if (code === leftSquareBracket) {
          balance++
          index++
        } else if (code === rightSquareBracket) {
          if (balance === 0) {
            contentEnd = index
            index++
            break
          } else {
            balance--
            index++
          }
        } else if (code === graveAccent) {
          fenceStart = index
          fenceOpenSize = 1

          while (value.charCodeAt(fenceStart + fenceOpenSize) === graveAccent) {
            fenceOpenSize++
          }

          index += fenceOpenSize
        } else {
          index++
        }
      }
      // We’re in code:
      else {
        if (code === graveAccent) {
          fenceStart = index
          fenceCloseSize = 1

          while (
            value.charCodeAt(fenceStart + fenceCloseSize) === graveAccent
          ) {
            fenceCloseSize++
          }

          index += fenceCloseSize

          // Found it, we’re no longer in code!
          if (fenceOpenSize === fenceCloseSize) {
            fenceOpenSize = undefined
          }

          fenceCloseSize = undefined
        } else {
          index++
        }
      }
    }

    if (contentEnd === undefined) {
      return
    }

    /* istanbul ignore if - never used (yet) */
    if (silent) {
      return true
    }

    now = eat.now()
    now.column += 2
    now.offset += 2

    return eat(value.slice(0, index))({
      type: 'footnote',
      children: self.tokenizeInline(value.slice(contentStart, contentEnd), now)
    })
  }

  // Do not allow `![^` or `[^` as a normal reference, do pass all other values
  // through.
  function reference(eat, /** @type {StringView} */ value, silent) {
    /** @type {number} */ var index = 0
    if (value.charCodeAt(index) === exclamationMark) index++
    if (value.charCodeAt(index) !== leftSquareBracket) return
    if (value.charCodeAt(index + 1) === caret) return
    return originalReference.call(this, eat, value, silent)
  }

  // Do not allow `[^` as a normal definition, do pass all other values through.
  function definition(eat, /** @type {StringView} */ value, /** @type {boolean | undefined} */ silent) {
    /** @type {number} */ var index = 0
    /** @type {number} */ var code = value.charCodeAt(index)
    while (code === space || code === tab) code = value.charCodeAt(++index)
    if (code !== leftSquareBracket) return
    if (value.charCodeAt(index + 1) === caret) return
    return originalDefinition.call(this, eat, value, silent)
  }

  /** @returns {number} */ function locateFootnoteCall(/** @type {string} */ value, /** @type {number} */ from) {
    return value.indexOf('[', from)
  }

  function locateFootnote(value, from) {
    return value.indexOf('^[', from)
  }
}

function attachCompiler(compiler) {
  var serializers = compiler.prototype.visitors
  var indent = '    '

  serializers.footnote = footnote
  serializers.footnoteReference = footnoteReference
  serializers.footnoteDefinition = footnoteDefinition

  function footnote(node) {
    return '^[' + this.all(node).join('') + ']'
  }

  function footnoteReference(node) {
    return '[^' + (node.label || node.identifier) + ']'
  }

  function footnoteDefinition(node) {
    var lines = this.all(node).join('\n\n').split('\n')
    var index = 0
    var length = lines.length
    var line

    // Indent each line, except the first, that is not empty.
    while (++index < length) {
      line = lines[index]
      if (line === '') continue
      lines[index] = indent + line
    }

    return '[^' + (node.label || node.identifier) + ']: ' + lines.join('\n')
  }
}

function before(/** @type {any[]} */ list, /** @type {string} */ before, /** @type {string} */ value) {
  list.splice(list.indexOf(before), 0, value)
}

// Mimics <https://github.com/remarkjs/remark/blob/b4c993e/packages/remark-parse/lib/util/interrupt.js>,
// but simplified for our needs.
/** @returns {boolean} */ function interrupt(/** @type {any[]} */ list, tokenizers, ctx, /** @type {any[]} */ parameters) {
  /** @type {number} */ var length = list.length
  /** @type {number} */ var index = -1

  while (++index < length) {
    if (tokenizers[list[index][0]].apply(ctx, parameters)) {
      return true
    }
  }

  return false
}

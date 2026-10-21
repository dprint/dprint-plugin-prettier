// @nts-check
'use strict'

var xtend = require('xtend')
var toggle = require('state-toggle')
var vfileLocation = require('vfile-location')
var unescape = require('./unescape')
var decode = require('./decode')
var tokenizer = require('./tokenizer')

module.exports = Parser

/**
 * What the tokenizers are called on: the file that is parsed, the indentation of the lines in nodes that are
 * indented, the options, where in the document the tokenizers are, and what tokenizes, decodes and unescapes
 * @typedef {{
 *   file: any,
 *   offset: Record<string, number>,
 *   options: RemarkOptions,
 *   escape: any[],
 *   inList: boolean,
 *   inBlock: boolean,
 *   inLink: boolean,
 *   atStart: boolean,
 *   eof?: any,
 *   toOffset: (position: any) => number,
 *   unescape: (value: string) => string,
 *   decode: any,
 *   setOptions(options: any): RemarkParser,
 *   parse(): any,
 *   exitStart(): () => void,
 *   enterList(): () => void,
 *   enterLink(): () => void,
 *   enterBlock(): () => void,
 *   interruptParagraph: any[],
 *   interruptList: any[],
 *   interruptBlockquote: any[],
 *   blockTokenizers: Record<string, any>,
 *   inlineTokenizers: Record<string, any>,
 *   blockMethods: any[],
 *   inlineMethods: any[],
 *   tokenizeBlock(value: string, location: any): any[],
 *   tokenizeInline(value: string, location: any): any[],
 *   tokenizeFactory: typeof tokenizer,
 * }} RemarkParser
 * The options of the parser, which are booleans apart from the names of the elements of HTML blocks
 * @typedef {{ position: boolean, gfm: boolean, commonmark: boolean, pedantic: boolean, blocks: any[] }} RemarkOptions
 */
function Parser(/** @type {string} */ doc, file) {
  this.file = file
  this.offset = {}
  this.options = xtend(this.options)
  this.setOptions({})

  this.inList = false
  this.inBlock = false
  this.inLink = false
  this.atStart = true

  this.toOffset = vfileLocation(file).toOffset
  this.unescape = unescape(this, 'escape')
  this.decode = decode(this)
}

var proto = Parser.prototype

// Expose core.
proto.setOptions = require('./set-options')
proto.parse = require('./parse')

// Expose `defaults`.
proto.options = require('./defaults')

// Enter and exit helpers.
proto.exitStart = toggle('atStart', true)
proto.enterList = toggle('inList', false)
proto.enterLink = toggle('inLink', false)
proto.enterBlock = toggle('inBlock', false)

// Nodes that can interupt a paragraph:
//
// ```markdown
// A paragraph, followed by a thematic break.
// ___
// ```
//
// In the above example, the thematic break “interupts” the paragraph.
proto.interruptParagraph = [
  ['thematicBreak'],
  ['list'],
  ['atxHeading'],
  ['fencedCode'],
  ['blockquote'],
  ['html'],
  ['setextHeading', {commonmark: false}],
  ['definition', {commonmark: false}]
]

// Nodes that can interupt a list:
//
// ```markdown
// - One
// ___
// ```
//
// In the above example, the thematic break “interupts” the list.
proto.interruptList = [
  ['atxHeading', {pedantic: false}],
  ['fencedCode', {pedantic: false}],
  ['thematicBreak', {pedantic: false}],
  ['definition', {commonmark: false}]
]

// Nodes that can interupt a blockquote:
//
// ```markdown
// > A paragraph.
// ___
// ```
//
// In the above example, the thematic break “interupts” the blockquote.
proto.interruptBlockquote = [
  ['indentedCode', {commonmark: true}],
  ['fencedCode', {commonmark: true}],
  ['atxHeading', {commonmark: true}],
  ['setextHeading', {commonmark: true}],
  ['thematicBreak', {commonmark: true}],
  ['html', {commonmark: true}],
  ['list', {commonmark: true}],
  ['definition', {commonmark: false}]
]

// Handlers.
proto.blockTokenizers = {
  blankLine: require('./tokenize/blank-line'),
  indentedCode: require('./tokenize/code-indented'),
  fencedCode: require('./tokenize/code-fenced'),
  blockquote: require('./tokenize/blockquote'),
  atxHeading: require('./tokenize/heading-atx'),
  thematicBreak: require('./tokenize/thematic-break'),
  list: require('./tokenize/list'),
  setextHeading: require('./tokenize/heading-setext'),
  html: require('./tokenize/html-block'),
  definition: require('./tokenize/definition'),
  table: require('./tokenize/table'),
  paragraph: require('./tokenize/paragraph')
}

proto.inlineTokenizers = {
  escape: require('./tokenize/escape'),
  autoLink: require('./tokenize/auto-link'),
  url: require('./tokenize/url'),
  email: require('./tokenize/email'),
  html: require('./tokenize/html-inline'),
  link: require('./tokenize/link'),
  reference: require('./tokenize/reference'),
  strong: require('./tokenize/strong'),
  emphasis: require('./tokenize/emphasis'),
  deletion: require('./tokenize/delete'),
  code: require('./tokenize/code-inline'),
  break: require('./tokenize/break'),
  text: require('./tokenize/text')
}

// Expose precedence.
proto.blockMethods = keys(proto.blockTokenizers)
proto.inlineMethods = keys(proto.inlineTokenizers)

// Tokenizers.
proto.tokenizeBlock = tokenizer('block')
proto.tokenizeInline = tokenizer('inline')
proto.tokenizeFactory = tokenizer

// Get all keys in `value`.
/** @returns {any[]} */ function keys(value) {
  var result = []
  var key

  for (key in value) {
    result.push(key)
  }

  return result
}

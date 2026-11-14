// @nts-check
/**
@import {GlimmerPendingNode, GlimmerPendingAttribute} from "glimmer-parser-types"
@import {JisonLexer, JisonLocation, JisonParser} from "handlebars-parser-types"
*/

/**
@typedef {{ line: number, column: number }} SourcePosition
@typedef {import("glimmer-parser-types").HbsPositions} HbsPositions
@typedef {import("glimmer-parser-types").CharPositions} CharPositions
*/

/**
 * What a visitor is to its methods: the nodes it is inside of, the one it is at, whether it puts back what its
 * methods give, and what whitespace control is told and has seen; the methods are found by the names of node types
 * @typedef {{
 *   parents: any[],
 *   current: any,
 *   mutating: boolean,
 *   options: any,
 *   isRootSeen: boolean,
 *   accept: (this: HbsVisitor, object: any) => any,
 *   acceptKey: (this: HbsVisitor, node: any, name: string | number) => void,
 *   acceptRequired: (this: HbsVisitor, node: any, name: string) => void,
 *   acceptArray: (this: HbsVisitor, array: any[]) => void,
 * }} HbsVisitor
 * A node of the tree that the parser's actions and helpers write out, as the visitors read it
 * @typedef {{
 *   type: string,
 *   body?: any[],
 *   blockParams?: any[],
 *   params?: any[],
 *   hash?: any,
 *   path?: any,
 *   program?: any,
 *   inverse?: any,
 *   name?: any,
 *   original?: any,
 *   pairs?: any[],
 *   key?: string,
 *   value?: any,
 *   parts?: any[],
 *   strip?: any,
 *   openStrip?: any,
 *   closeStrip?: any,
 *   inverseStrip?: any,
 *   chained?: boolean,
 *   escaped?: any,
 *   indent?: string,
 *   loc?: any,
 *   data?: boolean,
 *   head?: any,
 *   tail?: any[],
 *   items?: any[],
 *   open?: string,
 *   chain?: boolean,
 *   this?: boolean,
 *   depth?: number,
 *   partial?: boolean,
 *   decorator?: boolean,
 * }} HbsNode
 * A part of a path that the parser gives the helper that makes paths
 * @typedef {{ part: string, original: string, separator?: string }} HbsPathPart
 * What the printer of trees is to its methods: how far it indents
 * @typedef {{
 *   padding: number,
 *   pad: (this: HbsPrintVisitor, string: string) => string,
 *   accept: (this: HbsPrintVisitor, object: any) => string,
 *   callBody: (this: HbsPrintVisitor, mustache: HbsNode) => string,
 * }} HbsPrintVisitor
 */
/**
 * What a rule gives and where it is, which the parser's action is called on
 * @typedef {{ $: any, _$: JisonLocation }} JisonValue
 * What the parser's actions are given: handlebars' helpers, the location maker and the syntax of literals; the helpers
 * that use `this` say so, and are called on it
 * @typedef {{
 *   locInfo: (locInfo: JisonLocation) => any,
 *   stripFlags: typeof stripFlags,
 *   stripComment: typeof stripComment,
 *   id: typeof id,
 *   preparePath: typeof preparePath,
 *   prepareBlock: typeof prepareBlock,
 *   prepareProgram: typeof prepareProgram,
 *   prepareMustache: typeof prepareMustache,
 *   prepareRawBlock: typeof prepareRawBlock,
 *   preparePartialBlock: typeof preparePartialBlock,
 *   syntax: { square: ((array: any, loc: any) => any) | string, hash: (hash: any, loc: any) => any },
 *   parseError?: any,
 *   lexer?: any,
 *   parser?: any,
 * }} JisonShared
 */
/**
 * What simple-html-tokenizer tells of what it finds, which is the only object that the program gives it
 * @typedef {TokenizerEventHandlers} GlimmerTokenizerDelegate
 */
const Char = {
  NBSP: 0xa0,
  QUOT: 0x22,
  LT: 0x3c,
  GT: 0x3e,
  AMP: 0x26
};

// \x26 is ampersand, \xa0 is non-breaking space
const ATTR_VALUE_REGEX_TEST = /["\x26\xa0]/u;
const ATTR_VALUE_REGEX_REPLACE = new RegExp(ATTR_VALUE_REGEX_TEST.source, 'gu');
const TEXT_REGEX_TEST = /[&<>\xa0]/u;
const TEXT_REGEX_REPLACE = new RegExp(TEXT_REGEX_TEST.source, 'gu');
function attrValueReplacer(char) {
  switch (char.charCodeAt(0)) {
    case Char.NBSP:
      return '&nbsp;';
    case Char.QUOT:
      return '&quot;';
    case Char.AMP:
      return '&amp;';
    default:
      return char;
  }
}
function textReplacer(char) {
  switch (char.charCodeAt(0)) {
    case Char.NBSP:
      return '&nbsp;';
    case Char.AMP:
      return '&amp;';
    case Char.LT:
      return '&lt;';
    case Char.GT:
      return '&gt;';
    default:
      return char;
  }
}
function escapeAttrValue(attrValue) {
  if (ATTR_VALUE_REGEX_TEST.test(attrValue)) {
    return attrValue.replace(ATTR_VALUE_REGEX_REPLACE, attrValueReplacer);
  }
  return attrValue;
}
function escapeText(text) {
  if (TEXT_REGEX_TEST.test(text)) {
    return text.replace(TEXT_REGEX_REPLACE, textReplacer);
  }
  return text;
}
/** @returns {number} */ function sortByLoc(/** @type {import("glimmer-ast-types").GlimmerNode} */ a, /** @type {import("glimmer-ast-types").GlimmerNode} */ b) {
  // If either is invisible, don't try to order them
  if (a.loc.isInvisible || b.loc.isInvisible) {
    return 0;
  }
  if (a.loc.startPosition.line < b.loc.startPosition.line) {
    return -1;
  }
  if (a.loc.startPosition.line === b.loc.startPosition.line && a.loc.startPosition.column < b.loc.startPosition.column) {
    return -1;
  }
  if (a.loc.startPosition.line === b.loc.startPosition.line && a.loc.startPosition.column === b.loc.startPosition.column) {
    return 0;
  }
  return 1;
}

const voidMap = new Set(['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
/** @returns {any[]} */ function getVoidTags() {
  return [...voidMap];
}
/** @type {RegExp} */ const NON_WHITESPACE = /^\S/u;
/**
 * Examples when true:
 *  - link
 *  - liNK
 *
 * Examples when false:
 *  - Link (component)
 */
function isVoidTag(tag) {
  return voidMap.has(tag.toLowerCase()) && tag[0]?.toLowerCase() === tag[0];
}
class Printer {
  buffer = '';
  options;
  constructor(options) {
    this.options = options;
  }

  /*
    This is used by _all_ methods on this Printer class that add to `this.buffer`,
    it allows consumers of the printer to use alternate string representations for
    a given node.
     The primary use case for this are things like source -> source codemod utilities.
    For example, ember-template-recast attempts to always preserve the original string
    formatting in each AST node if no modifications are made to it.
  */
  handledByOverride(node, ensureLeadingWhitespace = false) {
    if (this.options.override !== undefined) {
      let result = this.options.override(node, this.options);
      if (typeof result === 'string') {
        if (ensureLeadingWhitespace && NON_WHITESPACE.test(result)) {
          result = ` ${result}`;
        }
        this.buffer += result;
        return true;
      }
    }
    return false;
  }
  Node(node) {
    switch (node.type) {
      case 'MustacheStatement':
      case 'BlockStatement':
      case 'MustacheCommentStatement':
      case 'CommentStatement':
      case 'TextNode':
      case 'ElementNode':
      case 'AttrNode':
      case 'Block':
      case 'Template':
        return this.TopLevelStatement(node);
      case 'StringLiteral':
      case 'BooleanLiteral':
      case 'NumberLiteral':
      case 'UndefinedLiteral':
      case 'NullLiteral':
      case 'PathExpression':
      case 'SubExpression':
        return this.Expression(node);
      case 'ConcatStatement':
        // should have an AttrNode parent
        return this.ConcatStatement(node);
      case 'Hash':
        return this.Hash(node);
      case 'HashPair':
        return this.HashPair(node);
      case 'ElementModifierStatement':
        return this.ElementModifierStatement(node);
    }
  }
  Expression(expression) {
    switch (expression.type) {
      case 'StringLiteral':
      case 'BooleanLiteral':
      case 'NumberLiteral':
      case 'UndefinedLiteral':
      case 'NullLiteral':
        return this.Literal(expression);
      case 'PathExpression':
        return this.PathExpression(expression);
      case 'SubExpression':
        return this.SubExpression(expression);
    }
  }
  Literal(literal) {
    switch (literal.type) {
      case 'StringLiteral':
        return this.StringLiteral(literal);
      case 'BooleanLiteral':
        return this.BooleanLiteral(literal);
      case 'NumberLiteral':
        return this.NumberLiteral(literal);
      case 'UndefinedLiteral':
        return this.UndefinedLiteral(literal);
      case 'NullLiteral':
        return this.NullLiteral(literal);
    }
  }
  TopLevelStatement(statement) {
    switch (statement.type) {
      case 'MustacheStatement':
        return this.MustacheStatement(statement);
      case 'BlockStatement':
        return this.BlockStatement(statement);
      case 'MustacheCommentStatement':
        return this.MustacheCommentStatement(statement);
      case 'CommentStatement':
        return this.CommentStatement(statement);
      case 'TextNode':
        return this.TextNode(statement);
      case 'ElementNode':
        return this.ElementNode(statement);
      case 'Block':
        return this.Block(statement);
      case 'Template':
        return this.Template(statement);
      case 'AttrNode':
        // should have element
        return this.AttrNode(statement);
    }
  }
  Template(template) {
    this.TopLevelStatements(template.body);
  }
  Block(block) {
    /*
      When processing a template like:
       ```hbs
      {{#if whatever}}
        whatever
      {{else if somethingElse}}
        something else
      {{else}}
        fallback
      {{/if}}
      ```
       The AST still _effectively_ looks like:
       ```hbs
      {{#if whatever}}
        whatever
      {{else}}{{#if somethingElse}}
        something else
      {{else}}
        fallback
      {{/if}}{{/if}}
      ```
       The only way we can tell if that is the case is by checking for
      `block.chained`, but unfortunately when the actual statements are
      processed the `block.body[0]` node (which will always be a
      `BlockStatement`) has no clue that its ancestor `Block` node was
      chained.
       This "forwards" the `chained` setting so that we can check
      it later when processing the `BlockStatement`.
    */
    if (block.chained) {
      let firstChild = block.body[0];
      firstChild.chained = true;
    }
    if (this.handledByOverride(block)) {
      return;
    }
    this.TopLevelStatements(block.body);
  }
  TopLevelStatements(statements) {
    statements.forEach(statement => this.TopLevelStatement(statement));
  }
  ElementNode(el) {
    if (this.handledByOverride(el)) {
      return;
    }
    this.OpenElementNode(el);
    this.TopLevelStatements(el.children);
    this.CloseElementNode(el);
  }
  OpenElementNode(el) {
    this.buffer += `<${el.tag}`;
    const parts = [...el.attributes, ...el.modifiers, ...el.comments].sort(sortByLoc);
    for (const part of parts) {
      this.buffer += ' ';
      switch (part.type) {
        case 'AttrNode':
          this.AttrNode(part);
          break;
        case 'ElementModifierStatement':
          this.ElementModifierStatement(part);
          break;
        case 'MustacheCommentStatement':
          this.MustacheCommentStatement(part);
          break;
      }
    }
    if (el.blockParams.length) {
      this.BlockParams(el.blockParams);
    }
    if (el.selfClosing) {
      this.buffer += ' /';
    }
    this.buffer += '>';
  }
  CloseElementNode(el) {
    if (el.selfClosing || isVoidTag(el.tag)) {
      return;
    }
    this.buffer += `</${el.tag}>`;
  }
  AttrNode(attr) {
    if (this.handledByOverride(attr)) {
      return;
    }
    let {
      name,
      value
    } = attr;
    this.buffer += name;
    const isAttribute = !name.startsWith('@');
    const shouldElideValue = isAttribute && value.type == 'TextNode' && value.chars.length === 0;
    if (!shouldElideValue) {
      this.buffer += '=';
      this.AttrNodeValue(value);
    }
  }
  AttrNodeValue(value) {
    if (value.type === 'TextNode') {
      let quote = '"';
      if (this.options.entityEncoding === 'raw') {
        if (value.chars.includes('"') && !value.chars.includes("'")) {
          quote = "'";
        }
      }
      this.buffer += quote;
      this.TextNode(value, quote);
      this.buffer += quote;
    } else {
      this.Node(value);
    }
  }
  TextNode(text, isInAttr) {
    if (this.handledByOverride(text)) {
      return;
    }
    if (this.options.entityEncoding === 'raw') {
      if (isInAttr && text.chars.includes(isInAttr)) {
        this.buffer += escapeAttrValue(text.chars);
      } else {
        this.buffer += text.chars;
      }
    } else if (isInAttr) {
      this.buffer += escapeAttrValue(text.chars);
    } else {
      this.buffer += escapeText(text.chars);
    }
  }
  MustacheStatement(mustache) {
    if (this.handledByOverride(mustache)) {
      return;
    }
    this.buffer += mustache.trusting ? '{{{' : '{{';
    if (mustache.strip.open) {
      this.buffer += '~';
    }
    this.Expression(mustache.path);
    this.Params(mustache.params);
    this.Hash(mustache.hash);
    if (mustache.strip.close) {
      this.buffer += '~';
    }
    this.buffer += mustache.trusting ? '}}}' : '}}';
  }
  BlockStatement(block) {
    if (this.handledByOverride(block)) {
      return;
    }
    if (block.chained) {
      this.buffer += block.inverseStrip.open ? '{{~' : '{{';
      this.buffer += 'else ';
    } else {
      this.buffer += block.openStrip.open ? '{{~#' : '{{#';
    }
    this.Expression(block.path);
    this.Params(block.params);
    this.Hash(block.hash);
    if (block.program.blockParams.length) {
      this.BlockParams(block.program.blockParams);
    }
    if (block.chained) {
      this.buffer += block.inverseStrip.close ? '~}}' : '}}';
    } else {
      this.buffer += block.openStrip.close ? '~}}' : '}}';
    }
    this.Block(block.program);
    if (block.inverse) {
      if (!block.inverse.chained) {
        this.buffer += block.inverseStrip.open ? '{{~' : '{{';
        this.buffer += 'else';
        this.buffer += block.inverseStrip.close ? '~}}' : '}}';
      }
      this.Block(block.inverse);
    }
    if (!block.chained) {
      this.buffer += block.closeStrip.open ? '{{~/' : '{{/';
      this.Expression(block.path);
      this.buffer += block.closeStrip.close ? '~}}' : '}}';
    }
  }
  BlockParams(blockParams) {
    this.buffer += ` as |${blockParams.join(' ')}|`;
  }
  ConcatStatement(concat) {
    if (this.handledByOverride(concat)) {
      return;
    }
    this.buffer += '"';
    concat.parts.forEach(part => {
      if (part.type === 'TextNode') {
        this.TextNode(part, '"');
      } else {
        this.Node(part);
      }
    });
    this.buffer += '"';
  }
  MustacheCommentStatement(comment) {
    if (this.handledByOverride(comment)) {
      return;
    }
    this.buffer += `{{!--${comment.value}--}}`;
  }
  ElementModifierStatement(mod) {
    if (this.handledByOverride(mod)) {
      return;
    }
    this.buffer += '{{';
    this.Expression(mod.path);
    this.Params(mod.params);
    this.Hash(mod.hash);
    this.buffer += '}}';
  }
  CommentStatement(comment) {
    if (this.handledByOverride(comment)) {
      return;
    }
    this.buffer += `<!--${comment.value}-->`;
  }
  PathExpression(path) {
    if (this.handledByOverride(path)) {
      return;
    }
    this.buffer += path.original;
  }
  SubExpression(sexp) {
    if (this.handledByOverride(sexp)) {
      return;
    }
    this.buffer += '(';
    this.Expression(sexp.path);
    this.Params(sexp.params);
    this.Hash(sexp.hash);
    this.buffer += ')';
  }
  Params(params) {
    // TODO: implement a top level Params AST node (just like the Hash object)
    // so that this can also be overridden
    if (params.length) {
      params.forEach(param => {
        this.buffer += ' ';
        this.Expression(param);
      });
    }
  }
  Hash(hash) {
    if (this.handledByOverride(hash, true)) {
      return;
    }
    hash.pairs.forEach(pair => {
      this.buffer += ' ';
      this.HashPair(pair);
    });
  }
  HashPair(pair) {
    if (this.handledByOverride(pair)) {
      return;
    }
    this.buffer += pair.key;
    this.buffer += '=';
    this.Node(pair.value);
  }
  StringLiteral(str) {
    if (this.handledByOverride(str)) {
      return;
    }
    this.buffer += JSON.stringify(str.value);
  }
  BooleanLiteral(bool) {
    if (this.handledByOverride(bool)) {
      return;
    }
    this.buffer += String(bool.value);
  }
  NumberLiteral(number) {
    if (this.handledByOverride(number)) {
      return;
    }
    this.buffer += String(number.value);
  }
  UndefinedLiteral(node) {
    if (this.handledByOverride(node)) {
      return;
    }
    this.buffer += 'undefined';
  }
  NullLiteral(node) {
    if (this.handledByOverride(node)) {
      return;
    }
    this.buffer += 'null';
  }
  print(node) {
    let {
      options
    } = this;
    if (options.override) {
      let result = options.override(node, options);
      if (result !== undefined) {
        return result;
      }
    }
    this.buffer = '';
    this.Node(node);
    return this.buffer;
  }
}

/** @returns {string} */ function build(/** @type {import("glimmer-ast-types").GlimmerNode} */ ast, options = {
  entityEncoding: 'transformed'
}) {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- JS users
  if (!ast) {
    return '';
  }
  let printer = new Printer(options);
  return printer.print(ast);
}

function isKeyword(word, type) {
  if (word in KEYWORDS_TYPES) {
    if (type === undefined) {
      return true;
    } else {
      let types = KEYWORDS_TYPES[word];
      // This seems like a TypeScript bug – it inferred types as never[]?
      return types.includes(type);
    }
  } else {
    return false;
  }
}

/**
 * This includes the full list of keywords currently in use in the template
 * language, and where their valid usages are.
 */
const KEYWORDS_TYPES = {
  component: ['Call', 'Append', 'Block'],
  debugger: ['Append'],
  'each-in': ['Block'],
  each: ['Block'],
  'has-block-params': ['Call', 'Append'],
  'has-block': ['Call', 'Append'],
  helper: ['Call', 'Append'],
  if: ['Call', 'Append', 'Block'],
  'in-element': ['Block'],
  let: ['Block'],
  log: ['Call', 'Append'],
  modifier: ['Call', 'Modifier'],
  mount: ['Append'],
  mut: ['Call', 'Append'],
  outlet: ['Append'],
  readonly: ['Call', 'Append'],
  unbound: ['Call', 'Append'],
  unless: ['Call', 'Append', 'Block'],
  yield: ['Append']
};

/** @returns {boolean} */ function isPresentArray(/** @type {any[]} */ list) {
  return list ? list.length > 0 : false;
}
function asPresentArray(list, message = `unexpected empty list`) {
  return list;
}
function getLast(/** @type {any[]} */ list) {
  return list.length === 0 ? undefined : list[list.length - 1];
}
function getFirst(list) {
  return list.length === 0 ? undefined : list[0];
}

// import Logger from './logger';

function assert(test, msg) {
}

const assign = Object.assign;

const errorProps = ['description', 'fileName', 'lineNumber', 'endLineNumber', 'message', 'name', 'number', 'stack'];
function Exception(message, node) {
  let loc = node && node.loc,
    line,
    endLineNumber,
    column,
    endColumn;
  if (loc) {
    line = loc.start.line;
    endLineNumber = loc.end.line;
    column = loc.start.column;
    endColumn = loc.end.column;
    message += ' - ' + line + ':' + column;
  }
  let tmp = Error.prototype.constructor.call(this, message);

  // Unfortunately errors are not enumerable in Chrome (at least), so `for prop in tmp` doesn't work.
  for (let idx = 0; idx < errorProps.length; idx++) {
    this[errorProps[idx]] = tmp[errorProps[idx]];
  }

  /* istanbul ignore else */
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, Exception);
  }
  try {
    if (loc) {
      this.lineNumber = line;
      this.endLineNumber = endLineNumber;

      // Work around issue under safari where we can't directly set the column value
      /* istanbul ignore next */
      if (Object.defineProperty) {
        Object.defineProperty(this, 'column', {
          value: column,
          enumerable: true
        });
        Object.defineProperty(this, 'endColumn', {
          value: endColumn,
          enumerable: true
        });
      } else {
        this.column = column;
        this.endColumn = endColumn;
      }
    }
  } catch (nop) {
    /* Ignore if the browser is very particular */
  }
}
Exception.prototype = new Error();

function Visitor() {
  this.parents = [];
}
Visitor.prototype = {
  constructor: Visitor,
  mutating: false,
  // Visits a given value. If mutating, will replace the value if necessary.
  acceptKey: /** @this {HbsVisitor} */ function (/** @type {any} */ node, /** @type {string | number} */ name) {
    let value = this.accept(node[name]);
    if (this.mutating) {
      // Hacky sanity check: This may have a few false positives for type for the helper
      // methods but will generally do the right thing without a lot of overhead.
      if (value && !Visitor.prototype[value.type]) {
        throw new Exception('Unexpected node type "' + value.type + '" found when accepting ' + name + ' on ' + node.type);
      }
      node[name] = value;
    }
  },
  // Performs an accept operation with added sanity check to ensure
  // required keys are not removed.
  acceptRequired: /** @this {HbsVisitor} */ function (/** @type {HbsNode} */ node, /** @type {string} */ name) {
    this.acceptKey(node, name);
    if (!node[name]) {
      throw new Exception(node.type + ' requires ' + name);
    }
  },
  // Traverses a given array. If mutating, empty responses will be removed
  // for child elements.
  acceptArray: /** @this {HbsVisitor} */ function (/** @type {any[]} */ array) {
    for (let i = 0, l = array.length; i < l; i++) {
      this.acceptKey(array, i);
      if (!array[i]) {
        array.splice(i, 1);
        i--;
        l--;
      }
    }
  },
  accept: /** @this {HbsVisitor} */ function (/** @type {HbsNode | undefined} */ object) {
    if (!object) {
      return;
    }

    /* istanbul ignore next: Sanity code */
    if (!this[object.type]) {
      throw new Exception('Unknown type: ' + object.type, object);
    }
    if (this.current) {
      this.parents.unshift(this.current);
    }
    this.current = object;
    let ret = this[object.type](object);
    this.current = this.parents.shift();
    if (!this.mutating || ret) {
      return ret;
    } else if (ret !== false) {
      return object;
    }
  },
  Program: /** @this {HbsVisitor} */ function (/** @type {HbsNode} */ program) {
    this.acceptArray(program.body);
  },
  MustacheStatement: visitSubExpression,
  Decorator: visitSubExpression,
  BlockStatement: visitBlock,
  DecoratorBlock: visitBlock,
  PartialStatement: visitPartial,
  PartialBlockStatement: /** @this {HbsVisitor} */ function (/** @type {HbsNode} */ partial) {
    visitPartial.call(this, partial);
    this.acceptKey(partial, 'program');
  },
  ContentStatement: function /* content */ () {},
  CommentStatement: function /* comment */ () {},
  SubExpression: visitSubExpression,
  PathExpression: function /* path */ () {},
  StringLiteral: function /* string */ () {},
  NumberLiteral: function /* number */ () {},
  BooleanLiteral: function /* bool */ () {},
  UndefinedLiteral: function /* literal */ () {},
  NullLiteral: function /* literal */ () {},
  Hash: /** @this {HbsVisitor} */ function (/** @type {HbsNode} */ hash) {
    this.acceptArray(hash.pairs);
  },
  HashPair: /** @this {HbsVisitor} */ function (/** @type {HbsNode} */ pair) {
    this.acceptRequired(pair, 'value');
  }
};
/** @this {HbsVisitor} */ function visitSubExpression(mustache) {
  this.acceptRequired(mustache, 'path');
  this.acceptArray(mustache.params);
  this.acceptKey(mustache, 'hash');
}
/** @this {HbsVisitor} */ function visitBlock(block) {
  visitSubExpression.call(this, block);
  this.acceptKey(block, 'program');
  this.acceptKey(block, 'inverse');
}
/** @this {HbsVisitor} */ function visitPartial(partial) {
  this.acceptRequired(partial, 'name');
  this.acceptArray(partial.params);
  this.acceptKey(partial, 'hash');
}

function WhitespaceControl(options = {}) {
  this.options = options;
}
WhitespaceControl.prototype = new Visitor();
WhitespaceControl.prototype.Program = /** @this {HbsVisitor} */ function (/** @type {HbsNode} */ program) {
  const doStandalone = !this.options.ignoreStandalone;
  let isRoot = !this.isRootSeen;
  this.isRootSeen = true;
  let body = program.body;
  for (let i = 0, l = body.length; i < l; i++) {
    let current = body[i],
      strip = this.accept(current);
    if (!strip) {
      continue;
    }
    let _isPrevWhitespace = isPrevWhitespace(body, i, isRoot),
      _isNextWhitespace = isNextWhitespace(body, i, isRoot),
      openStandalone = strip.openStandalone && _isPrevWhitespace,
      closeStandalone = strip.closeStandalone && _isNextWhitespace,
      inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;
    if (strip.close) {
      omitRight(body, i, true);
    }
    if (strip.open) {
      omitLeft(body, i, true);
    }
    if (doStandalone && inlineStandalone) {
      omitRight(body, i);
      if (omitLeft(body, i)) {
        // If we are on a standalone node, save the indent info for partials
        if (current.type === 'PartialStatement') {
          // Pull out the whitespace from the final line
          current.indent = /([ \t]+$)/.exec(body[i - 1].original)[1];
        }
      }
    }
    if (doStandalone && openStandalone) {
      omitRight((current.program || current.inverse).body);

      // Strip out the previous content node if it's whitespace only
      omitLeft(body, i);
    }
    if (doStandalone && closeStandalone) {
      // Always strip the next node
      omitRight(body, i);
      omitLeft((current.inverse || current.program).body);
    }
  }
  return program;
};
WhitespaceControl.prototype.BlockStatement = WhitespaceControl.prototype.DecoratorBlock = WhitespaceControl.prototype.PartialBlockStatement = /** @this {HbsVisitor} */ function (/** @type {HbsNode} */ block) {
  this.accept(block.program);
  this.accept(block.inverse);

  // Find the inverse program that is involved with whitespace stripping.
  let program = block.program || block.inverse,
    inverse = block.program && block.inverse,
    firstInverse = inverse,
    lastInverse = inverse;
  if (inverse && inverse.chained) {
    firstInverse = inverse.body[0].program;

    // Walk the inverse chain to find the last inverse that is actually in the chain.
    while (lastInverse.chained) {
      lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
    }
  }
  let strip = {
    open: block.openStrip.open,
    close: block.closeStrip.close,
    // Determine the standalone candidacy. Basically flag our content as being possibly standalone
    // so our parent can determine if we actually are standalone
    openStandalone: isNextWhitespace(program.body),
    closeStandalone: isPrevWhitespace((firstInverse || program).body)
  };
  if (block.openStrip.close) {
    omitRight(program.body, null, true);
  }
  if (inverse) {
    let inverseStrip = block.inverseStrip;
    if (inverseStrip.open) {
      omitLeft(program.body, null, true);
    }
    if (inverseStrip.close) {
      omitRight(firstInverse.body, null, true);
    }
    if (block.closeStrip.open) {
      omitLeft(lastInverse.body, null, true);
    }

    // Find standalone else statements
    if (!this.options.ignoreStandalone && isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
      omitLeft(program.body);
      omitRight(firstInverse.body);
    }
  } else if (block.closeStrip.open) {
    omitLeft(program.body, null, true);
  }
  return strip;
};
WhitespaceControl.prototype.Decorator = WhitespaceControl.prototype.MustacheStatement = /** @this {HbsVisitor} */ function (/** @type {HbsNode} */ mustache) {
  return mustache.strip;
};
WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = /** @this {HbsVisitor} */ function (/** @type {HbsNode} */ node) {
  /* istanbul ignore next */
  let strip = node.strip || {};
  return {
    inlineStandalone: true,
    open: strip.open,
    close: strip.close
  };
};
function isPrevWhitespace(body, i, isRoot) {
  if (i === undefined) {
    i = body.length;
  }

  // Nodes that end with newlines are considered whitespace (but are special
  // cased for strip operations)
  let prev = body[i - 1],
    sibling = body[i - 2];
  if (!prev) {
    return isRoot;
  }
  if (prev.type === 'ContentStatement') {
    return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
  }
}
function isNextWhitespace(body, i, isRoot) {
  if (i === undefined) {
    i = -1;
  }
  let next = body[i + 1],
    sibling = body[i + 2];
  if (!next) {
    return isRoot;
  }
  if (next.type === 'ContentStatement') {
    return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
  }
}

// Marks the node to the right of the position as omitted.
// I.e. {{foo}}' ' will mark the ' ' node as omitted.
//
// If i is undefined, then the first child will be marked as such.
//
// If multiple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitRight(body, i, multiple) {
  let current = body[i == null ? 0 : i + 1];
  if (!current || current.type !== 'ContentStatement' || !multiple && current.rightStripped) {
    return;
  }
  let original = current.value;
  current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, '');
  current.rightStripped = current.value !== original;
}

// Marks the node to the left of the position as omitted.
// I.e. ' '{{foo}} will mark the ' ' node as omitted.
//
// If i is undefined then the last child will be marked as such.
//
// If multiple is truthy then all whitespace will be stripped out until non-whitespace
// content is met.
function omitLeft(body, i, multiple) {
  let current = body[i == null ? body.length - 1 : i - 1];
  if (!current || current.type !== 'ContentStatement' || !multiple && current.leftStripped) {
    return;
  }

  // We omit the last node if it's whitespace only and not preceded by a non-content node.
  let original = current.value;
  current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, '');
  current.leftStripped = current.value !== original;
  return current.leftStripped;
}

// @ts-nocheck
/* parser generated by jison 0.4.18 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
/** @type {JisonParser} */
var parser = (/** @returns {JisonParser} */ function () {
  var o = function (k, v, o, l) {
      for (o = o || {}, l = k.length; l--; o[k[l]] = v);
      return o;
    },
    $V0 = [2, 52],
    $V1 = [1, 20],
    $V2 = [5, 14, 15, 19, 29, 34, 39, 44, 47, 48, 53, 57, 61],
    $V3 = [1, 44],
    $V4 = [1, 40],
    $V5 = [1, 43],
    $V6 = [1, 33],
    $V7 = [1, 34],
    $V8 = [1, 35],
    $V9 = [1, 36],
    $Va = [1, 37],
    $Vb = [1, 42],
    $Vc = [1, 46],
    $Vd = [14, 15, 19, 29, 34, 39, 44, 47, 48, 53, 57, 61],
    $Ve = [14, 15, 19, 29, 34, 44, 47, 48, 53, 57, 61],
    $Vf = [15, 18],
    $Vg = [14, 15, 19, 29, 34, 47, 48, 53, 57, 61],
    $Vh = [33, 67, 73, 75, 84, 85, 86, 87, 88, 89],
    $Vi = [23, 33, 56, 67, 68, 73, 75, 77, 79, 84, 85, 86, 87, 88, 89],
    $Vj = [1, 62],
    $Vk = [1, 63],
    $Vl = [23, 33, 56, 68, 73, 79],
    $Vm = [23, 33, 56, 67, 68, 73, 75, 77, 79, 84, 85, 86, 87, 88, 89, 92, 93],
    $Vn = [2, 51],
    $Vo = [1, 64],
    $Vp = [67, 73, 75, 77, 84, 85, 86, 87, 88, 89],
    $Vq = [56, 67, 73, 75, 84, 85, 86, 87, 88, 89],
    $Vr = [1, 75],
    $Vs = [1, 76],
    $Vt = [1, 83],
    $Vu = [33, 67, 73, 75, 79, 84, 85, 86, 87, 88, 89],
    $Vv = [23, 67, 73, 75, 84, 85, 86, 87, 88, 89],
    $Vw = [67, 68, 73, 75, 84, 85, 86, 87, 88, 89],
    $Vx = [33, 79],
    $Vy = [1, 134],
    $Vz = [73, 81];
  var parser = /** @type {JisonParser} */ ({
    trace: function trace() {},
    yy: {},
    symbols_: {
      error: 2,
      root: 3,
      program: 4,
      EOF: 5,
      program_repetition0: 6,
      statement: 7,
      mustache: 8,
      block: 9,
      rawBlock: 10,
      partial: 11,
      partialBlock: 12,
      content: 13,
      COMMENT: 14,
      CONTENT: 15,
      openRawBlock: 16,
      rawBlock_repetition0: 17,
      END_RAW_BLOCK: 18,
      OPEN_RAW_BLOCK: 19,
      helperName: 20,
      openRawBlock_repetition0: 21,
      openRawBlock_option0: 22,
      CLOSE_RAW_BLOCK: 23,
      openBlock: 24,
      block_option0: 25,
      closeBlock: 26,
      openInverse: 27,
      block_option1: 28,
      OPEN_BLOCK: 29,
      openBlock_repetition0: 30,
      openBlock_option0: 31,
      openBlock_option1: 32,
      CLOSE: 33,
      OPEN_INVERSE: 34,
      openInverse_repetition0: 35,
      openInverse_option0: 36,
      openInverse_option1: 37,
      openInverseChain: 38,
      OPEN_INVERSE_CHAIN: 39,
      openInverseChain_repetition0: 40,
      openInverseChain_option0: 41,
      openInverseChain_option1: 42,
      inverseAndProgram: 43,
      INVERSE: 44,
      inverseChain: 45,
      inverseChain_option0: 46,
      OPEN_ENDBLOCK: 47,
      OPEN: 48,
      hash: 49,
      expr: 50,
      mustache_repetition0: 51,
      mustache_option0: 52,
      OPEN_UNESCAPED: 53,
      mustache_repetition1: 54,
      mustache_option1: 55,
      CLOSE_UNESCAPED: 56,
      OPEN_PARTIAL: 57,
      partial_repetition0: 58,
      partial_option0: 59,
      openPartialBlock: 60,
      OPEN_PARTIAL_BLOCK: 61,
      openPartialBlock_repetition0: 62,
      openPartialBlock_option0: 63,
      exprHead: 64,
      arrayLiteral: 65,
      sexpr: 66,
      OPEN_SEXPR: 67,
      CLOSE_SEXPR: 68,
      sexpr_repetition0: 69,
      sexpr_option0: 70,
      hash_repetition_plus0: 71,
      hashSegment: 72,
      ID: 73,
      EQUALS: 74,
      OPEN_ARRAY: 75,
      arrayLiteral_repetition0: 76,
      CLOSE_ARRAY: 77,
      blockParams: 78,
      OPEN_BLOCK_PARAMS: 79,
      blockParams_repetition_plus0: 80,
      CLOSE_BLOCK_PARAMS: 81,
      path: 82,
      dataName: 83,
      STRING: 84,
      NUMBER: 85,
      BOOLEAN: 86,
      UNDEFINED: 87,
      NULL: 88,
      DATA: 89,
      pathSegments: 90,
      sep: 91,
      SEP: 92,
      PRIVATE_SEP: 93,
      $accept: 0,
      $end: 1
    },
    terminals_: {
      2: 'error',
      5: 'EOF',
      14: 'COMMENT',
      15: 'CONTENT',
      18: 'END_RAW_BLOCK',
      19: 'OPEN_RAW_BLOCK',
      23: 'CLOSE_RAW_BLOCK',
      29: 'OPEN_BLOCK',
      33: 'CLOSE',
      34: 'OPEN_INVERSE',
      39: 'OPEN_INVERSE_CHAIN',
      44: 'INVERSE',
      47: 'OPEN_ENDBLOCK',
      48: 'OPEN',
      53: 'OPEN_UNESCAPED',
      56: 'CLOSE_UNESCAPED',
      57: 'OPEN_PARTIAL',
      61: 'OPEN_PARTIAL_BLOCK',
      67: 'OPEN_SEXPR',
      68: 'CLOSE_SEXPR',
      73: 'ID',
      74: 'EQUALS',
      75: 'OPEN_ARRAY',
      77: 'CLOSE_ARRAY',
      79: 'OPEN_BLOCK_PARAMS',
      81: 'CLOSE_BLOCK_PARAMS',
      84: 'STRING',
      85: 'NUMBER',
      86: 'BOOLEAN',
      87: 'UNDEFINED',
      88: 'NULL',
      89: 'DATA',
      92: 'SEP',
      93: 'PRIVATE_SEP'
    },
    productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [13, 1], [10, 3], [16, 5], [9, 4], [9, 4], [24, 6], [27, 6], [38, 6], [43, 2], [45, 3], [45, 1], [26, 3], [8, 3], [8, 5], [8, 5], [11, 5], [12, 3], [60, 5], [50, 1], [50, 1], [64, 1], [64, 1], [66, 3], [66, 5], [49, 1], [72, 3], [65, 3], [78, 3], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [83, 2], [91, 1], [91, 1], [82, 3], [82, 1], [90, 3], [90, 1], [6, 0], [6, 2], [17, 0], [17, 2], [21, 0], [21, 2], [22, 0], [22, 1], [25, 0], [25, 1], [28, 0], [28, 1], [30, 0], [30, 2], [31, 0], [31, 1], [32, 0], [32, 1], [35, 0], [35, 2], [36, 0], [36, 1], [37, 0], [37, 1], [40, 0], [40, 2], [41, 0], [41, 1], [42, 0], [42, 1], [46, 0], [46, 1], [51, 0], [51, 2], [52, 0], [52, 1], [54, 0], [54, 2], [55, 0], [55, 1], [58, 0], [58, 2], [59, 0], [59, 1], [62, 0], [62, 2], [63, 0], [63, 1], [69, 0], [69, 2], [70, 0], [70, 1], [71, 1], [71, 2], [76, 0], [76, 2], [80, 1], [80, 2]],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
      /* this == yyval */

      /** @type {number} */ var $0 = $$.length - 1;
      switch (yystate) {
        case 1:
          return $$[$0 - 1];
        case 2:
          this.$ = yy.prepareProgram($$[$0]);
          break;
        case 3:
        case 4:
        case 5:
        case 6:
        case 7:
        case 8:
        case 20:
        case 28:
        case 29:
        case 30:
        case 31:
        case 38:
        case 39:
        case 46:
        case 47:
          this.$ = $$[$0];
          break;
        case 9:
          this.$ = {
            type: 'CommentStatement',
            value: yy.stripComment($$[$0]),
            strip: yy.stripFlags($$[$0], $$[$0]),
            loc: yy.locInfo(this._$)
          };
          break;
        case 10:
          this.$ = {
            type: 'ContentStatement',
            original: $$[$0],
            value: $$[$0],
            loc: yy.locInfo(this._$)
          };
          break;
        case 11:
          this.$ = yy.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
          break;
        case 12:
          this.$ = {
            path: $$[$0 - 3],
            params: $$[$0 - 2],
            hash: $$[$0 - 1]
          };
          break;
        case 13:
          this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
          break;
        case 14:
          this.$ = yy.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
          break;
        case 15:
          this.$ = {
            open: $$[$0 - 5],
            path: $$[$0 - 4],
            params: $$[$0 - 3],
            hash: $$[$0 - 2],
            blockParams: $$[$0 - 1],
            strip: yy.stripFlags($$[$0 - 5], $$[$0])
          };
          break;
        case 16:
        case 17:
          this.$ = {
            path: $$[$0 - 4],
            params: $$[$0 - 3],
            hash: $$[$0 - 2],
            blockParams: $$[$0 - 1],
            strip: yy.stripFlags($$[$0 - 5], $$[$0])
          };
          break;
        case 18:
          this.$ = {
            strip: yy.stripFlags($$[$0 - 1], $$[$0 - 1]),
            program: $$[$0]
          };
          break;
        case 19:
          var inverse = yy.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$),
            program = yy.prepareProgram([inverse], $$[$0 - 1].loc);
          program.chained = true;
          this.$ = {
            strip: $$[$0 - 2].strip,
            program: program,
            chain: true
          };
          break;
        case 21:
          this.$ = {
            path: $$[$0 - 1],
            strip: yy.stripFlags($$[$0 - 2], $$[$0])
          };
          break;
        case 22:
          this.$ = yy.prepareMustache(yy.syntax.hash($$[$0 - 1], yy.locInfo(this._$), {
            yy,
            syntax: 'expr'
          }), [], undefined, $$[$0 - 2], yy.stripFlags($$[$0 - 2], $$[$0]), this._$);
          break;
        case 23:
        case 24:
          this.$ = yy.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy.stripFlags($$[$0 - 4], $$[$0]), this._$);
          break;
        case 25:
          this.$ = {
            type: 'PartialStatement',
            name: $$[$0 - 3],
            params: $$[$0 - 2],
            hash: $$[$0 - 1],
            indent: '',
            strip: yy.stripFlags($$[$0 - 4], $$[$0]),
            loc: yy.locInfo(this._$)
          };
          break;
        case 26:
          this.$ = yy.preparePartialBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
          break;
        case 27:
          this.$ = {
            path: $$[$0 - 3],
            params: $$[$0 - 2],
            hash: $$[$0 - 1],
            strip: yy.stripFlags($$[$0 - 4], $$[$0])
          };
          break;
        case 32:
          this.$ = yy.syntax.hash($$[$0 - 1], yy.locInfo(this._$), {
            yy,
            syntax: 'expr'
          });
          break;
        case 33:
          this.$ = {
            type: 'SubExpression',
            path: $$[$0 - 3],
            params: $$[$0 - 2],
            hash: $$[$0 - 1],
            loc: yy.locInfo(this._$)
          };
          break;
        case 34:
          this.$ = {
            type: 'Hash',
            pairs: $$[$0],
            loc: yy.locInfo(this._$)
          };
          break;
        case 35:
          this.$ = {
            type: 'HashPair',
            key: yy.id($$[$0 - 2]),
            value: $$[$0],
            loc: yy.locInfo(this._$)
          };
          break;
        case 36:
          this.$ = yy.syntax.square($$[$0 - 1], yy.locInfo(this._$), {
            yy,
            syntax: 'expr'
          });
          break;
        case 37:
          this.$ = yy.id($$[$0 - 1]);
          break;
        case 40:
          this.$ = {
            type: 'StringLiteral',
            value: $$[$0],
            original: $$[$0],
            loc: yy.locInfo(this._$)
          };
          break;
        case 41:
          this.$ = {
            type: 'NumberLiteral',
            value: Number($$[$0]),
            original: Number($$[$0]),
            loc: yy.locInfo(this._$)
          };
          break;
        case 42:
          this.$ = {
            type: 'BooleanLiteral',
            value: $$[$0] === 'true',
            original: $$[$0] === 'true',
            loc: yy.locInfo(this._$)
          };
          break;
        case 43:
          this.$ = {
            type: 'UndefinedLiteral',
            original: undefined,
            value: undefined,
            loc: yy.locInfo(this._$)
          };
          break;
        case 44:
          this.$ = {
            type: 'NullLiteral',
            original: null,
            value: null,
            loc: yy.locInfo(this._$)
          };
          break;
        case 45:
          this.$ = yy.preparePath(true, false, $$[$0], this._$);
          break;
        case 48:
          this.$ = yy.preparePath(false, $$[$0 - 2], $$[$0], this._$);
          break;
        case 49:
          this.$ = yy.preparePath(false, false, $$[$0], this._$);
          break;
        case 50:
          $$[$0 - 2].push({
            part: yy.id($$[$0]),
            original: $$[$0],
            separator: $$[$0 - 1]
          });
          this.$ = $$[$0 - 2];
          break;
        case 51:
          this.$ = [{
            part: yy.id($$[$0]),
            original: $$[$0]
          }];
          break;
        case 52:
        case 54:
        case 56:
        case 64:
        case 70:
        case 76:
        case 84:
        case 88:
        case 92:
        case 96:
        case 100:
        case 106:
          this.$ = [];
          break;
        case 53:
        case 55:
        case 57:
        case 65:
        case 71:
        case 77:
        case 85:
        case 89:
        case 93:
        case 97:
        case 101:
        case 105:
        case 107:
        case 109:
          $$[$0 - 1].push($$[$0]);
          break;
        case 104:
        case 108:
          this.$ = [$$[$0]];
          break;
      }
    },
    table: [o([5, 14, 15, 19, 29, 34, 48, 53, 57, 61], $V0, {
      3: 1,
      4: 2,
      6: 3
    }), {
      1: [3]
    }, {
      5: [1, 4]
    }, o([5, 39, 44, 47], [2, 2], {
      7: 5,
      8: 6,
      9: 7,
      10: 8,
      11: 9,
      12: 10,
      13: 11,
      24: 15,
      27: 16,
      16: 17,
      60: 19,
      14: [1, 12],
      15: $V1,
      19: [1, 23],
      29: [1, 21],
      34: [1, 22],
      48: [1, 13],
      53: [1, 14],
      57: [1, 18],
      61: [1, 24]
    }), {
      1: [2, 1]
    }, o($V2, [2, 53]), o($V2, [2, 3]), o($V2, [2, 4]), o($V2, [2, 5]), o($V2, [2, 6]), o($V2, [2, 7]), o($V2, [2, 8]), o($V2, [2, 9]), {
      20: 28,
      49: 25,
      50: 26,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      71: 27,
      72: 30,
      73: $V4,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      20: 28,
      50: 45,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, o($Vd, $V0, {
      6: 3,
      4: 47
    }), o($Ve, $V0, {
      6: 3,
      4: 48
    }), o($Vf, [2, 54], {
      17: 49
    }), {
      20: 28,
      50: 50,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, o($Vg, $V0, {
      6: 3,
      4: 51
    }), o([5, 14, 15, 18, 19, 29, 34, 39, 44, 47, 48, 53, 57, 61], [2, 10]), {
      20: 52,
      64: 53,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      20: 54,
      64: 53,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      20: 55,
      64: 53,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      20: 28,
      50: 56,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      33: [1, 57]
    }, o($Vh, [2, 84], {
      51: 58
    }), o([23, 33, 56, 68, 79], [2, 34], {
      72: 59,
      73: [1, 60]
    }), o($Vi, [2, 28]), o($Vi, [2, 29], {
      91: 61,
      92: $Vj,
      93: $Vk
    }), o($Vl, [2, 104]), o($Vi, [2, 38]), o($Vi, [2, 39]), o($Vi, [2, 40]), o($Vi, [2, 41]), o($Vi, [2, 42]), o($Vi, [2, 43]), o($Vi, [2, 44]), o($Vm, [2, 30]), o($Vm, [2, 31]), o([23, 33, 56, 67, 68, 73, 75, 79, 84, 85, 86, 87, 88, 89, 92, 93], $Vn, {
      74: $Vo
    }), o($Vi, [2, 49], {
      91: 65,
      92: $Vj,
      93: $Vk
    }), {
      73: $Vc,
      90: 66
    }, o($Vp, [2, 106], {
      76: 67
    }), {
      20: 28,
      49: 68,
      50: 69,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      71: 27,
      72: 30,
      73: $V4,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, o($Vq, [2, 88], {
      54: 70
    }), o($Vm, $Vn), {
      25: 71,
      38: 73,
      39: $Vr,
      43: 74,
      44: $Vs,
      45: 72,
      47: [2, 60]
    }, {
      28: 77,
      43: 78,
      44: $Vs,
      47: [2, 62]
    }, {
      13: 80,
      15: $V1,
      18: [1, 79]
    }, o($Vh, [2, 92], {
      58: 81
    }), {
      26: 82,
      47: $Vt
    }, o($Vu, [2, 64], {
      30: 84
    }), {
      91: 61,
      92: $Vj,
      93: $Vk
    }, o($Vu, [2, 70], {
      35: 85
    }), o($Vv, [2, 56], {
      21: 86
    }), o($Vh, [2, 96], {
      62: 87
    }), o($V2, [2, 22]), {
      20: 28,
      33: [2, 86],
      49: 90,
      50: 89,
      52: 88,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      71: 27,
      72: 30,
      73: $V4,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, o($Vl, [2, 105]), {
      74: $Vo
    }, {
      73: $Vc,
      90: 91
    }, {
      73: [2, 46]
    }, {
      73: [2, 47]
    }, {
      20: 28,
      50: 92,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      73: [1, 93]
    }, o($Vi, [2, 45], {
      91: 65,
      92: $Vj,
      93: $Vk
    }), {
      20: 28,
      50: 95,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      77: [1, 94],
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      68: [1, 96]
    }, o($Vw, [2, 100], {
      69: 97
    }), {
      20: 28,
      49: 100,
      50: 99,
      55: 98,
      56: [2, 90],
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      71: 27,
      72: 30,
      73: $V4,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      26: 101,
      47: $Vt
    }, {
      47: [2, 61]
    }, o($Vd, $V0, {
      6: 3,
      4: 102
    }), {
      47: [2, 20]
    }, {
      20: 103,
      64: 53,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, o($Vg, $V0, {
      6: 3,
      4: 104
    }), {
      26: 105,
      47: $Vt
    }, {
      47: [2, 63]
    }, o($V2, [2, 11]), o($Vf, [2, 55]), {
      20: 28,
      33: [2, 94],
      49: 108,
      50: 107,
      59: 106,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      71: 27,
      72: 30,
      73: $V4,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, o($V2, [2, 26]), {
      20: 109,
      64: 53,
      65: 38,
      66: 39,
      67: $V3,
      73: $Vc,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, o($Vx, [2, 66], {
      71: 27,
      20: 28,
      64: 29,
      72: 30,
      82: 31,
      83: 32,
      65: 38,
      66: 39,
      90: 41,
      31: 110,
      50: 111,
      49: 112,
      67: $V3,
      73: $V4,
      75: $V5,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb
    }), o($Vx, [2, 72], {
      71: 27,
      20: 28,
      64: 29,
      72: 30,
      82: 31,
      83: 32,
      65: 38,
      66: 39,
      90: 41,
      36: 113,
      50: 114,
      49: 115,
      67: $V3,
      73: $V4,
      75: $V5,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb
    }), {
      20: 28,
      22: 116,
      23: [2, 58],
      49: 118,
      50: 117,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      71: 27,
      72: 30,
      73: $V4,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      20: 28,
      33: [2, 98],
      49: 121,
      50: 120,
      63: 119,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      71: 27,
      72: 30,
      73: $V4,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      33: [1, 122]
    }, o($Vh, [2, 85]), {
      33: [2, 87]
    }, o($Vi, [2, 48], {
      91: 65,
      92: $Vj,
      93: $Vk
    }), o($Vl, [2, 35]), o($Vm, [2, 50]), o($Vm, [2, 36]), o($Vp, [2, 107]), o($Vm, [2, 32]), {
      20: 28,
      49: 125,
      50: 124,
      64: 29,
      65: 38,
      66: 39,
      67: $V3,
      68: [2, 102],
      70: 123,
      71: 27,
      72: 30,
      73: $V4,
      75: $V5,
      82: 31,
      83: 32,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb,
      90: 41
    }, {
      56: [1, 126]
    }, o($Vq, [2, 89]), {
      56: [2, 91]
    }, o($V2, [2, 13]), {
      38: 73,
      39: $Vr,
      43: 74,
      44: $Vs,
      45: 128,
      46: 127,
      47: [2, 82]
    }, o($Vu, [2, 76], {
      40: 129
    }), {
      47: [2, 18]
    }, o($V2, [2, 14]), {
      33: [1, 130]
    }, o($Vh, [2, 93]), {
      33: [2, 95]
    }, {
      33: [1, 131]
    }, {
      32: 132,
      33: [2, 68],
      78: 133,
      79: $Vy
    }, o($Vu, [2, 65]), o($Vx, [2, 67]), {
      33: [2, 74],
      37: 135,
      78: 136,
      79: $Vy
    }, o($Vu, [2, 71]), o($Vx, [2, 73]), {
      23: [1, 137]
    }, o($Vv, [2, 57]), {
      23: [2, 59]
    }, {
      33: [1, 138]
    }, o($Vh, [2, 97]), {
      33: [2, 99]
    }, o($V2, [2, 23]), {
      68: [1, 139]
    }, o($Vw, [2, 101]), {
      68: [2, 103]
    }, o($V2, [2, 24]), {
      47: [2, 19]
    }, {
      47: [2, 83]
    }, o($Vx, [2, 78], {
      71: 27,
      20: 28,
      64: 29,
      72: 30,
      82: 31,
      83: 32,
      65: 38,
      66: 39,
      90: 41,
      41: 140,
      50: 141,
      49: 142,
      67: $V3,
      73: $V4,
      75: $V5,
      84: $V6,
      85: $V7,
      86: $V8,
      87: $V9,
      88: $Va,
      89: $Vb
    }), o($V2, [2, 25]), o($V2, [2, 21]), {
      33: [1, 143]
    }, {
      33: [2, 69]
    }, {
      73: [1, 145],
      80: 144
    }, {
      33: [1, 146]
    }, {
      33: [2, 75]
    }, o($Vf, [2, 12]), o($Vg, [2, 27]), o($Vm, [2, 33]), {
      33: [2, 80],
      42: 147,
      78: 148,
      79: $Vy
    }, o($Vu, [2, 77]), o($Vx, [2, 79]), o($Vd, [2, 15]), {
      73: [1, 150],
      81: [1, 149]
    }, o($Vz, [2, 108]), o($Ve, [2, 16]), {
      33: [1, 151]
    }, {
      33: [2, 81]
    }, {
      33: [2, 37]
    }, o($Vz, [2, 109]), o($Vd, [2, 17])],
    defaultActions: {
      4: [2, 1],
      62: [2, 46],
      63: [2, 47],
      72: [2, 61],
      74: [2, 20],
      78: [2, 63],
      90: [2, 87],
      100: [2, 91],
      104: [2, 18],
      108: [2, 95],
      118: [2, 59],
      121: [2, 99],
      125: [2, 103],
      127: [2, 19],
      128: [2, 83],
      133: [2, 69],
      136: [2, 75],
      148: [2, 81],
      149: [2, 37]
    },
    parseError: /** @this {JisonParser} */ function parseError(/** @type {string} */ str, hash) {
      if (hash.recoverable) {
        this.trace(str);
      } else {
        var error = new Error(str);
        error.hash = hash;
        throw error;
      }
    },
    parse: /** @this {JisonParser} */ function parse(/** @type {string | undefined} */ input) {
      var self = this,
        stack = [0],
        vstack = [null],
        lstack = [],
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        TERROR = 2,
        EOF = 1;
      var args = lstack.slice.call(arguments, 1);
      var lexer = Object.create(this.lexer);
      var sharedState = {
        yy: {}
      };
      for (var k in this.yy) {
        if (Object.prototype.hasOwnProperty.call(this.yy, k)) {
          sharedState.yy[k] = this.yy[k];
        }
      }
      lexer.setInput(input, sharedState.yy);
      sharedState.yy.lexer = lexer;
      sharedState.yy.parser = this;
      if (typeof lexer.yylloc == 'undefined') {
        lexer.yylloc = {};
      }
      var yyloc = lexer.yylloc;
      lstack.push(yyloc);
      var ranges = lexer.options && lexer.options.ranges;
      if (typeof sharedState.yy.parseError === 'function') {
        this.parseError = sharedState.yy.parseError;
      } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
      }
      var lex = function () {
        var token;
        token = lexer.lex() || EOF;
        if (typeof token !== 'number') {
          token = self.symbols_[token] || token;
        }
        return token;
      };
      var symbol,
        state,
        action,
        r,
        yyval = {},
        p,
        len,
        newState,
        expected;
      while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
          action = this.defaultActions[state];
        } else {
          if (symbol === null || typeof symbol == 'undefined') {
            symbol = lex();
          }
          action = table[state] && table[state][symbol];
        }
        if (typeof action === 'undefined' || !action.length || !action[0]) {
          var errStr = '';
          expected = [];
          for (p in table[state]) {
            if (this.terminals_[p] && p > TERROR) {
              expected.push("'" + this.terminals_[p] + "'");
            }
          }
          if (lexer.showPosition) {
            errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ", got '" + (this.terminals_[symbol] || symbol) + "'";
          } else {
            errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : "'" + (this.terminals_[symbol] || symbol) + "'");
          }
          this.parseError(errStr, {
            text: lexer.match,
            token: this.terminals_[symbol] || symbol,
            line: lexer.yylineno,
            loc: yyloc,
            expected: expected
          });
        }
        if (action[0] instanceof Array && action.length > 1) {
          throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
          case 1:
            stack.push(symbol);
            vstack.push(lexer.yytext);
            lstack.push(lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            {
              yyleng = lexer.yyleng;
              yytext = lexer.yytext;
              yylineno = lexer.yylineno;
              yyloc = lexer.yylloc;
            }
            break;
          case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
              first_line: lstack[lstack.length - (len || 1)].first_line,
              last_line: lstack[lstack.length - 1].last_line,
              first_column: lstack[lstack.length - (len || 1)].first_column,
              last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
              yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
            }
            r = this.performAction.apply(yyval, [yytext, yyleng, yylineno, sharedState.yy, action[1], vstack, lstack].concat(args));
            if (typeof r !== 'undefined') {
              return r;
            }
            if (len) {
              stack = stack.slice(0, -1 * len * 2);
              vstack = vstack.slice(0, -1 * len);
              lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
          case 3:
            return true;
        }
      }
      return true;
    }
  });
  /* generated by jison-lex 0.3.4 */
  var lexer = function () {
    var lexer = /** @type {JisonLexer} */ ({
      EOF: 1,
      parseError: /** @this {JisonLexer} */ function parseError(str, hash) {
        if (this.yy.parser) {
          this.yy.parser.parseError(str, hash);
        } else {
          throw new Error(str);
        }
      },
      // resets the lexer, sets new input
      setInput: /** @this {JisonLexer} */ function (/** @type {string} */ input, yy) {
        this.yy = yy || this.yy || {};
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
          first_line: 1,
          first_column: 0,
          last_line: 1,
          last_column: 0
        };
        if (this.options.ranges) {
          this.yylloc.range = [0, 0];
        }
        this.offset = 0;
        return this;
      },
      // consumes and returns one char from the input
      input: /** @this {JisonLexer} */ function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
          this.yylineno++;
          this.yylloc.last_line++;
        } else {
          this.yylloc.last_column++;
        }
        if (this.options.ranges) {
          this.yylloc.range[1]++;
        }
        this._input = this._input.slice(1);
        return ch;
      },
      // unshifts one char (or a string) into the input
      unput: /** @this {JisonLexer} */ function (/** @type {string} */ ch) {
        /** @type {number} */ var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);
        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);
        if (lines.length - 1) {
          this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;
        this.yylloc = {
          first_line: this.yylloc.first_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.first_column,
          last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
        };
        if (this.options.ranges) {
          this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
      },
      // When called from action, caches matched text and appends it on next action
      more: /** @this {JisonLexer} */ function () {
        this._more = true;
        return this;
      },
      // When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
      reject: /** @this {JisonLexer} */ function () {
        if (this.options.backtrack_lexer) {
          this._backtrack = true;
        } else {
          return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
            text: '',
            token: null,
            line: this.yylineno
          });
        }
        return this;
      },
      // retain first n characters of the match
      less: /** @this {JisonLexer} */ function (n) {
        this.unput(this.match.slice(n));
      },
      // displays already matched input, i.e. for error messages
      pastInput: /** @this {JisonLexer} */ /** @returns {string} */ function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...' : '') + past.substr(-20).replace(/\n/g, '');
      },
      // displays upcoming input, i.e. for error messages
      upcomingInput: /** @this {JisonLexer} */ /** @returns {string} */ function () {
        var next = this.match;
        if (next.length < 20) {
          next += this._input.substr(0, 20 - next.length);
        }
        return (next.substr(0, 20) + (next.length > 20 ? '...' : '')).replace(/\n/g, '');
      },
      // displays the character position where the lexing error occurred, i.e. for error messages
      showPosition: /** @this {JisonLexer} */ /** @returns {string} */ function () {
        /** @type {string} */ var pre = this.pastInput();
        /** @type {string} */ var c = new Array(pre.length + 1).join('-');
        return pre + this.upcomingInput() + '\n' + c + '^';
      },
      // test the lexed token: return FALSE when not a match, otherwise return token
      test_match: function (match, indexed_rule) {
        var token, lines, backup;
        if (this.options.backtrack_lexer) {
          // save context
          backup = {
            yylineno: this.yylineno,
            yylloc: {
              first_line: this.yylloc.first_line,
              last_line: this.last_line,
              first_column: this.yylloc.first_column,
              last_column: this.yylloc.last_column
            },
            yytext: this.yytext,
            match: this.match,
            matches: this.matches,
            matched: this.matched,
            yyleng: this.yyleng,
            offset: this.offset,
            _more: this._more,
            _input: this._input,
            yy: this.yy,
            conditionStack: this.conditionStack.slice(0),
            done: this.done
          };
          if (this.options.ranges) {
            backup.yylloc.range = this.yylloc.range.slice(0);
          }
        }
        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
          this.yylineno += lines.length;
        }
        this.yylloc = {
          first_line: this.yylloc.last_line,
          last_line: this.yylineno + 1,
          first_column: this.yylloc.last_column,
          last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
          this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
          this.done = false;
        }
        if (token) {
          return token;
        } else if (this._backtrack) {
          // recover context
          for (var k in backup) {
            this[k] = backup[k];
          }
          return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
      },
      // return next match in input
      next: /** @this {JisonLexer} */ function () {
        if (this.done) {
          return this.EOF;
        }
        if (!this._input) {
          this.done = true;
        }
        var token, match, tempMatch, index;
        if (!this._more) {
          this.yytext = '';
          this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
          tempMatch = this._input.match(this.rules[rules[i]]);
          if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
            match = tempMatch;
            index = i;
            if (this.options.backtrack_lexer) {
              token = this.test_match(tempMatch, rules[i]);
              if (token !== false) {
                return token;
              } else if (this._backtrack) {
                match = false;
                continue; // rule action called reject() implying a rule MISmatch.
              } else {
                // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                return false;
              }
            } else if (!this.options.flex) {
              break;
            }
          }
        }
        if (match) {
          token = this.test_match(match, rules[index]);
          if (token !== false) {
            return token;
          }
          // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
          return false;
        }
        if (this._input === '') {
          return this.EOF;
        } else {
          return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
            text: '',
            token: null,
            line: this.yylineno
          });
        }
      },
      // return next match that has a token
      lex: /** @this {JisonLexer} */ function lex() {
        var r = this.next();
        if (r) {
          return r;
        } else {
          return this.lex();
        }
      },
      // activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
      begin: /** @this {JisonLexer} */ function begin(/** @type {string} */ condition) {
        this.conditionStack.push(condition);
      },
      // pop the previously active lexer condition state off the condition stack
      popState: /** @this {JisonLexer} */ /** @returns {string} */ function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
          return this.conditionStack.pop();
        } else {
          return this.conditionStack[0];
        }
      },
      // produce the lexer rule set which is active for the currently active lexer condition state
      _currentRules: /** @this {JisonLexer} */ /** @returns {any[]} */ function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
          return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
          return this.conditions['INITIAL'].rules;
        }
      },
      // return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
      topState: /** @this {JisonLexer} */ function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
          return this.conditionStack[n];
        } else {
          return 'INITIAL';
        }
      },
      // alias for begin(condition)
      pushState: /** @this {JisonLexer} */ function pushState(condition) {
        this.begin(condition);
      },
      // return the number of states currently on the stack
      stateStackSize: /** @this {JisonLexer} */ function stateStackSize() {
        return this.conditionStack.length;
      },
      options: {},
      performAction: /** @this {JisonLexer} */ function anonymous(yy, /** @type {JisonLexer} */ yy_, /** @type {number} */ $avoiding_name_collisions, /** @type {string} */ YY_START) {
        /** @returns {string} */ function strip(/** @type {number} */ start, /** @type {number} */ end) {
          return yy_.yytext = yy_.yytext.substring(start, yy_.yyleng - end + start);
        }
        switch ($avoiding_name_collisions) {
          case 0:
            if (yy_.yytext.slice(-2) === '\\\\') {
              strip(0, 1);
              this.begin('mu');
            } else if (yy_.yytext.slice(-1) === '\\') {
              strip(0, 1);
              this.begin('emu');
            } else {
              this.begin('mu');
            }
            if (yy_.yytext) return 15;
            break;
          case 1:
            return 15;
          case 2:
            this.popState();
            return 15;
          case 3:
            this.begin('raw');
            return 15;
          case 4:
            this.popState();
            // Should be using `this.topState()` below, but it currently
            // returns the second top instead of the first top. Opened an
            // issue about it at https://github.com/zaach/jison/issues/291
            if (this.conditionStack[this.conditionStack.length - 1] === 'raw') {
              return 15;
            } else {
              strip(5, 9);
              return 18;
            }
          case 5:
            return 15;
          case 6:
            this.popState();
            return 14;
          case 7:
            return 67;
          case 8:
            return 68;
          case 9:
            if (yy.syntax.square === 'string') {
              this.unput(yy_.yytext);
              // escaped literal
              this.begin('escl');
            } else {
              return 75;
            }
            break;
          case 10:
            return 77;
          case 11:
            return 19;
          case 12:
            this.popState();
            this.begin('raw');
            return 23;
          case 13:
            return 57;
          case 14:
            return 61;
          case 15:
            return 29;
          case 16:
            return 47;
          case 17:
            this.popState();
            return 44;
          case 18:
            this.popState();
            return 44;
          case 19:
            return 34;
          case 20:
            return 39;
          case 21:
            return 53;
          case 22:
            return 48;
          case 23:
            this.unput(yy_.yytext);
            this.popState();
            this.begin('com');
            break;
          case 24:
            this.popState();
            return 14;
          case 25:
            return 48;
          case 26:
            return 74;
          case 27:
            return 73;
          case 28:
            return 73;
          case 29:
            return 93;
          case 30:
            return 92;
          case 31:
            // ignore whitespace
            break;
          case 32:
            this.popState();
            return 56;
          case 33:
            this.popState();
            return 33;
          case 34:
            yy_.yytext = strip(1, 2).replace(/\\"/g, '"');
            return 84;
          case 35:
            yy_.yytext = strip(1, 2).replace(/\\'/g, "'");
            return 84;
          case 36:
            return 89;
          case 37:
            return 86;
          case 38:
            return 86;
          case 39:
            return 87;
          case 40:
            return 88;
          case 41:
            return 85;
          case 42:
            return 79;
          case 43:
            return 81;
          case 44:
            return 73;
          case 45:
            yy_.yytext = yy_.yytext.replace(/\\([\\\]])/g, '$1');
            this.popState();
            return 73;
          case 46:
            return 'INVALID';
          case 47:
            return 5;
        }
      },
      rules: [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{(?=[^/]))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]+?(?=(\{\{\{\{)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\[)/, /^(?:\])/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#>)/, /^(?:\{\{(~)?#\*?)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?\*?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)\]|])))/, /^(?:\.#)/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)\]])))/, /^(?:false(?=([~}\s)\]])))/, /^(?:undefined(?=([~}\s)\]])))/, /^(?:null(?=([~}\s)\]])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)\]])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)\]|]))))/, /^(?:\[(\\\]|[^\]])*\])/, /^(?:.)/, /^(?:$)/],
      conditions: {
        mu: {
          rules: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 46, 47],
          inclusive: false
        },
        emu: {
          rules: [2],
          inclusive: false
        },
        com: {
          rules: [6],
          inclusive: false
        },
        raw: {
          rules: [3, 4, 5],
          inclusive: false
        },
        escl: {
          rules: [45],
          inclusive: false
        },
        INITIAL: {
          rules: [0, 1, 47],
          inclusive: true
        }
      }
    });
    return lexer;
  }();
  parser.lexer = lexer;
  function Parser() {
    this.yy = {};
  }
  Parser.prototype = parser;
  parser.Parser = Parser;
  return new Parser();
})();

function PrintVisitor() {
  this.padding = 0;
}
PrintVisitor.prototype = new Visitor();
PrintVisitor.prototype.pad = /** @this {HbsPrintVisitor} */ function (/** @type {string} */ string) {
  let out = '';
  for (let i = 0, l = this.padding; i < l; i++) {
    out += '  ';
  }
  out += string + '\n';
  return out;
};
PrintVisitor.prototype.Program = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ program) {
  let out = '',
    body = program.body,
    i,
    l;
  if (program.blockParams) {
    let blockParams = 'BLOCK PARAMS: [';
    for (i = 0, l = program.blockParams.length; i < l; i++) {
      blockParams += ' ' + program.blockParams[i];
    }
    blockParams += ' ]';
    out += this.pad(blockParams);
  }
  for (i = 0, l = body.length; i < l; i++) {
    out += this.accept(body[i]);
  }
  this.padding--;
  return out;
};
PrintVisitor.prototype.MustacheStatement = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ mustache) {
  if (mustache.params.length > 0 || mustache.hash) {
    return this.pad('{{ ' + this.callBody(mustache) + ' }}');
  } else {
    return this.pad('{{ ' + this.accept(mustache.path) + ' }}');
  }
};
PrintVisitor.prototype.Decorator = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ mustache) {
  return this.pad('{{ DIRECTIVE ' + this.callBody(mustache) + ' }}');
};
PrintVisitor.prototype.BlockStatement = PrintVisitor.prototype.DecoratorBlock = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ block) {
  let out = '';
  out += this.pad((block.type === 'DecoratorBlock' ? 'DIRECTIVE ' : '') + 'BLOCK:');
  this.padding++;
  out += this.pad(this.callBody(block));
  if (block.program) {
    out += this.pad('PROGRAM:');
    this.padding++;
    out += this.accept(block.program);
    this.padding--;
  }
  if (block.inverse) {
    if (block.program) {
      this.padding++;
    }
    out += this.pad('{{^}}');
    this.padding++;
    out += this.accept(block.inverse);
    this.padding--;
    if (block.program) {
      this.padding--;
    }
  }
  this.padding--;
  return out;
};
PrintVisitor.prototype.PartialStatement = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ partial) {
  let content = 'PARTIAL:' + partial.name.original;
  if (partial.params[0]) {
    content += ' ' + this.accept(partial.params[0]);
  }
  if (partial.hash) {
    content += ' ' + this.accept(partial.hash);
  }
  return this.pad('{{> ' + content + ' }}');
};
PrintVisitor.prototype.PartialBlockStatement = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ partial) {
  let content = 'PARTIAL BLOCK:' + partial.name.original;
  if (partial.params[0]) {
    content += ' ' + this.accept(partial.params[0]);
  }
  if (partial.hash) {
    content += ' ' + this.accept(partial.hash);
  }
  content += ' ' + this.pad('PROGRAM:');
  this.padding++;
  content += this.accept(partial.program);
  this.padding--;
  return this.pad('{{> ' + content + ' }}');
};
PrintVisitor.prototype.ContentStatement = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ content) {
  return this.pad("CONTENT[ '" + content.value + "' ]");
};
PrintVisitor.prototype.CommentStatement = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ comment) {
  return this.pad("{{! '" + comment.value + "' }}");
};
PrintVisitor.prototype.SubExpression = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ sexpr) {
  return `(${this.callBody(sexpr)})`;
};
PrintVisitor.prototype.callBody = /** @this {HbsPrintVisitor} */ function (callExpr) {
  let params = callExpr.params,
    paramStrings = [],
    hash;
  for (let i = 0, l = params.length; i < l; i++) {
    paramStrings.push(this.accept(params[i]));
  }
  params = paramStrings.length === 0 ? '' : ' [' + paramStrings.join(', ') + ']';
  hash = callExpr.hash ? ' ' + this.accept(callExpr.hash) : '';
  return this.accept(callExpr.path) + params + hash;
};
PrintVisitor.prototype.PathExpression = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ id) {
  let head = typeof id.head === 'string' ? id.head : `[${this.accept(id.head)}]`;
  let path = [head, ...id.tail].join('/');
  return 'p%' + prefix(id) + path;
};
function prefix(path) {
  if (path.data) {
    return '@';
  } else if (path.this) {
    return 'this.';
  } else {
    return '';
  }
}
PrintVisitor.prototype.StringLiteral = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ string) {
  return '"' + string.value + '"';
};
PrintVisitor.prototype.NumberLiteral = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ number) {
  return 'n%' + number.value;
};
PrintVisitor.prototype.BooleanLiteral = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ bool) {
  return 'b%' + bool.value;
};
PrintVisitor.prototype.UndefinedLiteral = /** @this {HbsPrintVisitor} */ function () {
  return 'UNDEFINED';
};
PrintVisitor.prototype.NullLiteral = /** @this {HbsPrintVisitor} */ function () {
  return 'NULL';
};
PrintVisitor.prototype.ArrayLiteral = /** @this {HbsPrintVisitor} */ function (array) {
  return `Array[${array.items.map(item => this.accept(item)).join(', ')}]`;
};
PrintVisitor.prototype.HashLiteral = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ hash) {
  return `Hash{${this.hashPairs(hash)}}`;
};
PrintVisitor.prototype.Hash = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ hash) {
  return `HASH{${this.hashPairs(hash)}}`;
};
PrintVisitor.prototype.hashPairs = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ hash) {
  let pairs = hash.pairs,
    joinedPairs = [];
  for (let i = 0, l = pairs.length; i < l; i++) {
    joinedPairs.push(this.HashPair(pairs[i]));
  }
  return joinedPairs.join(' ');
};
PrintVisitor.prototype.HashPair = /** @this {HbsPrintVisitor} */ function (/** @type {HbsNode} */ pair) {
  return pair.key + '=' + this.accept(pair.value);
};

function validateClose(/** @type {HbsNode} */ open, close) {
  close = close.path ? close.path.original : close;
  if (open.path.original !== close) {
    let errorNode = {
      loc: open.path.loc
    };
    throw new Exception(open.path.original + " doesn't match " + close, errorNode);
  }
}
function SourceLocation(/** @type {string | undefined} */ source, /** @type {JisonLocation} */ locInfo) {
  this.source = source;
  this.start = {
    line: locInfo.first_line,
    column: locInfo.first_column
  };
  this.end = {
    line: locInfo.last_line,
    column: locInfo.last_column
  };
}
/** @returns {string | string[]} */ function id(/** @type {string | string[]} */ token) {
  if (/^\[.*\]$/.test(token)) {
    return token.substring(1, token.length - 1);
  } else {
    return token;
  }
}
function stripFlags(/** @type {string} */ open, /** @type {string} */ close) {
  return {
    open: open.charAt(2) === '~',
    close: close.charAt(close.length - 3) === '~'
  };
}
/** @returns {string} */ function stripComment(/** @type {string} */ comment) {
  return comment.replace(/^\{\{~?!-?-?/, '').replace(/-?-?~?\}\}$/, '');
}
/** @this {JisonShared} */ function preparePath(/** @type {boolean} */ data, sexpr, /** @type {HbsPathPart[]} */ parts, loc) {
  loc = this.locInfo(loc);
  let original;
  if (data) {
    original = '@';
  } else if (sexpr) {
    original = sexpr.original + '.';
  } else {
    original = '';
  }
  let tail = [];
  let depth = 0;
  for (let i = 0, l = parts.length; i < l; i++) {
    let part = parts[i].part;
    // If we have [] syntax then we do not treat path references as operators,
    // i.e. foo.[this] resolves to approximately context.foo['this']
    let isLiteral = parts[i].original !== part;
    let separator = parts[i].separator;
    let partPrefix = separator === '.#' ? '#' : '';
    original += (separator || '') + part;
    if (!isLiteral && (part === '..' || part === '.' || part === 'this')) {
      if (tail.length > 0) {
        throw new Exception('Invalid path: ' + original, {
          loc
        });
      } else if (part === '..') {
        depth++;
      }
    } else {
      tail.push(`${partPrefix}${part}`);
    }
  }
  let head = sexpr || tail.shift();
  return {
    type: 'PathExpression',
    this: original.startsWith('this.'),
    data,
    depth,
    head,
    tail,
    parts: head ? [head, ...tail] : tail,
    original,
    loc
  };
}
/** @this {JisonShared} */ function prepareMustache(/** @type {HbsNode} */ path, /** @type {any[]} */ params, hash, /** @type {string} */ open, strip, locInfo) {
  // Must use charAt to support IE pre-10
  let escapeFlag = open.charAt(3) || open.charAt(2),
    escaped = escapeFlag !== '{' && escapeFlag !== '&';
  let decorator = /\*/.test(open);
  return {
    type: decorator ? 'Decorator' : 'MustacheStatement',
    path,
    params,
    hash,
    escaped,
    strip,
    loc: this.locInfo(locInfo)
  };
}
/** @this {JisonShared} */ function prepareRawBlock(/** @type {HbsNode} */ openRawBlock, /** @type {any[]} */ contents, close, locInfo) {
  validateClose(openRawBlock, close);
  locInfo = this.locInfo(locInfo);
  let program = {
    type: 'Program',
    body: contents,
    strip: {},
    loc: locInfo
  };
  return {
    type: 'BlockStatement',
    path: openRawBlock.path,
    params: openRawBlock.params,
    hash: openRawBlock.hash,
    program,
    openStrip: {},
    inverseStrip: {},
    closeStrip: {},
    loc: locInfo
  };
}
/** @this {JisonShared} */ function prepareBlock(/** @type {HbsNode} */ openBlock, program, inverseAndProgram, close, inverted, locInfo) {
  if (close && close.path) {
    validateClose(openBlock, close);
  }
  let decorator = /\*/.test(openBlock.open);
  program.blockParams = openBlock.blockParams;
  let inverse, inverseStrip;
  if (inverseAndProgram) {
    if (decorator) {
      throw new Exception('Unexpected inverse block on decorator', inverseAndProgram);
    }
    if (inverseAndProgram.chain) {
      inverseAndProgram.program.body[0].closeStrip = close.strip;
    }
    inverseStrip = inverseAndProgram.strip;
    inverse = inverseAndProgram.program;
  }
  if (inverted) {
    inverted = inverse;
    inverse = program;
    program = inverted;
  }
  return {
    type: decorator ? 'DecoratorBlock' : 'BlockStatement',
    path: openBlock.path,
    params: openBlock.params,
    hash: openBlock.hash,
    program,
    inverse,
    openStrip: openBlock.strip,
    inverseStrip,
    closeStrip: close && close.strip,
    loc: this.locInfo(locInfo)
  };
}
function prepareProgram(/** @type {any[]} */ statements, loc) {
  if (!loc && statements.length) {
    const firstLoc = statements[0].loc,
      lastLoc = statements[statements.length - 1].loc;

    /* istanbul ignore else */
    if (firstLoc && lastLoc) {
      loc = {
        source: firstLoc.source,
        start: {
          line: firstLoc.start.line,
          column: firstLoc.start.column
        },
        end: {
          line: lastLoc.end.line,
          column: lastLoc.end.column
        }
      };
    }
  }
  return {
    type: 'Program',
    body: statements,
    strip: {},
    loc: loc
  };
}
/** @this {JisonShared} */ function preparePartialBlock(/** @type {HbsNode} */ open, /** @type {HbsNode} */ program, close, locInfo) {
  validateClose(open, close);
  return {
    type: 'PartialBlockStatement',
    name: open.path,
    params: open.params,
    hash: open.hash,
    program,
    openStrip: open.strip,
    closeStrip: close && close.strip,
    loc: this.locInfo(locInfo)
  };
}

var Helpers = /*#__PURE__*/Object.freeze({
  __proto__: null,
  SourceLocation: SourceLocation,
  id: id,
  prepareBlock: prepareBlock,
  prepareMustache: prepareMustache,
  preparePartialBlock: preparePartialBlock,
  preparePath: preparePath,
  prepareProgram: prepareProgram,
  prepareRawBlock: prepareRawBlock,
  stripComment: stripComment,
  stripFlags: stripFlags
});

let baseHelpers = {};
for (let helper in Helpers) {
  if (Object.prototype.hasOwnProperty.call(Helpers, helper)) {
    baseHelpers[helper] = Helpers[helper];
  }
}
function parseWithoutProcessing(/** @type {string} */ input, options) {
  // Just return if an already-compiled AST was passed in.
  if (input.type === 'Program') {
    return input;
  }
  parser.yy = baseHelpers;

  // Altering the shared object here, but this is ok as parser is a sync operation
  parser.yy.locInfo = function (locInfo) {
    return new SourceLocation(options && options.srcName, locInfo);
  };
  let squareSyntax;
  if (typeof options?.syntax?.square === 'function') {
    squareSyntax = options.syntax.square;
  } else if (options?.syntax?.square === 'node') {
    squareSyntax = arrayLiteralNode;
  } else {
    squareSyntax = 'string';
  }
  let hashSyntax;
  if (typeof options?.syntax?.hash === 'function') {
    hashSyntax = options.syntax.hash;
  } else {
    hashSyntax = hashLiteralNode;
  }
  parser.yy.syntax = {
    square: squareSyntax,
    hash: hashSyntax
  };
  return parser.parse(input);
}
function arrayLiteralNode(array, loc) {
  return {
    type: 'ArrayLiteral',
    items: array,
    loc
  };
}
function hashLiteralNode(hash, loc) {
  return {
    type: 'HashLiteral',
    pairs: hash.pairs,
    loc
  };
}
/** @returns {import("glimmer-ast-types").GlimmerNode} */ function parse(/** @type {string} */ input, options) {
  let ast = parseWithoutProcessing(input, options);
  let strip = new WhitespaceControl(options);
  return strip.accept(ast);
}

//#region src/generated/html5-named-char-refs.ts
/**
* generated from https://raw.githubusercontent.com/w3c/html/2ef7a579bcfd2693b98df35f20e51dff60e3fbef/entities.json
* do not edit
*/
var html5_named_char_refs_default = {
  Aacute: "Á",
  aacute: "á",
  Abreve: "Ă",
  abreve: "ă",
  ac: "∾",
  acd: "∿",
  acE: "∾̳",
  Acirc: "Â",
  acirc: "â",
  acute: "´",
  Acy: "А",
  acy: "а",
  AElig: "Æ",
  aelig: "æ",
  af: "⁡",
  Afr: "𝔄",
  afr: "𝔞",
  Agrave: "À",
  agrave: "à",
  alefsym: "ℵ",
  aleph: "ℵ",
  Alpha: "Α",
  alpha: "α",
  Amacr: "Ā",
  amacr: "ā",
  amalg: "⨿",
  amp: "&",
  AMP: "&",
  andand: "⩕",
  And: "⩓",
  and: "∧",
  andd: "⩜",
  andslope: "⩘",
  andv: "⩚",
  ang: "∠",
  ange: "⦤",
  angle: "∠",
  angmsdaa: "⦨",
  angmsdab: "⦩",
  angmsdac: "⦪",
  angmsdad: "⦫",
  angmsdae: "⦬",
  angmsdaf: "⦭",
  angmsdag: "⦮",
  angmsdah: "⦯",
  angmsd: "∡",
  angrt: "∟",
  angrtvb: "⊾",
  angrtvbd: "⦝",
  angsph: "∢",
  angst: "Å",
  angzarr: "⍼",
  Aogon: "Ą",
  aogon: "ą",
  Aopf: "𝔸",
  aopf: "𝕒",
  apacir: "⩯",
  ap: "≈",
  apE: "⩰",
  ape: "≊",
  apid: "≋",
  apos: "'",
  ApplyFunction: "⁡",
  approx: "≈",
  approxeq: "≊",
  Aring: "Å",
  aring: "å",
  Ascr: "𝒜",
  ascr: "𝒶",
  Assign: "≔",
  ast: "*",
  asymp: "≈",
  asympeq: "≍",
  Atilde: "Ã",
  atilde: "ã",
  Auml: "Ä",
  auml: "ä",
  awconint: "∳",
  awint: "⨑",
  backcong: "≌",
  backepsilon: "϶",
  backprime: "‵",
  backsim: "∽",
  backsimeq: "⋍",
  Backslash: "∖",
  Barv: "⫧",
  barvee: "⊽",
  barwed: "⌅",
  Barwed: "⌆",
  barwedge: "⌅",
  bbrk: "⎵",
  bbrktbrk: "⎶",
  bcong: "≌",
  Bcy: "Б",
  bcy: "б",
  bdquo: "„",
  becaus: "∵",
  because: "∵",
  Because: "∵",
  bemptyv: "⦰",
  bepsi: "϶",
  bernou: "ℬ",
  Bernoullis: "ℬ",
  Beta: "Β",
  beta: "β",
  beth: "ℶ",
  between: "≬",
  Bfr: "𝔅",
  bfr: "𝔟",
  bigcap: "⋂",
  bigcirc: "◯",
  bigcup: "⋃",
  bigodot: "⨀",
  bigoplus: "⨁",
  bigotimes: "⨂",
  bigsqcup: "⨆",
  bigstar: "★",
  bigtriangledown: "▽",
  bigtriangleup: "△",
  biguplus: "⨄",
  bigvee: "⋁",
  bigwedge: "⋀",
  bkarow: "⤍",
  blacklozenge: "⧫",
  blacksquare: "▪",
  blacktriangle: "▴",
  blacktriangledown: "▾",
  blacktriangleleft: "◂",
  blacktriangleright: "▸",
  blank: "␣",
  blk12: "▒",
  blk14: "░",
  blk34: "▓",
  block: "█",
  bne: "=⃥",
  bnequiv: "≡⃥",
  bNot: "⫭",
  bnot: "⌐",
  Bopf: "𝔹",
  bopf: "𝕓",
  bot: "⊥",
  bottom: "⊥",
  bowtie: "⋈",
  boxbox: "⧉",
  boxdl: "┐",
  boxdL: "╕",
  boxDl: "╖",
  boxDL: "╗",
  boxdr: "┌",
  boxdR: "╒",
  boxDr: "╓",
  boxDR: "╔",
  boxh: "─",
  boxH: "═",
  boxhd: "┬",
  boxHd: "╤",
  boxhD: "╥",
  boxHD: "╦",
  boxhu: "┴",
  boxHu: "╧",
  boxhU: "╨",
  boxHU: "╩",
  boxminus: "⊟",
  boxplus: "⊞",
  boxtimes: "⊠",
  boxul: "┘",
  boxuL: "╛",
  boxUl: "╜",
  boxUL: "╝",
  boxur: "└",
  boxuR: "╘",
  boxUr: "╙",
  boxUR: "╚",
  boxv: "│",
  boxV: "║",
  boxvh: "┼",
  boxvH: "╪",
  boxVh: "╫",
  boxVH: "╬",
  boxvl: "┤",
  boxvL: "╡",
  boxVl: "╢",
  boxVL: "╣",
  boxvr: "├",
  boxvR: "╞",
  boxVr: "╟",
  boxVR: "╠",
  bprime: "‵",
  breve: "˘",
  Breve: "˘",
  brvbar: "¦",
  bscr: "𝒷",
  Bscr: "ℬ",
  bsemi: "⁏",
  bsim: "∽",
  bsime: "⋍",
  bsolb: "⧅",
  bsol: "\\",
  bsolhsub: "⟈",
  bull: "•",
  bullet: "•",
  bump: "≎",
  bumpE: "⪮",
  bumpe: "≏",
  Bumpeq: "≎",
  bumpeq: "≏",
  Cacute: "Ć",
  cacute: "ć",
  capand: "⩄",
  capbrcup: "⩉",
  capcap: "⩋",
  cap: "∩",
  Cap: "⋒",
  capcup: "⩇",
  capdot: "⩀",
  CapitalDifferentialD: "ⅅ",
  caps: "∩︀",
  caret: "⁁",
  caron: "ˇ",
  Cayleys: "ℭ",
  ccaps: "⩍",
  Ccaron: "Č",
  ccaron: "č",
  Ccedil: "Ç",
  ccedil: "ç",
  Ccirc: "Ĉ",
  ccirc: "ĉ",
  Cconint: "∰",
  ccups: "⩌",
  ccupssm: "⩐",
  Cdot: "Ċ",
  cdot: "ċ",
  cedil: "¸",
  Cedilla: "¸",
  cemptyv: "⦲",
  cent: "¢",
  centerdot: "·",
  CenterDot: "·",
  cfr: "𝔠",
  Cfr: "ℭ",
  CHcy: "Ч",
  chcy: "ч",
  check: "✓",
  checkmark: "✓",
  Chi: "Χ",
  chi: "χ",
  circ: "ˆ",
  circeq: "≗",
  circlearrowleft: "↺",
  circlearrowright: "↻",
  circledast: "⊛",
  circledcirc: "⊚",
  circleddash: "⊝",
  CircleDot: "⊙",
  circledR: "®",
  circledS: "Ⓢ",
  CircleMinus: "⊖",
  CirclePlus: "⊕",
  CircleTimes: "⊗",
  cir: "○",
  cirE: "⧃",
  cire: "≗",
  cirfnint: "⨐",
  cirmid: "⫯",
  cirscir: "⧂",
  ClockwiseContourIntegral: "∲",
  CloseCurlyDoubleQuote: "”",
  CloseCurlyQuote: "’",
  clubs: "♣",
  clubsuit: "♣",
  colon: ":",
  Colon: "∷",
  Colone: "⩴",
  colone: "≔",
  coloneq: "≔",
  comma: ",",
  commat: "@",
  comp: "∁",
  compfn: "∘",
  complement: "∁",
  complexes: "ℂ",
  cong: "≅",
  congdot: "⩭",
  Congruent: "≡",
  conint: "∮",
  Conint: "∯",
  ContourIntegral: "∮",
  copf: "𝕔",
  Copf: "ℂ",
  coprod: "∐",
  Coproduct: "∐",
  copy: "©",
  COPY: "©",
  copysr: "℗",
  CounterClockwiseContourIntegral: "∳",
  crarr: "↵",
  cross: "✗",
  Cross: "⨯",
  Cscr: "𝒞",
  cscr: "𝒸",
  csub: "⫏",
  csube: "⫑",
  csup: "⫐",
  csupe: "⫒",
  ctdot: "⋯",
  cudarrl: "⤸",
  cudarrr: "⤵",
  cuepr: "⋞",
  cuesc: "⋟",
  cularr: "↶",
  cularrp: "⤽",
  cupbrcap: "⩈",
  cupcap: "⩆",
  CupCap: "≍",
  cup: "∪",
  Cup: "⋓",
  cupcup: "⩊",
  cupdot: "⊍",
  cupor: "⩅",
  cups: "∪︀",
  curarr: "↷",
  curarrm: "⤼",
  curlyeqprec: "⋞",
  curlyeqsucc: "⋟",
  curlyvee: "⋎",
  curlywedge: "⋏",
  curren: "¤",
  curvearrowleft: "↶",
  curvearrowright: "↷",
  cuvee: "⋎",
  cuwed: "⋏",
  cwconint: "∲",
  cwint: "∱",
  cylcty: "⌭",
  dagger: "†",
  Dagger: "‡",
  daleth: "ℸ",
  darr: "↓",
  Darr: "↡",
  dArr: "⇓",
  dash: "‐",
  Dashv: "⫤",
  dashv: "⊣",
  dbkarow: "⤏",
  dblac: "˝",
  Dcaron: "Ď",
  dcaron: "ď",
  Dcy: "Д",
  dcy: "д",
  ddagger: "‡",
  ddarr: "⇊",
  DD: "ⅅ",
  dd: "ⅆ",
  DDotrahd: "⤑",
  ddotseq: "⩷",
  deg: "°",
  Del: "∇",
  Delta: "Δ",
  delta: "δ",
  demptyv: "⦱",
  dfisht: "⥿",
  Dfr: "𝔇",
  dfr: "𝔡",
  dHar: "⥥",
  dharl: "⇃",
  dharr: "⇂",
  DiacriticalAcute: "´",
  DiacriticalDot: "˙",
  DiacriticalDoubleAcute: "˝",
  DiacriticalGrave: "`",
  DiacriticalTilde: "˜",
  diam: "⋄",
  diamond: "⋄",
  Diamond: "⋄",
  diamondsuit: "♦",
  diams: "♦",
  die: "¨",
  DifferentialD: "ⅆ",
  digamma: "ϝ",
  disin: "⋲",
  div: "÷",
  divide: "÷",
  divideontimes: "⋇",
  divonx: "⋇",
  DJcy: "Ђ",
  djcy: "ђ",
  dlcorn: "⌞",
  dlcrop: "⌍",
  dollar: "$",
  Dopf: "𝔻",
  dopf: "𝕕",
  Dot: "¨",
  dot: "˙",
  DotDot: "⃜",
  doteq: "≐",
  doteqdot: "≑",
  DotEqual: "≐",
  dotminus: "∸",
  dotplus: "∔",
  dotsquare: "⊡",
  doublebarwedge: "⌆",
  DoubleContourIntegral: "∯",
  DoubleDot: "¨",
  DoubleDownArrow: "⇓",
  DoubleLeftArrow: "⇐",
  DoubleLeftRightArrow: "⇔",
  DoubleLeftTee: "⫤",
  DoubleLongLeftArrow: "⟸",
  DoubleLongLeftRightArrow: "⟺",
  DoubleLongRightArrow: "⟹",
  DoubleRightArrow: "⇒",
  DoubleRightTee: "⊨",
  DoubleUpArrow: "⇑",
  DoubleUpDownArrow: "⇕",
  DoubleVerticalBar: "∥",
  DownArrowBar: "⤓",
  downarrow: "↓",
  DownArrow: "↓",
  Downarrow: "⇓",
  DownArrowUpArrow: "⇵",
  DownBreve: "̑",
  downdownarrows: "⇊",
  downharpoonleft: "⇃",
  downharpoonright: "⇂",
  DownLeftRightVector: "⥐",
  DownLeftTeeVector: "⥞",
  DownLeftVectorBar: "⥖",
  DownLeftVector: "↽",
  DownRightTeeVector: "⥟",
  DownRightVectorBar: "⥗",
  DownRightVector: "⇁",
  DownTeeArrow: "↧",
  DownTee: "⊤",
  drbkarow: "⤐",
  drcorn: "⌟",
  drcrop: "⌌",
  Dscr: "𝒟",
  dscr: "𝒹",
  DScy: "Ѕ",
  dscy: "ѕ",
  dsol: "⧶",
  Dstrok: "Đ",
  dstrok: "đ",
  dtdot: "⋱",
  dtri: "▿",
  dtrif: "▾",
  duarr: "⇵",
  duhar: "⥯",
  dwangle: "⦦",
  DZcy: "Џ",
  dzcy: "џ",
  dzigrarr: "⟿",
  Eacute: "É",
  eacute: "é",
  easter: "⩮",
  Ecaron: "Ě",
  ecaron: "ě",
  Ecirc: "Ê",
  ecirc: "ê",
  ecir: "≖",
  ecolon: "≕",
  Ecy: "Э",
  ecy: "э",
  eDDot: "⩷",
  Edot: "Ė",
  edot: "ė",
  eDot: "≑",
  ee: "ⅇ",
  efDot: "≒",
  Efr: "𝔈",
  efr: "𝔢",
  eg: "⪚",
  Egrave: "È",
  egrave: "è",
  egs: "⪖",
  egsdot: "⪘",
  el: "⪙",
  Element: "∈",
  elinters: "⏧",
  ell: "ℓ",
  els: "⪕",
  elsdot: "⪗",
  Emacr: "Ē",
  emacr: "ē",
  empty: "∅",
  emptyset: "∅",
  EmptySmallSquare: "◻",
  emptyv: "∅",
  EmptyVerySmallSquare: "▫",
  emsp13: " ",
  emsp14: " ",
  emsp: " ",
  ENG: "Ŋ",
  eng: "ŋ",
  ensp: " ",
  Eogon: "Ę",
  eogon: "ę",
  Eopf: "𝔼",
  eopf: "𝕖",
  epar: "⋕",
  eparsl: "⧣",
  eplus: "⩱",
  epsi: "ε",
  Epsilon: "Ε",
  epsilon: "ε",
  epsiv: "ϵ",
  eqcirc: "≖",
  eqcolon: "≕",
  eqsim: "≂",
  eqslantgtr: "⪖",
  eqslantless: "⪕",
  Equal: "⩵",
  equals: "=",
  EqualTilde: "≂",
  equest: "≟",
  Equilibrium: "⇌",
  equiv: "≡",
  equivDD: "⩸",
  eqvparsl: "⧥",
  erarr: "⥱",
  erDot: "≓",
  escr: "ℯ",
  Escr: "ℰ",
  esdot: "≐",
  Esim: "⩳",
  esim: "≂",
  Eta: "Η",
  eta: "η",
  ETH: "Ð",
  eth: "ð",
  Euml: "Ë",
  euml: "ë",
  euro: "€",
  excl: "!",
  exist: "∃",
  Exists: "∃",
  expectation: "ℰ",
  exponentiale: "ⅇ",
  ExponentialE: "ⅇ",
  fallingdotseq: "≒",
  Fcy: "Ф",
  fcy: "ф",
  female: "♀",
  ffilig: "ﬃ",
  fflig: "ﬀ",
  ffllig: "ﬄ",
  Ffr: "𝔉",
  ffr: "𝔣",
  filig: "ﬁ",
  FilledSmallSquare: "◼",
  FilledVerySmallSquare: "▪",
  fjlig: "fj",
  flat: "♭",
  fllig: "ﬂ",
  fltns: "▱",
  fnof: "ƒ",
  Fopf: "𝔽",
  fopf: "𝕗",
  forall: "∀",
  ForAll: "∀",
  fork: "⋔",
  forkv: "⫙",
  Fouriertrf: "ℱ",
  fpartint: "⨍",
  frac12: "½",
  frac13: "⅓",
  frac14: "¼",
  frac15: "⅕",
  frac16: "⅙",
  frac18: "⅛",
  frac23: "⅔",
  frac25: "⅖",
  frac34: "¾",
  frac35: "⅗",
  frac38: "⅜",
  frac45: "⅘",
  frac56: "⅚",
  frac58: "⅝",
  frac78: "⅞",
  frasl: "⁄",
  frown: "⌢",
  fscr: "𝒻",
  Fscr: "ℱ",
  gacute: "ǵ",
  Gamma: "Γ",
  gamma: "γ",
  Gammad: "Ϝ",
  gammad: "ϝ",
  gap: "⪆",
  Gbreve: "Ğ",
  gbreve: "ğ",
  Gcedil: "Ģ",
  Gcirc: "Ĝ",
  gcirc: "ĝ",
  Gcy: "Г",
  gcy: "г",
  Gdot: "Ġ",
  gdot: "ġ",
  ge: "≥",
  gE: "≧",
  gEl: "⪌",
  gel: "⋛",
  geq: "≥",
  geqq: "≧",
  geqslant: "⩾",
  gescc: "⪩",
  ges: "⩾",
  gesdot: "⪀",
  gesdoto: "⪂",
  gesdotol: "⪄",
  gesl: "⋛︀",
  gesles: "⪔",
  Gfr: "𝔊",
  gfr: "𝔤",
  gg: "≫",
  Gg: "⋙",
  ggg: "⋙",
  gimel: "ℷ",
  GJcy: "Ѓ",
  gjcy: "ѓ",
  gla: "⪥",
  gl: "≷",
  glE: "⪒",
  glj: "⪤",
  gnap: "⪊",
  gnapprox: "⪊",
  gne: "⪈",
  gnE: "≩",
  gneq: "⪈",
  gneqq: "≩",
  gnsim: "⋧",
  Gopf: "𝔾",
  gopf: "𝕘",
  grave: "`",
  GreaterEqual: "≥",
  GreaterEqualLess: "⋛",
  GreaterFullEqual: "≧",
  GreaterGreater: "⪢",
  GreaterLess: "≷",
  GreaterSlantEqual: "⩾",
  GreaterTilde: "≳",
  Gscr: "𝒢",
  gscr: "ℊ",
  gsim: "≳",
  gsime: "⪎",
  gsiml: "⪐",
  gtcc: "⪧",
  gtcir: "⩺",
  gt: ">",
  GT: ">",
  Gt: "≫",
  gtdot: "⋗",
  gtlPar: "⦕",
  gtquest: "⩼",
  gtrapprox: "⪆",
  gtrarr: "⥸",
  gtrdot: "⋗",
  gtreqless: "⋛",
  gtreqqless: "⪌",
  gtrless: "≷",
  gtrsim: "≳",
  gvertneqq: "≩︀",
  gvnE: "≩︀",
  Hacek: "ˇ",
  hairsp: " ",
  half: "½",
  hamilt: "ℋ",
  HARDcy: "Ъ",
  hardcy: "ъ",
  harrcir: "⥈",
  harr: "↔",
  hArr: "⇔",
  harrw: "↭",
  Hat: "^",
  hbar: "ℏ",
  Hcirc: "Ĥ",
  hcirc: "ĥ",
  hearts: "♥",
  heartsuit: "♥",
  hellip: "…",
  hercon: "⊹",
  hfr: "𝔥",
  Hfr: "ℌ",
  HilbertSpace: "ℋ",
  hksearow: "⤥",
  hkswarow: "⤦",
  hoarr: "⇿",
  homtht: "∻",
  hookleftarrow: "↩",
  hookrightarrow: "↪",
  hopf: "𝕙",
  Hopf: "ℍ",
  horbar: "―",
  HorizontalLine: "─",
  hscr: "𝒽",
  Hscr: "ℋ",
  hslash: "ℏ",
  Hstrok: "Ħ",
  hstrok: "ħ",
  HumpDownHump: "≎",
  HumpEqual: "≏",
  hybull: "⁃",
  hyphen: "‐",
  Iacute: "Í",
  iacute: "í",
  ic: "⁣",
  Icirc: "Î",
  icirc: "î",
  Icy: "И",
  icy: "и",
  Idot: "İ",
  IEcy: "Е",
  iecy: "е",
  iexcl: "¡",
  iff: "⇔",
  ifr: "𝔦",
  Ifr: "ℑ",
  Igrave: "Ì",
  igrave: "ì",
  ii: "ⅈ",
  iiiint: "⨌",
  iiint: "∭",
  iinfin: "⧜",
  iiota: "℩",
  IJlig: "Ĳ",
  ijlig: "ĳ",
  Imacr: "Ī",
  imacr: "ī",
  image: "ℑ",
  ImaginaryI: "ⅈ",
  imagline: "ℐ",
  imagpart: "ℑ",
  imath: "ı",
  Im: "ℑ",
  imof: "⊷",
  imped: "Ƶ",
  Implies: "⇒",
  incare: "℅",
  in: "∈",
  infin: "∞",
  infintie: "⧝",
  inodot: "ı",
  intcal: "⊺",
  int: "∫",
  Int: "∬",
  integers: "ℤ",
  Integral: "∫",
  intercal: "⊺",
  Intersection: "⋂",
  intlarhk: "⨗",
  intprod: "⨼",
  InvisibleComma: "⁣",
  InvisibleTimes: "⁢",
  IOcy: "Ё",
  iocy: "ё",
  Iogon: "Į",
  iogon: "į",
  Iopf: "𝕀",
  iopf: "𝕚",
  Iota: "Ι",
  iota: "ι",
  iprod: "⨼",
  iquest: "¿",
  iscr: "𝒾",
  Iscr: "ℐ",
  isin: "∈",
  isindot: "⋵",
  isinE: "⋹",
  isins: "⋴",
  isinsv: "⋳",
  isinv: "∈",
  it: "⁢",
  Itilde: "Ĩ",
  itilde: "ĩ",
  Iukcy: "І",
  iukcy: "і",
  Iuml: "Ï",
  iuml: "ï",
  Jcirc: "Ĵ",
  jcirc: "ĵ",
  Jcy: "Й",
  jcy: "й",
  Jfr: "𝔍",
  jfr: "𝔧",
  jmath: "ȷ",
  Jopf: "𝕁",
  jopf: "𝕛",
  Jscr: "𝒥",
  jscr: "𝒿",
  Jsercy: "Ј",
  jsercy: "ј",
  Jukcy: "Є",
  jukcy: "є",
  Kappa: "Κ",
  kappa: "κ",
  kappav: "ϰ",
  Kcedil: "Ķ",
  kcedil: "ķ",
  Kcy: "К",
  kcy: "к",
  Kfr: "𝔎",
  kfr: "𝔨",
  kgreen: "ĸ",
  KHcy: "Х",
  khcy: "х",
  KJcy: "Ќ",
  kjcy: "ќ",
  Kopf: "𝕂",
  kopf: "𝕜",
  Kscr: "𝒦",
  kscr: "𝓀",
  lAarr: "⇚",
  Lacute: "Ĺ",
  lacute: "ĺ",
  laemptyv: "⦴",
  lagran: "ℒ",
  Lambda: "Λ",
  lambda: "λ",
  lang: "⟨",
  Lang: "⟪",
  langd: "⦑",
  langle: "⟨",
  lap: "⪅",
  Laplacetrf: "ℒ",
  laquo: "«",
  larrb: "⇤",
  larrbfs: "⤟",
  larr: "←",
  Larr: "↞",
  lArr: "⇐",
  larrfs: "⤝",
  larrhk: "↩",
  larrlp: "↫",
  larrpl: "⤹",
  larrsim: "⥳",
  larrtl: "↢",
  latail: "⤙",
  lAtail: "⤛",
  lat: "⪫",
  late: "⪭",
  lates: "⪭︀",
  lbarr: "⤌",
  lBarr: "⤎",
  lbbrk: "❲",
  lbrace: "{",
  lbrack: "[",
  lbrke: "⦋",
  lbrksld: "⦏",
  lbrkslu: "⦍",
  Lcaron: "Ľ",
  lcaron: "ľ",
  Lcedil: "Ļ",
  lcedil: "ļ",
  lceil: "⌈",
  lcub: "{",
  Lcy: "Л",
  lcy: "л",
  ldca: "⤶",
  ldquo: "“",
  ldquor: "„",
  ldrdhar: "⥧",
  ldrushar: "⥋",
  ldsh: "↲",
  le: "≤",
  lE: "≦",
  LeftAngleBracket: "⟨",
  LeftArrowBar: "⇤",
  leftarrow: "←",
  LeftArrow: "←",
  Leftarrow: "⇐",
  LeftArrowRightArrow: "⇆",
  leftarrowtail: "↢",
  LeftCeiling: "⌈",
  LeftDoubleBracket: "⟦",
  LeftDownTeeVector: "⥡",
  LeftDownVectorBar: "⥙",
  LeftDownVector: "⇃",
  LeftFloor: "⌊",
  leftharpoondown: "↽",
  leftharpoonup: "↼",
  leftleftarrows: "⇇",
  leftrightarrow: "↔",
  LeftRightArrow: "↔",
  Leftrightarrow: "⇔",
  leftrightarrows: "⇆",
  leftrightharpoons: "⇋",
  leftrightsquigarrow: "↭",
  LeftRightVector: "⥎",
  LeftTeeArrow: "↤",
  LeftTee: "⊣",
  LeftTeeVector: "⥚",
  leftthreetimes: "⋋",
  LeftTriangleBar: "⧏",
  LeftTriangle: "⊲",
  LeftTriangleEqual: "⊴",
  LeftUpDownVector: "⥑",
  LeftUpTeeVector: "⥠",
  LeftUpVectorBar: "⥘",
  LeftUpVector: "↿",
  LeftVectorBar: "⥒",
  LeftVector: "↼",
  lEg: "⪋",
  leg: "⋚",
  leq: "≤",
  leqq: "≦",
  leqslant: "⩽",
  lescc: "⪨",
  les: "⩽",
  lesdot: "⩿",
  lesdoto: "⪁",
  lesdotor: "⪃",
  lesg: "⋚︀",
  lesges: "⪓",
  lessapprox: "⪅",
  lessdot: "⋖",
  lesseqgtr: "⋚",
  lesseqqgtr: "⪋",
  LessEqualGreater: "⋚",
  LessFullEqual: "≦",
  LessGreater: "≶",
  lessgtr: "≶",
  LessLess: "⪡",
  lesssim: "≲",
  LessSlantEqual: "⩽",
  LessTilde: "≲",
  lfisht: "⥼",
  lfloor: "⌊",
  Lfr: "𝔏",
  lfr: "𝔩",
  lg: "≶",
  lgE: "⪑",
  lHar: "⥢",
  lhard: "↽",
  lharu: "↼",
  lharul: "⥪",
  lhblk: "▄",
  LJcy: "Љ",
  ljcy: "љ",
  llarr: "⇇",
  ll: "≪",
  Ll: "⋘",
  llcorner: "⌞",
  Lleftarrow: "⇚",
  llhard: "⥫",
  lltri: "◺",
  Lmidot: "Ŀ",
  lmidot: "ŀ",
  lmoustache: "⎰",
  lmoust: "⎰",
  lnap: "⪉",
  lnapprox: "⪉",
  lne: "⪇",
  lnE: "≨",
  lneq: "⪇",
  lneqq: "≨",
  lnsim: "⋦",
  loang: "⟬",
  loarr: "⇽",
  lobrk: "⟦",
  longleftarrow: "⟵",
  LongLeftArrow: "⟵",
  Longleftarrow: "⟸",
  longleftrightarrow: "⟷",
  LongLeftRightArrow: "⟷",
  Longleftrightarrow: "⟺",
  longmapsto: "⟼",
  longrightarrow: "⟶",
  LongRightArrow: "⟶",
  Longrightarrow: "⟹",
  looparrowleft: "↫",
  looparrowright: "↬",
  lopar: "⦅",
  Lopf: "𝕃",
  lopf: "𝕝",
  loplus: "⨭",
  lotimes: "⨴",
  lowast: "∗",
  lowbar: "_",
  LowerLeftArrow: "↙",
  LowerRightArrow: "↘",
  loz: "◊",
  lozenge: "◊",
  lozf: "⧫",
  lpar: "(",
  lparlt: "⦓",
  lrarr: "⇆",
  lrcorner: "⌟",
  lrhar: "⇋",
  lrhard: "⥭",
  lrm: "‎",
  lrtri: "⊿",
  lsaquo: "‹",
  lscr: "𝓁",
  Lscr: "ℒ",
  lsh: "↰",
  Lsh: "↰",
  lsim: "≲",
  lsime: "⪍",
  lsimg: "⪏",
  lsqb: "[",
  lsquo: "‘",
  lsquor: "‚",
  Lstrok: "Ł",
  lstrok: "ł",
  ltcc: "⪦",
  ltcir: "⩹",
  lt: "<",
  LT: "<",
  Lt: "≪",
  ltdot: "⋖",
  lthree: "⋋",
  ltimes: "⋉",
  ltlarr: "⥶",
  ltquest: "⩻",
  ltri: "◃",
  ltrie: "⊴",
  ltrif: "◂",
  ltrPar: "⦖",
  lurdshar: "⥊",
  luruhar: "⥦",
  lvertneqq: "≨︀",
  lvnE: "≨︀",
  macr: "¯",
  male: "♂",
  malt: "✠",
  maltese: "✠",
  Map: "⤅",
  map: "↦",
  mapsto: "↦",
  mapstodown: "↧",
  mapstoleft: "↤",
  mapstoup: "↥",
  marker: "▮",
  mcomma: "⨩",
  Mcy: "М",
  mcy: "м",
  mdash: "—",
  mDDot: "∺",
  measuredangle: "∡",
  MediumSpace: " ",
  Mellintrf: "ℳ",
  Mfr: "𝔐",
  mfr: "𝔪",
  mho: "℧",
  micro: "µ",
  midast: "*",
  midcir: "⫰",
  mid: "∣",
  middot: "·",
  minusb: "⊟",
  minus: "−",
  minusd: "∸",
  minusdu: "⨪",
  MinusPlus: "∓",
  mlcp: "⫛",
  mldr: "…",
  mnplus: "∓",
  models: "⊧",
  Mopf: "𝕄",
  mopf: "𝕞",
  mp: "∓",
  mscr: "𝓂",
  Mscr: "ℳ",
  mstpos: "∾",
  Mu: "Μ",
  mu: "μ",
  multimap: "⊸",
  mumap: "⊸",
  nabla: "∇",
  Nacute: "Ń",
  nacute: "ń",
  nang: "∠⃒",
  nap: "≉",
  napE: "⩰̸",
  napid: "≋̸",
  napos: "ŉ",
  napprox: "≉",
  natural: "♮",
  naturals: "ℕ",
  natur: "♮",
  nbsp: "\xA0",
  nbump: "≎̸",
  nbumpe: "≏̸",
  ncap: "⩃",
  Ncaron: "Ň",
  ncaron: "ň",
  Ncedil: "Ņ",
  ncedil: "ņ",
  ncong: "≇",
  ncongdot: "⩭̸",
  ncup: "⩂",
  Ncy: "Н",
  ncy: "н",
  ndash: "–",
  nearhk: "⤤",
  nearr: "↗",
  neArr: "⇗",
  nearrow: "↗",
  ne: "≠",
  nedot: "≐̸",
  NegativeMediumSpace: "​",
  NegativeThickSpace: "​",
  NegativeThinSpace: "​",
  NegativeVeryThinSpace: "​",
  nequiv: "≢",
  nesear: "⤨",
  nesim: "≂̸",
  NestedGreaterGreater: "≫",
  NestedLessLess: "≪",
  NewLine: "\n",
  nexist: "∄",
  nexists: "∄",
  Nfr: "𝔑",
  nfr: "𝔫",
  ngE: "≧̸",
  nge: "≱",
  ngeq: "≱",
  ngeqq: "≧̸",
  ngeqslant: "⩾̸",
  nges: "⩾̸",
  nGg: "⋙̸",
  ngsim: "≵",
  nGt: "≫⃒",
  ngt: "≯",
  ngtr: "≯",
  nGtv: "≫̸",
  nharr: "↮",
  nhArr: "⇎",
  nhpar: "⫲",
  ni: "∋",
  nis: "⋼",
  nisd: "⋺",
  niv: "∋",
  NJcy: "Њ",
  njcy: "њ",
  nlarr: "↚",
  nlArr: "⇍",
  nldr: "‥",
  nlE: "≦̸",
  nle: "≰",
  nleftarrow: "↚",
  nLeftarrow: "⇍",
  nleftrightarrow: "↮",
  nLeftrightarrow: "⇎",
  nleq: "≰",
  nleqq: "≦̸",
  nleqslant: "⩽̸",
  nles: "⩽̸",
  nless: "≮",
  nLl: "⋘̸",
  nlsim: "≴",
  nLt: "≪⃒",
  nlt: "≮",
  nltri: "⋪",
  nltrie: "⋬",
  nLtv: "≪̸",
  nmid: "∤",
  NoBreak: "⁠",
  NonBreakingSpace: "\xA0",
  nopf: "𝕟",
  Nopf: "ℕ",
  Not: "⫬",
  not: "¬",
  NotCongruent: "≢",
  NotCupCap: "≭",
  NotDoubleVerticalBar: "∦",
  NotElement: "∉",
  NotEqual: "≠",
  NotEqualTilde: "≂̸",
  NotExists: "∄",
  NotGreater: "≯",
  NotGreaterEqual: "≱",
  NotGreaterFullEqual: "≧̸",
  NotGreaterGreater: "≫̸",
  NotGreaterLess: "≹",
  NotGreaterSlantEqual: "⩾̸",
  NotGreaterTilde: "≵",
  NotHumpDownHump: "≎̸",
  NotHumpEqual: "≏̸",
  notin: "∉",
  notindot: "⋵̸",
  notinE: "⋹̸",
  notinva: "∉",
  notinvb: "⋷",
  notinvc: "⋶",
  NotLeftTriangleBar: "⧏̸",
  NotLeftTriangle: "⋪",
  NotLeftTriangleEqual: "⋬",
  NotLess: "≮",
  NotLessEqual: "≰",
  NotLessGreater: "≸",
  NotLessLess: "≪̸",
  NotLessSlantEqual: "⩽̸",
  NotLessTilde: "≴",
  NotNestedGreaterGreater: "⪢̸",
  NotNestedLessLess: "⪡̸",
  notni: "∌",
  notniva: "∌",
  notnivb: "⋾",
  notnivc: "⋽",
  NotPrecedes: "⊀",
  NotPrecedesEqual: "⪯̸",
  NotPrecedesSlantEqual: "⋠",
  NotReverseElement: "∌",
  NotRightTriangleBar: "⧐̸",
  NotRightTriangle: "⋫",
  NotRightTriangleEqual: "⋭",
  NotSquareSubset: "⊏̸",
  NotSquareSubsetEqual: "⋢",
  NotSquareSuperset: "⊐̸",
  NotSquareSupersetEqual: "⋣",
  NotSubset: "⊂⃒",
  NotSubsetEqual: "⊈",
  NotSucceeds: "⊁",
  NotSucceedsEqual: "⪰̸",
  NotSucceedsSlantEqual: "⋡",
  NotSucceedsTilde: "≿̸",
  NotSuperset: "⊃⃒",
  NotSupersetEqual: "⊉",
  NotTilde: "≁",
  NotTildeEqual: "≄",
  NotTildeFullEqual: "≇",
  NotTildeTilde: "≉",
  NotVerticalBar: "∤",
  nparallel: "∦",
  npar: "∦",
  nparsl: "⫽⃥",
  npart: "∂̸",
  npolint: "⨔",
  npr: "⊀",
  nprcue: "⋠",
  nprec: "⊀",
  npreceq: "⪯̸",
  npre: "⪯̸",
  nrarrc: "⤳̸",
  nrarr: "↛",
  nrArr: "⇏",
  nrarrw: "↝̸",
  nrightarrow: "↛",
  nRightarrow: "⇏",
  nrtri: "⋫",
  nrtrie: "⋭",
  nsc: "⊁",
  nsccue: "⋡",
  nsce: "⪰̸",
  Nscr: "𝒩",
  nscr: "𝓃",
  nshortmid: "∤",
  nshortparallel: "∦",
  nsim: "≁",
  nsime: "≄",
  nsimeq: "≄",
  nsmid: "∤",
  nspar: "∦",
  nsqsube: "⋢",
  nsqsupe: "⋣",
  nsub: "⊄",
  nsubE: "⫅̸",
  nsube: "⊈",
  nsubset: "⊂⃒",
  nsubseteq: "⊈",
  nsubseteqq: "⫅̸",
  nsucc: "⊁",
  nsucceq: "⪰̸",
  nsup: "⊅",
  nsupE: "⫆̸",
  nsupe: "⊉",
  nsupset: "⊃⃒",
  nsupseteq: "⊉",
  nsupseteqq: "⫆̸",
  ntgl: "≹",
  Ntilde: "Ñ",
  ntilde: "ñ",
  ntlg: "≸",
  ntriangleleft: "⋪",
  ntrianglelefteq: "⋬",
  ntriangleright: "⋫",
  ntrianglerighteq: "⋭",
  Nu: "Ν",
  nu: "ν",
  num: "#",
  numero: "№",
  numsp: " ",
  nvap: "≍⃒",
  nvdash: "⊬",
  nvDash: "⊭",
  nVdash: "⊮",
  nVDash: "⊯",
  nvge: "≥⃒",
  nvgt: ">⃒",
  nvHarr: "⤄",
  nvinfin: "⧞",
  nvlArr: "⤂",
  nvle: "≤⃒",
  nvlt: "<⃒",
  nvltrie: "⊴⃒",
  nvrArr: "⤃",
  nvrtrie: "⊵⃒",
  nvsim: "∼⃒",
  nwarhk: "⤣",
  nwarr: "↖",
  nwArr: "⇖",
  nwarrow: "↖",
  nwnear: "⤧",
  Oacute: "Ó",
  oacute: "ó",
  oast: "⊛",
  Ocirc: "Ô",
  ocirc: "ô",
  ocir: "⊚",
  Ocy: "О",
  ocy: "о",
  odash: "⊝",
  Odblac: "Ő",
  odblac: "ő",
  odiv: "⨸",
  odot: "⊙",
  odsold: "⦼",
  OElig: "Œ",
  oelig: "œ",
  ofcir: "⦿",
  Ofr: "𝔒",
  ofr: "𝔬",
  ogon: "˛",
  Ograve: "Ò",
  ograve: "ò",
  ogt: "⧁",
  ohbar: "⦵",
  ohm: "Ω",
  oint: "∮",
  olarr: "↺",
  olcir: "⦾",
  olcross: "⦻",
  oline: "‾",
  olt: "⧀",
  Omacr: "Ō",
  omacr: "ō",
  Omega: "Ω",
  omega: "ω",
  Omicron: "Ο",
  omicron: "ο",
  omid: "⦶",
  ominus: "⊖",
  Oopf: "𝕆",
  oopf: "𝕠",
  opar: "⦷",
  OpenCurlyDoubleQuote: "“",
  OpenCurlyQuote: "‘",
  operp: "⦹",
  oplus: "⊕",
  orarr: "↻",
  Or: "⩔",
  or: "∨",
  ord: "⩝",
  order: "ℴ",
  orderof: "ℴ",
  ordf: "ª",
  ordm: "º",
  origof: "⊶",
  oror: "⩖",
  orslope: "⩗",
  orv: "⩛",
  oS: "Ⓢ",
  Oscr: "𝒪",
  oscr: "ℴ",
  Oslash: "Ø",
  oslash: "ø",
  osol: "⊘",
  Otilde: "Õ",
  otilde: "õ",
  otimesas: "⨶",
  Otimes: "⨷",
  otimes: "⊗",
  Ouml: "Ö",
  ouml: "ö",
  ovbar: "⌽",
  OverBar: "‾",
  OverBrace: "⏞",
  OverBracket: "⎴",
  OverParenthesis: "⏜",
  para: "¶",
  parallel: "∥",
  par: "∥",
  parsim: "⫳",
  parsl: "⫽",
  part: "∂",
  PartialD: "∂",
  Pcy: "П",
  pcy: "п",
  percnt: "%",
  period: ".",
  permil: "‰",
  perp: "⊥",
  pertenk: "‱",
  Pfr: "𝔓",
  pfr: "𝔭",
  Phi: "Φ",
  phi: "φ",
  phiv: "ϕ",
  phmmat: "ℳ",
  phone: "☎",
  Pi: "Π",
  pi: "π",
  pitchfork: "⋔",
  piv: "ϖ",
  planck: "ℏ",
  planckh: "ℎ",
  plankv: "ℏ",
  plusacir: "⨣",
  plusb: "⊞",
  pluscir: "⨢",
  plus: "+",
  plusdo: "∔",
  plusdu: "⨥",
  pluse: "⩲",
  PlusMinus: "±",
  plusmn: "±",
  plussim: "⨦",
  plustwo: "⨧",
  pm: "±",
  Poincareplane: "ℌ",
  pointint: "⨕",
  popf: "𝕡",
  Popf: "ℙ",
  pound: "£",
  prap: "⪷",
  Pr: "⪻",
  pr: "≺",
  prcue: "≼",
  precapprox: "⪷",
  prec: "≺",
  preccurlyeq: "≼",
  Precedes: "≺",
  PrecedesEqual: "⪯",
  PrecedesSlantEqual: "≼",
  PrecedesTilde: "≾",
  preceq: "⪯",
  precnapprox: "⪹",
  precneqq: "⪵",
  precnsim: "⋨",
  pre: "⪯",
  prE: "⪳",
  precsim: "≾",
  prime: "′",
  Prime: "″",
  primes: "ℙ",
  prnap: "⪹",
  prnE: "⪵",
  prnsim: "⋨",
  prod: "∏",
  Product: "∏",
  profalar: "⌮",
  profline: "⌒",
  profsurf: "⌓",
  prop: "∝",
  Proportional: "∝",
  Proportion: "∷",
  propto: "∝",
  prsim: "≾",
  prurel: "⊰",
  Pscr: "𝒫",
  pscr: "𝓅",
  Psi: "Ψ",
  psi: "ψ",
  puncsp: " ",
  Qfr: "𝔔",
  qfr: "𝔮",
  qint: "⨌",
  qopf: "𝕢",
  Qopf: "ℚ",
  qprime: "⁗",
  Qscr: "𝒬",
  qscr: "𝓆",
  quaternions: "ℍ",
  quatint: "⨖",
  quest: "?",
  questeq: "≟",
  quot: "\"",
  QUOT: "\"",
  rAarr: "⇛",
  race: "∽̱",
  Racute: "Ŕ",
  racute: "ŕ",
  radic: "√",
  raemptyv: "⦳",
  rang: "⟩",
  Rang: "⟫",
  rangd: "⦒",
  range: "⦥",
  rangle: "⟩",
  raquo: "»",
  rarrap: "⥵",
  rarrb: "⇥",
  rarrbfs: "⤠",
  rarrc: "⤳",
  rarr: "→",
  Rarr: "↠",
  rArr: "⇒",
  rarrfs: "⤞",
  rarrhk: "↪",
  rarrlp: "↬",
  rarrpl: "⥅",
  rarrsim: "⥴",
  Rarrtl: "⤖",
  rarrtl: "↣",
  rarrw: "↝",
  ratail: "⤚",
  rAtail: "⤜",
  ratio: "∶",
  rationals: "ℚ",
  rbarr: "⤍",
  rBarr: "⤏",
  RBarr: "⤐",
  rbbrk: "❳",
  rbrace: "}",
  rbrack: "]",
  rbrke: "⦌",
  rbrksld: "⦎",
  rbrkslu: "⦐",
  Rcaron: "Ř",
  rcaron: "ř",
  Rcedil: "Ŗ",
  rcedil: "ŗ",
  rceil: "⌉",
  rcub: "}",
  Rcy: "Р",
  rcy: "р",
  rdca: "⤷",
  rdldhar: "⥩",
  rdquo: "”",
  rdquor: "”",
  rdsh: "↳",
  real: "ℜ",
  realine: "ℛ",
  realpart: "ℜ",
  reals: "ℝ",
  Re: "ℜ",
  rect: "▭",
  reg: "®",
  REG: "®",
  ReverseElement: "∋",
  ReverseEquilibrium: "⇋",
  ReverseUpEquilibrium: "⥯",
  rfisht: "⥽",
  rfloor: "⌋",
  rfr: "𝔯",
  Rfr: "ℜ",
  rHar: "⥤",
  rhard: "⇁",
  rharu: "⇀",
  rharul: "⥬",
  Rho: "Ρ",
  rho: "ρ",
  rhov: "ϱ",
  RightAngleBracket: "⟩",
  RightArrowBar: "⇥",
  rightarrow: "→",
  RightArrow: "→",
  Rightarrow: "⇒",
  RightArrowLeftArrow: "⇄",
  rightarrowtail: "↣",
  RightCeiling: "⌉",
  RightDoubleBracket: "⟧",
  RightDownTeeVector: "⥝",
  RightDownVectorBar: "⥕",
  RightDownVector: "⇂",
  RightFloor: "⌋",
  rightharpoondown: "⇁",
  rightharpoonup: "⇀",
  rightleftarrows: "⇄",
  rightleftharpoons: "⇌",
  rightrightarrows: "⇉",
  rightsquigarrow: "↝",
  RightTeeArrow: "↦",
  RightTee: "⊢",
  RightTeeVector: "⥛",
  rightthreetimes: "⋌",
  RightTriangleBar: "⧐",
  RightTriangle: "⊳",
  RightTriangleEqual: "⊵",
  RightUpDownVector: "⥏",
  RightUpTeeVector: "⥜",
  RightUpVectorBar: "⥔",
  RightUpVector: "↾",
  RightVectorBar: "⥓",
  RightVector: "⇀",
  ring: "˚",
  risingdotseq: "≓",
  rlarr: "⇄",
  rlhar: "⇌",
  rlm: "‏",
  rmoustache: "⎱",
  rmoust: "⎱",
  rnmid: "⫮",
  roang: "⟭",
  roarr: "⇾",
  robrk: "⟧",
  ropar: "⦆",
  ropf: "𝕣",
  Ropf: "ℝ",
  roplus: "⨮",
  rotimes: "⨵",
  RoundImplies: "⥰",
  rpar: ")",
  rpargt: "⦔",
  rppolint: "⨒",
  rrarr: "⇉",
  Rrightarrow: "⇛",
  rsaquo: "›",
  rscr: "𝓇",
  Rscr: "ℛ",
  rsh: "↱",
  Rsh: "↱",
  rsqb: "]",
  rsquo: "’",
  rsquor: "’",
  rthree: "⋌",
  rtimes: "⋊",
  rtri: "▹",
  rtrie: "⊵",
  rtrif: "▸",
  rtriltri: "⧎",
  RuleDelayed: "⧴",
  ruluhar: "⥨",
  rx: "℞",
  Sacute: "Ś",
  sacute: "ś",
  sbquo: "‚",
  scap: "⪸",
  Scaron: "Š",
  scaron: "š",
  Sc: "⪼",
  sc: "≻",
  sccue: "≽",
  sce: "⪰",
  scE: "⪴",
  Scedil: "Ş",
  scedil: "ş",
  Scirc: "Ŝ",
  scirc: "ŝ",
  scnap: "⪺",
  scnE: "⪶",
  scnsim: "⋩",
  scpolint: "⨓",
  scsim: "≿",
  Scy: "С",
  scy: "с",
  sdotb: "⊡",
  sdot: "⋅",
  sdote: "⩦",
  searhk: "⤥",
  searr: "↘",
  seArr: "⇘",
  searrow: "↘",
  sect: "§",
  semi: ";",
  seswar: "⤩",
  setminus: "∖",
  setmn: "∖",
  sext: "✶",
  Sfr: "𝔖",
  sfr: "𝔰",
  sfrown: "⌢",
  sharp: "♯",
  SHCHcy: "Щ",
  shchcy: "щ",
  SHcy: "Ш",
  shcy: "ш",
  ShortDownArrow: "↓",
  ShortLeftArrow: "←",
  shortmid: "∣",
  shortparallel: "∥",
  ShortRightArrow: "→",
  ShortUpArrow: "↑",
  shy: "­",
  Sigma: "Σ",
  sigma: "σ",
  sigmaf: "ς",
  sigmav: "ς",
  sim: "∼",
  simdot: "⩪",
  sime: "≃",
  simeq: "≃",
  simg: "⪞",
  simgE: "⪠",
  siml: "⪝",
  simlE: "⪟",
  simne: "≆",
  simplus: "⨤",
  simrarr: "⥲",
  slarr: "←",
  SmallCircle: "∘",
  smallsetminus: "∖",
  smashp: "⨳",
  smeparsl: "⧤",
  smid: "∣",
  smile: "⌣",
  smt: "⪪",
  smte: "⪬",
  smtes: "⪬︀",
  SOFTcy: "Ь",
  softcy: "ь",
  solbar: "⌿",
  solb: "⧄",
  sol: "/",
  Sopf: "𝕊",
  sopf: "𝕤",
  spades: "♠",
  spadesuit: "♠",
  spar: "∥",
  sqcap: "⊓",
  sqcaps: "⊓︀",
  sqcup: "⊔",
  sqcups: "⊔︀",
  Sqrt: "√",
  sqsub: "⊏",
  sqsube: "⊑",
  sqsubset: "⊏",
  sqsubseteq: "⊑",
  sqsup: "⊐",
  sqsupe: "⊒",
  sqsupset: "⊐",
  sqsupseteq: "⊒",
  square: "□",
  Square: "□",
  SquareIntersection: "⊓",
  SquareSubset: "⊏",
  SquareSubsetEqual: "⊑",
  SquareSuperset: "⊐",
  SquareSupersetEqual: "⊒",
  SquareUnion: "⊔",
  squarf: "▪",
  squ: "□",
  squf: "▪",
  srarr: "→",
  Sscr: "𝒮",
  sscr: "𝓈",
  ssetmn: "∖",
  ssmile: "⌣",
  sstarf: "⋆",
  Star: "⋆",
  star: "☆",
  starf: "★",
  straightepsilon: "ϵ",
  straightphi: "ϕ",
  strns: "¯",
  sub: "⊂",
  Sub: "⋐",
  subdot: "⪽",
  subE: "⫅",
  sube: "⊆",
  subedot: "⫃",
  submult: "⫁",
  subnE: "⫋",
  subne: "⊊",
  subplus: "⪿",
  subrarr: "⥹",
  subset: "⊂",
  Subset: "⋐",
  subseteq: "⊆",
  subseteqq: "⫅",
  SubsetEqual: "⊆",
  subsetneq: "⊊",
  subsetneqq: "⫋",
  subsim: "⫇",
  subsub: "⫕",
  subsup: "⫓",
  succapprox: "⪸",
  succ: "≻",
  succcurlyeq: "≽",
  Succeeds: "≻",
  SucceedsEqual: "⪰",
  SucceedsSlantEqual: "≽",
  SucceedsTilde: "≿",
  succeq: "⪰",
  succnapprox: "⪺",
  succneqq: "⪶",
  succnsim: "⋩",
  succsim: "≿",
  SuchThat: "∋",
  sum: "∑",
  Sum: "∑",
  sung: "♪",
  sup1: "¹",
  sup2: "²",
  sup3: "³",
  sup: "⊃",
  Sup: "⋑",
  supdot: "⪾",
  supdsub: "⫘",
  supE: "⫆",
  supe: "⊇",
  supedot: "⫄",
  Superset: "⊃",
  SupersetEqual: "⊇",
  suphsol: "⟉",
  suphsub: "⫗",
  suplarr: "⥻",
  supmult: "⫂",
  supnE: "⫌",
  supne: "⊋",
  supplus: "⫀",
  supset: "⊃",
  Supset: "⋑",
  supseteq: "⊇",
  supseteqq: "⫆",
  supsetneq: "⊋",
  supsetneqq: "⫌",
  supsim: "⫈",
  supsub: "⫔",
  supsup: "⫖",
  swarhk: "⤦",
  swarr: "↙",
  swArr: "⇙",
  swarrow: "↙",
  swnwar: "⤪",
  szlig: "ß",
  Tab: "	",
  target: "⌖",
  Tau: "Τ",
  tau: "τ",
  tbrk: "⎴",
  Tcaron: "Ť",
  tcaron: "ť",
  Tcedil: "Ţ",
  tcedil: "ţ",
  Tcy: "Т",
  tcy: "т",
  tdot: "⃛",
  telrec: "⌕",
  Tfr: "𝔗",
  tfr: "𝔱",
  there4: "∴",
  therefore: "∴",
  Therefore: "∴",
  Theta: "Θ",
  theta: "θ",
  thetasym: "ϑ",
  thetav: "ϑ",
  thickapprox: "≈",
  thicksim: "∼",
  ThickSpace: "  ",
  ThinSpace: " ",
  thinsp: " ",
  thkap: "≈",
  thksim: "∼",
  THORN: "Þ",
  thorn: "þ",
  tilde: "˜",
  Tilde: "∼",
  TildeEqual: "≃",
  TildeFullEqual: "≅",
  TildeTilde: "≈",
  timesbar: "⨱",
  timesb: "⊠",
  times: "×",
  timesd: "⨰",
  tint: "∭",
  toea: "⤨",
  topbot: "⌶",
  topcir: "⫱",
  top: "⊤",
  Topf: "𝕋",
  topf: "𝕥",
  topfork: "⫚",
  tosa: "⤩",
  tprime: "‴",
  trade: "™",
  TRADE: "™",
  triangle: "▵",
  triangledown: "▿",
  triangleleft: "◃",
  trianglelefteq: "⊴",
  triangleq: "≜",
  triangleright: "▹",
  trianglerighteq: "⊵",
  tridot: "◬",
  trie: "≜",
  triminus: "⨺",
  TripleDot: "⃛",
  triplus: "⨹",
  trisb: "⧍",
  tritime: "⨻",
  trpezium: "⏢",
  Tscr: "𝒯",
  tscr: "𝓉",
  TScy: "Ц",
  tscy: "ц",
  TSHcy: "Ћ",
  tshcy: "ћ",
  Tstrok: "Ŧ",
  tstrok: "ŧ",
  twixt: "≬",
  twoheadleftarrow: "↞",
  twoheadrightarrow: "↠",
  Uacute: "Ú",
  uacute: "ú",
  uarr: "↑",
  Uarr: "↟",
  uArr: "⇑",
  Uarrocir: "⥉",
  Ubrcy: "Ў",
  ubrcy: "ў",
  Ubreve: "Ŭ",
  ubreve: "ŭ",
  Ucirc: "Û",
  ucirc: "û",
  Ucy: "У",
  ucy: "у",
  udarr: "⇅",
  Udblac: "Ű",
  udblac: "ű",
  udhar: "⥮",
  ufisht: "⥾",
  Ufr: "𝔘",
  ufr: "𝔲",
  Ugrave: "Ù",
  ugrave: "ù",
  uHar: "⥣",
  uharl: "↿",
  uharr: "↾",
  uhblk: "▀",
  ulcorn: "⌜",
  ulcorner: "⌜",
  ulcrop: "⌏",
  ultri: "◸",
  Umacr: "Ū",
  umacr: "ū",
  uml: "¨",
  UnderBar: "_",
  UnderBrace: "⏟",
  UnderBracket: "⎵",
  UnderParenthesis: "⏝",
  Union: "⋃",
  UnionPlus: "⊎",
  Uogon: "Ų",
  uogon: "ų",
  Uopf: "𝕌",
  uopf: "𝕦",
  UpArrowBar: "⤒",
  uparrow: "↑",
  UpArrow: "↑",
  Uparrow: "⇑",
  UpArrowDownArrow: "⇅",
  updownarrow: "↕",
  UpDownArrow: "↕",
  Updownarrow: "⇕",
  UpEquilibrium: "⥮",
  upharpoonleft: "↿",
  upharpoonright: "↾",
  uplus: "⊎",
  UpperLeftArrow: "↖",
  UpperRightArrow: "↗",
  upsi: "υ",
  Upsi: "ϒ",
  upsih: "ϒ",
  Upsilon: "Υ",
  upsilon: "υ",
  UpTeeArrow: "↥",
  UpTee: "⊥",
  upuparrows: "⇈",
  urcorn: "⌝",
  urcorner: "⌝",
  urcrop: "⌎",
  Uring: "Ů",
  uring: "ů",
  urtri: "◹",
  Uscr: "𝒰",
  uscr: "𝓊",
  utdot: "⋰",
  Utilde: "Ũ",
  utilde: "ũ",
  utri: "▵",
  utrif: "▴",
  uuarr: "⇈",
  Uuml: "Ü",
  uuml: "ü",
  uwangle: "⦧",
  vangrt: "⦜",
  varepsilon: "ϵ",
  varkappa: "ϰ",
  varnothing: "∅",
  varphi: "ϕ",
  varpi: "ϖ",
  varpropto: "∝",
  varr: "↕",
  vArr: "⇕",
  varrho: "ϱ",
  varsigma: "ς",
  varsubsetneq: "⊊︀",
  varsubsetneqq: "⫋︀",
  varsupsetneq: "⊋︀",
  varsupsetneqq: "⫌︀",
  vartheta: "ϑ",
  vartriangleleft: "⊲",
  vartriangleright: "⊳",
  vBar: "⫨",
  Vbar: "⫫",
  vBarv: "⫩",
  Vcy: "В",
  vcy: "в",
  vdash: "⊢",
  vDash: "⊨",
  Vdash: "⊩",
  VDash: "⊫",
  Vdashl: "⫦",
  veebar: "⊻",
  vee: "∨",
  Vee: "⋁",
  veeeq: "≚",
  vellip: "⋮",
  verbar: "|",
  Verbar: "‖",
  vert: "|",
  Vert: "‖",
  VerticalBar: "∣",
  VerticalLine: "|",
  VerticalSeparator: "❘",
  VerticalTilde: "≀",
  VeryThinSpace: " ",
  Vfr: "𝔙",
  vfr: "𝔳",
  vltri: "⊲",
  vnsub: "⊂⃒",
  vnsup: "⊃⃒",
  Vopf: "𝕍",
  vopf: "𝕧",
  vprop: "∝",
  vrtri: "⊳",
  Vscr: "𝒱",
  vscr: "𝓋",
  vsubnE: "⫋︀",
  vsubne: "⊊︀",
  vsupnE: "⫌︀",
  vsupne: "⊋︀",
  Vvdash: "⊪",
  vzigzag: "⦚",
  Wcirc: "Ŵ",
  wcirc: "ŵ",
  wedbar: "⩟",
  wedge: "∧",
  Wedge: "⋀",
  wedgeq: "≙",
  weierp: "℘",
  Wfr: "𝔚",
  wfr: "𝔴",
  Wopf: "𝕎",
  wopf: "𝕨",
  wp: "℘",
  wr: "≀",
  wreath: "≀",
  Wscr: "𝒲",
  wscr: "𝓌",
  xcap: "⋂",
  xcirc: "◯",
  xcup: "⋃",
  xdtri: "▽",
  Xfr: "𝔛",
  xfr: "𝔵",
  xharr: "⟷",
  xhArr: "⟺",
  Xi: "Ξ",
  xi: "ξ",
  xlarr: "⟵",
  xlArr: "⟸",
  xmap: "⟼",
  xnis: "⋻",
  xodot: "⨀",
  Xopf: "𝕏",
  xopf: "𝕩",
  xoplus: "⨁",
  xotime: "⨂",
  xrarr: "⟶",
  xrArr: "⟹",
  Xscr: "𝒳",
  xscr: "𝓍",
  xsqcup: "⨆",
  xuplus: "⨄",
  xutri: "△",
  xvee: "⋁",
  xwedge: "⋀",
  Yacute: "Ý",
  yacute: "ý",
  YAcy: "Я",
  yacy: "я",
  Ycirc: "Ŷ",
  ycirc: "ŷ",
  Ycy: "Ы",
  ycy: "ы",
  yen: "¥",
  Yfr: "𝔜",
  yfr: "𝔶",
  YIcy: "Ї",
  yicy: "ї",
  Yopf: "𝕐",
  yopf: "𝕪",
  Yscr: "𝒴",
  yscr: "𝓎",
  YUcy: "Ю",
  yucy: "ю",
  yuml: "ÿ",
  Yuml: "Ÿ",
  Zacute: "Ź",
  zacute: "ź",
  Zcaron: "Ž",
  zcaron: "ž",
  Zcy: "З",
  zcy: "з",
  Zdot: "Ż",
  zdot: "ż",
  zeetrf: "ℨ",
  ZeroWidthSpace: "​",
  Zeta: "Ζ",
  zeta: "ζ",
  zfr: "𝔷",
  Zfr: "ℨ",
  ZHcy: "Ж",
  zhcy: "ж",
  zigrarr: "⇝",
  zopf: "𝕫",
  Zopf: "ℤ",
  Zscr: "𝒵",
  zscr: "𝓏",
  zwj: "‍",
  zwnj: "‌"
};
//#endregion
//#region src/entity-parser.ts
const HEXCHARCODE = /^#[xX]([A-Fa-f0-9]+)$/;
const CHARCODE = /^#([0-9]+)$/;
const NAMED = /^([A-Za-z0-9]+)$/;
const C1_REPLACEMENTS = {
  128: 8364,
  130: 8218,
  131: 402,
  132: 8222,
  133: 8230,
  134: 8224,
  135: 8225,
  136: 710,
  137: 8240,
  138: 352,
  139: 8249,
  140: 338,
  142: 381,
  145: 8216,
  146: 8217,
  147: 8220,
  148: 8221,
  149: 8226,
  150: 8211,
  151: 8212,
  152: 732,
  153: 8482,
  154: 353,
  155: 8250,
  156: 339,
  158: 382,
  159: 376
};
var EntityParser = class {
  named;
  constructor(named) {
    this.named = named;
  }
  parse(entity) {
    if (!entity) return;
    let matches = entity.match(HEXCHARCODE);
    if (matches) return decodeNumericCharRef(parseInt(matches[1], 16));
    matches = entity.match(CHARCODE);
    if (matches) return decodeNumericCharRef(parseInt(matches[1], 10));
    matches = entity.match(NAMED);
    if (matches) return this.named[matches[1]];
  }
};
function decodeNumericCharRef(codePoint) {
  if (codePoint === 0 || codePoint > 1114111 || codePoint >= 55296 && codePoint <= 57343) return "�";
  return String.fromCodePoint(C1_REPLACEMENTS[codePoint] || codePoint);
}
//#endregion
//#region src/utils.ts
const WSP = /[\t\n\f ]/;
const CRLF = /\r\n?/g;
function isSpace$1(char) {
  return WSP.test(char);
}
function preprocessInput(input) {
  return input.replace(CRLF, "\n");
}
//#endregion
//#region src/evented-tokenizer.ts
var EventedTokenizer = class {
  delegate;
  entityParser;
  mode;
  state = "beforeData";
  line = -1;
  column = -1;
  input = "";
  index = -1;
  tagNameBuffer = "";
  constructor(delegate, entityParser, mode = "precompile") {
    this.delegate = delegate;
    this.entityParser = entityParser;
    this.mode = mode;
    this.reset();
  }
  reset() {
    this.transitionTo("beforeData");
    this.input = "";
    this.tagNameBuffer = "";
    this.index = 0;
    this.line = 1;
    this.column = 0;
    this.delegate.reset();
  }
  transitionTo(state) {
    this.state = state;
  }
  tokenize(input) {
    this.reset();
    this.tokenizePart(input);
    this.tokenizeEOF();
  }
  tokenizePart(input) {
    this.input += preprocessInput(input);
    while (this.index < this.input.length) {
      let handler = this.states[this.state];
      if (handler !== void 0) handler.call(this);else throw new Error(`unhandled state ${this.state}`);
    }
  }
  tokenizeEOF() {
    this.flushData();
  }
  flushData() {
    if (this.state === "data") {
      this.delegate.finishData();
      this.transitionTo("beforeData");
    }
  }
  peek() {
    return this.input.charAt(this.index);
  }
  consume() {
    let char = this.peek();
    this.index++;
    if (char === "\n") {
      this.line++;
      this.column = 0;
    } else this.column++;
    return char;
  }
  consumeCharRef() {
    let endIndex = this.input.indexOf(";", this.index);
    if (endIndex === -1) return;
    let entity = this.input.slice(this.index, endIndex);
    let chars = this.entityParser.parse(entity);
    if (chars) {
      let count = entity.length;
      while (count) {
        this.consume();
        count--;
      }
      this.consume();
      return chars;
    }
  }
  markTagStart() {
    this.delegate.tagOpen();
  }
  appendToTagName(char) {
    this.tagNameBuffer += char;
    this.delegate.appendToTagName(char);
  }
  isIgnoredEndTag() {
    let tag = this.tagNameBuffer;
    return tag === "title" && this.input.substring(this.index, this.index + 8) !== "</title>" || tag === "style" && this.input.substring(this.index, this.index + 8) !== "</style>" || tag === "script" && this.input.substring(this.index, this.index + 9) !== "<\/script>";
  }
  states = {
    beforeData() {
      let char = this.peek();
      if (char === "<" && !this.isIgnoredEndTag()) {
        this.transitionTo("tagOpen");
        this.markTagStart();
        this.consume();
      } else {
        if (this.mode === "precompile" && char === "\n") {
          let tag = this.tagNameBuffer.toLowerCase();
          if (tag === "pre" || tag === "textarea") this.consume();
        }
        this.transitionTo("data");
        this.delegate.beginData();
      }
    },
    data() {
      let char = this.peek();
      let tag = this.tagNameBuffer;
      if (char === "<" && !this.isIgnoredEndTag()) {
        this.delegate.finishData();
        this.transitionTo("tagOpen");
        this.markTagStart();
        this.consume();
      } else if (char === "&" && tag !== "script" && tag !== "style") {
        this.consume();
        this.delegate.appendToData(this.consumeCharRef() || "&");
      } else {
        this.consume();
        this.delegate.appendToData(char);
      }
    },
    tagOpen() {
      let char = this.consume();
      if (char === "!") this.transitionTo("markupDeclarationOpen");else if (char === "/") this.transitionTo("endTagOpen");else if (!isSpace$1(char)) {
        this.transitionTo("tagName");
        this.tagNameBuffer = "";
        this.delegate.beginStartTag();
        this.appendToTagName(char);
      }
    },
    markupDeclarationOpen() {
      let char = this.consume();
      if (char === "-" && this.peek() === "-") {
        this.consume();
        this.transitionTo("commentStart");
        this.delegate.beginComment();
      } else if (char.toUpperCase() + this.input.substring(this.index, this.index + 6).toUpperCase() === "DOCTYPE") {
        this.consume();
        this.consume();
        this.consume();
        this.consume();
        this.consume();
        this.consume();
        this.transitionTo("doctype");
        if (this.delegate.beginDoctype) this.delegate.beginDoctype();
      }
    },
    doctype() {
      if (isSpace$1(this.consume())) this.transitionTo("beforeDoctypeName");
    },
    beforeDoctypeName() {
      let char = this.consume();
      if (isSpace$1(char)) return;else {
        this.transitionTo("doctypeName");
        if (this.delegate.appendToDoctypeName) this.delegate.appendToDoctypeName(char.toLowerCase());
      }
    },
    doctypeName() {
      let char = this.consume();
      if (isSpace$1(char)) this.transitionTo("afterDoctypeName");else if (char === ">") {
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      } else if (this.delegate.appendToDoctypeName) this.delegate.appendToDoctypeName(char.toLowerCase());
    },
    afterDoctypeName() {
      let char = this.consume();
      if (isSpace$1(char)) return;else if (char === ">") {
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      } else {
        let nextSixChars = char.toUpperCase() + this.input.substring(this.index, this.index + 5).toUpperCase();
        let isPublic = nextSixChars.toUpperCase() === "PUBLIC";
        let isSystem = nextSixChars.toUpperCase() === "SYSTEM";
        if (isPublic || isSystem) {
          this.consume();
          this.consume();
          this.consume();
          this.consume();
          this.consume();
          this.consume();
        }
        if (isPublic) this.transitionTo("afterDoctypePublicKeyword");else if (isSystem) this.transitionTo("afterDoctypeSystemKeyword");
      }
    },
    afterDoctypePublicKeyword() {
      let char = this.peek();
      if (isSpace$1(char)) {
        this.transitionTo("beforeDoctypePublicIdentifier");
        this.consume();
      } else if (char === "\"") {
        this.transitionTo("doctypePublicIdentifierDoubleQuoted");
        this.consume();
      } else if (char === "'") {
        this.transitionTo("doctypePublicIdentifierSingleQuoted");
        this.consume();
      } else if (char === ">") {
        this.consume();
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      }
    },
    doctypePublicIdentifierDoubleQuoted() {
      let char = this.consume();
      if (char === "\"") this.transitionTo("afterDoctypePublicIdentifier");else if (char === ">") {
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      } else if (this.delegate.appendToDoctypePublicIdentifier) this.delegate.appendToDoctypePublicIdentifier(char);
    },
    doctypePublicIdentifierSingleQuoted() {
      let char = this.consume();
      if (char === "'") this.transitionTo("afterDoctypePublicIdentifier");else if (char === ">") {
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      } else if (this.delegate.appendToDoctypePublicIdentifier) this.delegate.appendToDoctypePublicIdentifier(char);
    },
    afterDoctypePublicIdentifier() {
      let char = this.consume();
      if (isSpace$1(char)) this.transitionTo("betweenDoctypePublicAndSystemIdentifiers");else if (char === ">") {
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      } else if (char === "\"") this.transitionTo("doctypeSystemIdentifierDoubleQuoted");else if (char === "'") this.transitionTo("doctypeSystemIdentifierSingleQuoted");
    },
    betweenDoctypePublicAndSystemIdentifiers() {
      let char = this.consume();
      if (isSpace$1(char)) return;else if (char === ">") {
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      } else if (char === "\"") this.transitionTo("doctypeSystemIdentifierDoubleQuoted");else if (char === "'") this.transitionTo("doctypeSystemIdentifierSingleQuoted");
    },
    doctypeSystemIdentifierDoubleQuoted() {
      let char = this.consume();
      if (char === "\"") this.transitionTo("afterDoctypeSystemIdentifier");else if (char === ">") {
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      } else if (this.delegate.appendToDoctypeSystemIdentifier) this.delegate.appendToDoctypeSystemIdentifier(char);
    },
    doctypeSystemIdentifierSingleQuoted() {
      let char = this.consume();
      if (char === "'") this.transitionTo("afterDoctypeSystemIdentifier");else if (char === ">") {
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      } else if (this.delegate.appendToDoctypeSystemIdentifier) this.delegate.appendToDoctypeSystemIdentifier(char);
    },
    afterDoctypeSystemIdentifier() {
      let char = this.consume();
      if (isSpace$1(char)) return;else if (char === ">") {
        if (this.delegate.endDoctype) this.delegate.endDoctype();
        this.transitionTo("beforeData");
      }
    },
    commentStart() {
      let char = this.consume();
      if (char === "-") this.transitionTo("commentStartDash");else if (char === ">") {
        this.delegate.finishComment();
        this.transitionTo("beforeData");
      } else {
        this.delegate.appendToCommentData(char);
        this.transitionTo("comment");
      }
    },
    commentStartDash() {
      let char = this.consume();
      if (char === "-") this.transitionTo("commentEnd");else if (char === ">") {
        this.delegate.finishComment();
        this.transitionTo("beforeData");
      } else {
        this.delegate.appendToCommentData("-");
        this.transitionTo("comment");
      }
    },
    comment() {
      let char = this.consume();
      if (char === "-") this.transitionTo("commentEndDash");else this.delegate.appendToCommentData(char);
    },
    commentEndDash() {
      let char = this.consume();
      if (char === "-") this.transitionTo("commentEnd");else {
        this.delegate.appendToCommentData("-" + char);
        this.transitionTo("comment");
      }
    },
    commentEnd() {
      let char = this.consume();
      if (char === ">") {
        this.delegate.finishComment();
        this.transitionTo("beforeData");
      } else {
        this.delegate.appendToCommentData("--" + char);
        this.transitionTo("comment");
      }
    },
    tagName() {
      let char = this.consume();
      if (isSpace$1(char)) this.transitionTo("beforeAttributeName");else if (char === "/") this.transitionTo("selfClosingStartTag");else if (char === ">") {
        this.delegate.finishTag();
        this.transitionTo("beforeData");
      } else this.appendToTagName(char);
    },
    endTagName() {
      let char = this.consume();
      if (isSpace$1(char)) {
        this.transitionTo("beforeAttributeName");
        this.tagNameBuffer = "";
      } else if (char === "/") {
        this.transitionTo("selfClosingStartTag");
        this.tagNameBuffer = "";
      } else if (char === ">") {
        this.delegate.finishTag();
        this.transitionTo("beforeData");
        this.tagNameBuffer = "";
      } else this.appendToTagName(char);
    },
    beforeAttributeName() {
      let char = this.peek();
      if (isSpace$1(char)) {
        this.consume();
        return;
      } else if (char === "/") {
        this.transitionTo("selfClosingStartTag");
        this.consume();
      } else if (char === ">") {
        this.consume();
        this.delegate.finishTag();
        this.transitionTo("beforeData");
      } else if (char === "=") {
        this.delegate.reportSyntaxError("attribute name cannot start with equals sign");
        this.transitionTo("attributeName");
        this.delegate.beginAttribute();
        this.consume();
        this.delegate.appendToAttributeName(char);
      } else {
        this.transitionTo("attributeName");
        this.delegate.beginAttribute();
      }
    },
    attributeName() {
      let char = this.peek();
      if (isSpace$1(char)) {
        this.transitionTo("afterAttributeName");
        this.consume();
      } else if (char === "/") {
        this.delegate.beginAttributeValue(false);
        this.delegate.finishAttributeValue();
        this.consume();
        this.transitionTo("selfClosingStartTag");
      } else if (char === "=") {
        this.transitionTo("beforeAttributeValue");
        this.consume();
      } else if (char === ">") {
        this.delegate.beginAttributeValue(false);
        this.delegate.finishAttributeValue();
        this.consume();
        this.delegate.finishTag();
        this.transitionTo("beforeData");
      } else if (char === "\"" || char === "'" || char === "<") {
        this.delegate.reportSyntaxError(char + " is not a valid character within attribute names");
        this.consume();
        this.delegate.appendToAttributeName(char);
      } else {
        this.consume();
        this.delegate.appendToAttributeName(char);
      }
    },
    afterAttributeName() {
      let char = this.peek();
      if (isSpace$1(char)) {
        this.consume();
        return;
      } else if (char === "/") {
        this.delegate.beginAttributeValue(false);
        this.delegate.finishAttributeValue();
        this.consume();
        this.transitionTo("selfClosingStartTag");
      } else if (char === "=") {
        this.consume();
        this.transitionTo("beforeAttributeValue");
      } else if (char === ">") {
        this.delegate.beginAttributeValue(false);
        this.delegate.finishAttributeValue();
        this.consume();
        this.delegate.finishTag();
        this.transitionTo("beforeData");
      } else {
        this.delegate.beginAttributeValue(false);
        this.delegate.finishAttributeValue();
        this.transitionTo("attributeName");
        this.delegate.beginAttribute();
        this.consume();
        this.delegate.appendToAttributeName(char);
      }
    },
    beforeAttributeValue() {
      let char = this.peek();
      if (isSpace$1(char)) this.consume();else if (char === "\"") {
        this.transitionTo("attributeValueDoubleQuoted");
        this.delegate.beginAttributeValue(true);
        this.consume();
      } else if (char === "'") {
        this.transitionTo("attributeValueSingleQuoted");
        this.delegate.beginAttributeValue(true);
        this.consume();
      } else if (char === ">") {
        this.delegate.beginAttributeValue(false);
        this.delegate.finishAttributeValue();
        this.consume();
        this.delegate.finishTag();
        this.transitionTo("beforeData");
      } else {
        this.transitionTo("attributeValueUnquoted");
        this.delegate.beginAttributeValue(false);
        this.consume();
        this.delegate.appendToAttributeValue(char);
      }
    },
    attributeValueDoubleQuoted() {
      let char = this.consume();
      if (char === "\"") {
        this.delegate.finishAttributeValue();
        this.transitionTo("afterAttributeValueQuoted");
      } else if (char === "&") this.delegate.appendToAttributeValue(this.consumeCharRef() || "&");else this.delegate.appendToAttributeValue(char);
    },
    attributeValueSingleQuoted() {
      let char = this.consume();
      if (char === "'") {
        this.delegate.finishAttributeValue();
        this.transitionTo("afterAttributeValueQuoted");
      } else if (char === "&") this.delegate.appendToAttributeValue(this.consumeCharRef() || "&");else this.delegate.appendToAttributeValue(char);
    },
    attributeValueUnquoted() {
      let char = this.peek();
      if (isSpace$1(char)) {
        this.delegate.finishAttributeValue();
        this.consume();
        this.transitionTo("beforeAttributeName");
      } else if (char === "/") {
        this.delegate.finishAttributeValue();
        this.consume();
        this.transitionTo("selfClosingStartTag");
      } else if (char === "&") {
        this.consume();
        this.delegate.appendToAttributeValue(this.consumeCharRef() || "&");
      } else if (char === ">") {
        this.delegate.finishAttributeValue();
        this.consume();
        this.delegate.finishTag();
        this.transitionTo("beforeData");
      } else {
        this.consume();
        this.delegate.appendToAttributeValue(char);
      }
    },
    afterAttributeValueQuoted() {
      let char = this.peek();
      if (isSpace$1(char)) {
        this.consume();
        this.transitionTo("beforeAttributeName");
      } else if (char === "/") {
        this.consume();
        this.transitionTo("selfClosingStartTag");
      } else if (char === ">") {
        this.consume();
        this.delegate.finishTag();
        this.transitionTo("beforeData");
      } else this.transitionTo("beforeAttributeName");
    },
    selfClosingStartTag() {
      if (this.peek() === ">") {
        this.consume();
        this.delegate.markTagAsSelfClosing();
        this.delegate.finishTag();
        this.transitionTo("beforeData");
      } else this.transitionTo("beforeAttributeName");
    },
    endTagOpen() {
      let char = this.consume();
      if (!isSpace$1(char)) {
        this.transitionTo("endTagName");
        this.tagNameBuffer = "";
        this.delegate.beginEndTag();
        this.appendToTagName(char);
      }
    }
  };
};

const UNKNOWN_POSITION = Object.freeze({
  line: 1,
  column: 0
});
const SYNTHETIC_LOCATION = Object.freeze({
  source: '(synthetic)',
  start: UNKNOWN_POSITION,
  end: UNKNOWN_POSITION
});
const NON_EXISTENT_LOCATION = Object.freeze({
  source: '(nonexistent)',
  start: UNKNOWN_POSITION,
  end: UNKNOWN_POSITION
});
const BROKEN_LOCATION = Object.freeze({
  source: '(broken)',
  start: UNKNOWN_POSITION,
  end: UNKNOWN_POSITION
});

/**
 * We have already computed the character position of this offset or span.
 */

const CHAR_OFFSET_KIND = 'CharPosition';
/**
 * This offset or span was instantiated with a Handlebars SourcePosition or SourceLocation. Its
 * character position will be computed on demand.
 */

const HBS_POSITION_KIND = 'HbsPosition';
/**
 * for (rare) situations where a node is created but there was no source location (e.g. the name
 * "default" in default blocks when the word "default" never appeared in source). This is used
 * by the internals when there is a legitimate reason for the internals to synthesize a node
 * with no location.
 */

const INTERNAL_SYNTHETIC_KIND = 'InternalsSynthetic';

/**
 * For situations where a node represents zero parts of the source (for example, empty arguments).
 * In general, we attempt to assign these nodes *some* position (empty arguments can be
 * positioned immediately after the callee), but it's not always possible
 */

const NON_EXISTENT_KIND = 'NonExistent';

/**
 * For situations where a source location was expected, but it didn't correspond to the node in
 * the source. This happens if a plugin creates broken locations.
 */

const BROKEN_KIND = 'Broken';

/**
 * These kinds  describe spans that don't have a concrete location in the original source.
 */

function isInvisible(kind) {
  return kind !== CHAR_OFFSET_KIND && kind !== HBS_POSITION_KIND;
}

/**
 * This file implements the DSL used by span and offset in places where they need to exhaustively
 * consider all combinations of states (Handlebars offsets, character offsets and invisible/broken
 * offsets).
 *
 * It's probably overkill, but it makes the code that uses it clear. It could be refactored or
 * removed.
 */

const MatchAny = 'MATCH_ANY';
const IsInvisible = 'IS_INVISIBLE';
class WhenList {
  _whens;
  constructor(/** @type {any[]} */ whens) {
    /** @type {any[]} */ this._whens = whens;
  }
  first(/** @type {string} */ kind) {
    for (const when of this._whens) {
      const value = when.match(kind);
      if (isPresentArray(value)) {
        return value[0];
      }
    }
    return null;
  }
}
class When {
  _map = new Map();
  /** @returns {When} */ get(/** @type {string} */ pattern, or) {
    let value = this._map.get(pattern);
    if (value) {
      return value;
    }
    value = or();
    this._map.set(pattern, value);
    return value;
  }
  add(/** @type {string} */ pattern, out) {
    this._map.set(pattern, out);
  }
  /** @returns {any[]} */ match(/** @type {string} */ kind) {
    const pattern = patternFor(kind);
    const out = [];
    const exact = this._map.get(pattern);
    const fallback = this._map.get(MatchAny);
    if (exact) {
      out.push(exact);
    }
    if (fallback) {
      out.push(fallback);
    }
    return out;
  }
}
/** @returns {(left: any, right: any) => any} */ function match(/** @type {(m: Matcher) => Matcher} */ callback) {
  return callback(new Matcher()).validate();
}
class Matcher {
  _whens = new When();

  /**
   * You didn't exhaustively match all possibilities.
   */
  validate() {
    return (/** @type {HbsPosition | CharPosition} */ left, /** @type {HbsPosition | CharPosition} */ right) => this.matchFor(left.kind, right.kind)(left, right);
  }
  matchFor(/** @type {string} */ left, /** @type {string} */ right) {
    const nesteds = this._whens.match(left);
    assert(isPresentArray(nesteds));
    const callback = new WhenList(nesteds).first(right);
    return callback;
  }

  // This big block is the bulk of the heavy lifting in this file. It facilitates exhaustiveness
  // checking so that matchers can ensure they've actually covered all the cases (and TypeScript
  // will treat it as an exhaustive match).

  when(left, right,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  callback) {
    this._whens.get(left, () => new When()).add(right, callback);
    return this;
  }
}
function patternFor(kind) {
  switch (kind) {
    case BROKEN_KIND:
    case INTERNAL_SYNTHETIC_KIND:
    case NON_EXISTENT_KIND:
      return IsInvisible;
    default:
      return kind;
  }
}

/**
 * This constant exists to make it easier to differentiate normal logs from
 * errant console.logs. LOCAL_LOGGER should only be used inside a
 * LOCAL_TRACE_LOGGING check.
 *
 * It does not alleviate the need to check LOCAL_TRACE_LOGGING, which is used
 * for stripping.
 */

/**
 * This constant exists to make it easier to differentiate normal logs from
 * errant console.logs. LOGGER can be used outside of LOCAL_TRACE_LOGGING checks,
 * and is meant to be used in the rare situation where a console.* call is
 * actually appropriate.
 */
const LOGGER = console;

function unwrap(val) {
  return val;
}
function expect(val, message) {
  return val;
}

function dict() {
  return Object.create(null);
}

function assertNever(value, desc = 'unexpected unreachable branch') {
  LOGGER.log('unreachable', value);
  LOGGER.log(`${desc} :: ${JSON.stringify(value)} (${value})`);
  throw new Error(`code reached unreachable`);
}

class SourceSlice {
  /** @returns {SourceSlice} */ static synthetic(chars) {
    let offsets = SourceSpan.synthetic(chars);
    return new SourceSlice({
      loc: offsets,
      chars: chars
    });
  }
  /** @returns {SourceSlice} */ static load(/** @type {Source} */ source, slice) {
    return new SourceSlice({
      loc: SourceSpan.load(source, slice[1]),
      chars: slice[0]
    });
  }
  chars;
  loc;
  constructor(options) {
    this.loc = options.loc;
    this.chars = options.chars;
  }
  /** @returns {string} */ getString() {
    return this.chars;
  }
  serialize() {
    return [this.chars, this.loc.serialize()];
  }
}

/**
 * All spans have these details in common.
 */

/**
 * A `SourceSpan` object represents a span of characters inside of a template source.
 *
 * There are three kinds of `SourceSpan` objects:
 *
 * - `ConcreteSourceSpan`, which contains byte offsets
 * - `LazySourceSpan`, which contains `SourceLocation`s from the Handlebars AST, which can be
 *   converted to byte offsets on demand.
 * - `InvisibleSourceSpan`, which represent source strings that aren't present in the source,
 *   because:
 *     - they were created synthetically
 *     - their location is nonsensical (the span is broken)
 *     - they represent nothing in the source (this currently happens only when a bug in the
 *       upstream Handlebars parser fails to assign a location to empty blocks)
 *
 * At a high level, all `SourceSpan` objects provide:
 *
 * - byte offsets
 * - source in column and line format
 *
 * And you can do these operations on `SourceSpan`s:
 *
 * - collapse it to a `SourceSpan` representing its starting or ending position
 * - slice out some characters, optionally skipping some characters at the beginning or end
 * - create a new `SourceSpan` with a different starting or ending offset
 *
 * All SourceSpan objects implement `SourceLocation`, for compatibility. All SourceSpan
 * objects have a `toJSON` that emits `SourceLocation`, also for compatibility.
 *
 * For compatibility, subclasses of `AbstractSourceSpan` must implement `locDidUpdate`, which
 * happens when an AST plugin attempts to modify the `start` or `end` of a span directly.
 *
 * The goal is to avoid creating any problems for use-cases like AST Explorer.
 */
class SourceSpan {
  static get NON_EXISTENT() {
    return new InvisibleSpan(NON_EXISTENT_KIND, NON_EXISTENT_LOCATION).wrap();
  }
  /** @returns {SourceSpan} */ static load(/** @type {Source} */ source, serialized) {
    if (typeof serialized === 'number') {
      return SourceSpan.forCharPositions(source, serialized, serialized);
    } else if (typeof serialized === 'string') {
      return SourceSpan.synthetic(serialized);
    } else if (Array.isArray(serialized)) {
      return SourceSpan.forCharPositions(source, serialized[0], serialized[1]);
    } else if (serialized === NON_EXISTENT_KIND) {
      return SourceSpan.NON_EXISTENT;
    } else if (serialized === BROKEN_KIND) {
      return SourceSpan.broken(BROKEN_LOCATION);
    }
    assertNever(serialized);
  }
  /** @returns {SourceSpan} */ static forHbsLoc(/** @type {Source} */ source, loc) {
    const start = new HbsPosition(source, loc.start);
    const end = new HbsPosition(source, loc.end);
    return new HbsSpan(source, {
      start,
      end
    }, loc).wrap();
  }
  /** @returns {SourceSpan} */ static forCharPositions(/** @type {Source} */ source, /** @type {number} */ startPos, /** @type {number} */ endPos) {
    const start = new CharPosition(source, startPos);
    const end = new CharPosition(source, endPos);
    return new CharPositionSpan(source, {
      start,
      end
    }).wrap();
  }
  /** @returns {SourceSpan} */ static synthetic(/** @type {string} */ chars) {
    return new InvisibleSpan(INTERNAL_SYNTHETIC_KIND, NON_EXISTENT_LOCATION, chars).wrap();
  }
  /** @returns {SourceSpan} */ static broken(pos = BROKEN_LOCATION) {
    return new InvisibleSpan(BROKEN_KIND, pos).wrap();
  }
  isInvisible;
  constructor(/** @type {CharPositionSpan | HbsSpan | InvisibleSpan} */ data) {
    this.data = data;
    this.isInvisible = isInvisible(data.kind);
  }
  /** @returns {SourceOffset} */ getStart() {
    return this.data.getStart().wrap();
  }
  /** @returns {SourceOffset} */ getEnd() {
    return this.data.getEnd().wrap();
  }
  get loc() {
    const span = this.data.toHbsSpan();
    return span === null ? BROKEN_LOCATION : span.toHbsLoc();
  }
  /** @returns {string} */ get module() {
    return this.data.getModule();
  }

  /**
   * Get the starting `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
   */
  get startPosition() {
    return this.loc.start;
  }

  /**
   * Get the ending `SourcePosition` for this `SourceSpan`, lazily computing it if needed.
   */
  get endPosition() {
    return this.loc.end;
  }

  /**
   * Support converting ASTv1 nodes into a serialized format using JSON.stringify.
   */
  toJSON() {
    return this.loc;
  }

  /**
   * Create a new span with the current span's end and a new beginning.
   */
  withStart(other) {
    return span(other.data, this.data.getEnd());
  }

  /**
   * Create a new span with the current span's beginning and a new ending.
   */
  withEnd(other) {
    return span(this.data.getStart(), other.data);
  }
  /** @returns {string} */ asString() {
    return this.data.asString();
  }

  /**
   * Convert this `SourceSpan` into a `SourceSlice`.
   */
  toSlice(expected) {
    const chars = this.data.asString();
    assert(expected === undefined || expected === chars, `unexpectedly found ${JSON.stringify(chars)} when slicing source, ` + `but expected ${JSON.stringify(expected)}`);
    return new SourceSlice({
      loc: this,
      chars: expected || chars
    });
  }

  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use startPosition instead
   */
  get start() {
    return this.loc.start;
  }

  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use withStart instead
   */
  set start(position) {
    this.data.locDidUpdate({
      start: position
    });
  }

  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use endPosition instead
   */
  get end() {
    return this.loc.end;
  }

  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use withEnd instead
   */
  set end(position) {
    this.data.locDidUpdate({
      end: position
    });
  }

  /**
   * For compatibility with SourceLocation in AST plugins
   *
   * @deprecated use module instead
   */
  get source() {
    return this.module;
  }
  /** @returns {SourceSpan} */ collapse(/** @type {string} */ where) {
    switch (where) {
      case 'start':
        return this.getStart().collapsed();
      case 'end':
        return this.getEnd().collapsed();
    }
  }
  /** @returns {SourceSpan} */ extend(/** @type {SourceSpan} */ other) {
    return span(this.data.getStart(), other.data.getEnd());
  }
  serialize() {
    return this.data.serialize();
  }
  slice({
    skipStart = 0,
    skipEnd = 0
  }) {
    return span(this.getStart().move(skipStart).data, this.getEnd().move(-skipEnd).data);
  }
  sliceStartChars({
    skipStart = 0,
    chars
  }) {
    return span(this.getStart().move(skipStart).data, this.getStart().move(skipStart + chars).data);
  }
  sliceEndChars({
    skipEnd = 0,
    chars
  }) {
    return span(this.getEnd().move(skipEnd - chars).data, this.getStart().move(-skipEnd).data);
  }
}
class CharPositionSpan {
  kind = CHAR_OFFSET_KIND;
  #locPosSpan = null;
  constructor(/** @type {Source} */ source, /** @type {CharPositions} */ charPositions) {
    this.source = source;
    this.charPositions = charPositions;
  }
  /** @returns {SourceSpan} */ wrap() {
    return new SourceSpan(this);
  }
  /** @returns {string} */ asString() {
    return this.source.slice(this.charPositions.start.charPos, this.charPositions.end.charPos);
  }
  /** @returns {string} */ getModule() {
    return this.source.module;
  }
  /** @returns {CharPosition} */ getStart() {
    return this.charPositions.start;
  }
  /** @returns {CharPosition} */ getEnd() {
    return this.charPositions.end;
  }
  locDidUpdate() {
  }
  /** @returns {HbsSpan | null} */ toHbsSpan() {
    let locPosSpan = this.#locPosSpan;
    if (locPosSpan === null) {
      const start = this.charPositions.start.toHbsPos();
      const end = this.charPositions.end.toHbsPos();
      if (start === null || end === null) {
        locPosSpan = this.#locPosSpan = BROKEN;
      } else {
        locPosSpan = this.#locPosSpan = new HbsSpan(this.source, {
          start,
          end
        });
      }
    }
    return locPosSpan === BROKEN ? null : locPosSpan;
  }
  serialize() {
    const {
      start: {
        charPos: start
      },
      end: {
        charPos: end
      }
    } = this.charPositions;
    if (start === end) {
      return start;
    } else {
      return [start, end];
    }
  }
  /** @returns {CharPositionSpan} */ toCharPosSpan() {
    return this;
  }
}
class HbsSpan {
  kind = HBS_POSITION_KIND;
  #charPosSpan = null;

  // the source location from Handlebars + AST Plugins -- could be wrong
  #providedHbsLoc;
  constructor(/** @type {Source} */ source, /** @type {HbsPositions} */ hbsPositions, providedHbsLoc = null) {
    this.source = source;
    this.hbsPositions = hbsPositions;
    this.#providedHbsLoc = providedHbsLoc;
  }
  serialize() {
    const charPos = this.toCharPosSpan();
    return charPos === null ? BROKEN_KIND : charPos.wrap().serialize();
  }
  /** @returns {SourceSpan} */ wrap() {
    return new SourceSpan(this);
  }
  updateProvided(pos, edge) {
    if (this.#providedHbsLoc) {
      this.#providedHbsLoc[edge] = pos;
    }

    // invalidate computed character offsets
    this.#charPosSpan = null;
    this.#providedHbsLoc = {
      start: pos,
      end: pos
    };
  }
  locDidUpdate({
    start,
    end
  }) {
    if (start !== undefined) {
      this.updateProvided(start, 'start');
      this.hbsPositions.start = new HbsPosition(this.source, start, null);
    }
    if (end !== undefined) {
      this.updateProvided(end, 'end');
      this.hbsPositions.end = new HbsPosition(this.source, end, null);
    }
  }
  /** @returns {string} */ asString() {
    const span = this.toCharPosSpan();
    return span === null ? '' : span.asString();
  }
  /** @returns {string} */ getModule() {
    return this.source.module;
  }
  /** @returns {HbsPosition} */ getStart() {
    return this.hbsPositions.start;
  }
  /** @returns {HbsPosition} */ getEnd() {
    return this.hbsPositions.end;
  }
  toHbsLoc() {
    return {
      start: this.hbsPositions.start.hbsPos,
      end: this.hbsPositions.end.hbsPos
    };
  }
  /** @returns {HbsSpan} */ toHbsSpan() {
    return this;
  }
  /** @returns {CharPositionSpan | null} */ toCharPosSpan() {
    let charPosSpan = this.#charPosSpan;
    if (charPosSpan === null) {
      const start = this.hbsPositions.start.toCharPos();
      const end = this.hbsPositions.end.toCharPos();
      if (start && end) {
        charPosSpan = this.#charPosSpan = new CharPositionSpan(this.source, {
          start,
          end
        });
      } else {
        charPosSpan = this.#charPosSpan = BROKEN;
        return null;
      }
    }
    return charPosSpan === BROKEN ? null : charPosSpan;
  }
}
class InvisibleSpan {
  constructor(kind,
  // whatever was provided, possibly broken
  loc,
  // if the span represents a synthetic string
  /** @type {undefined | null | string} */ string = null) {
    this.kind = kind;
    this.loc = loc;
    this.string = string;
  }
  serialize() {
    switch (this.kind) {
      case BROKEN_KIND:
      case NON_EXISTENT_KIND:
        return this.kind;
      case INTERNAL_SYNTHETIC_KIND:
        return this.string || '';
    }
  }
  /** @returns {SourceSpan} */ wrap() {
    return new SourceSpan(this);
  }
  /** @returns {string} */ asString() {
    return this.string || '';
  }
  locDidUpdate({
    start,
    end
  }) {
    if (start !== undefined) {
      this.loc.start = start;
    }
    if (end !== undefined) {
      this.loc.end = end;
    }
  }
  /** @returns {string} */ getModule() {
    // TODO: Make this reflect the actual module this span originated from
    return 'an unknown module';
  }
  /** @returns {InvisiblePosition} */ getStart() {
    return new InvisiblePosition(this.kind, this.loc.start);
  }
  /** @returns {InvisiblePosition} */ getEnd() {
    return new InvisiblePosition(this.kind, this.loc.end);
  }
  /** @returns {InvisibleSpan} */ toCharPosSpan() {
    return this;
  }
  /** @returns {null} */ toHbsSpan() {
    return null;
  }
  toHbsLoc() {
    return BROKEN_LOCATION;
  }
}
const span = match(m => m.when(HBS_POSITION_KIND, HBS_POSITION_KIND, (left, right) => new HbsSpan(left.source, {
  start: left,
  end: right
}).wrap()).when(CHAR_OFFSET_KIND, CHAR_OFFSET_KIND, (left, right) => new CharPositionSpan(left.source, {
  start: left,
  end: right
}).wrap()).when(CHAR_OFFSET_KIND, HBS_POSITION_KIND, (left, right) => {
  const rightCharPos = right.toCharPos();
  if (rightCharPos === null) {
    return new InvisibleSpan(BROKEN_KIND, BROKEN_LOCATION).wrap();
  } else {
    return span(left, rightCharPos);
  }
}).when(HBS_POSITION_KIND, CHAR_OFFSET_KIND, (left, right) => {
  const leftCharPos = left.toCharPos();
  if (leftCharPos === null) {
    return new InvisibleSpan(BROKEN_KIND, BROKEN_LOCATION).wrap();
  } else {
    return span(leftCharPos, right);
  }
}).when(IsInvisible, MatchAny, left => new InvisibleSpan(left.kind, BROKEN_LOCATION).wrap()).when(MatchAny, IsInvisible, (_, right) => new InvisibleSpan(right.kind, BROKEN_LOCATION).wrap()));

// `string` includes NON_EXISTENT_KIND and BROKEN_KIND

/**
 * All positions have these details in common. Most notably, all three kinds of positions can
 * must be able to attempt to convert themselves into {@see CharPosition}.
 */

/**
 * Used to indicate that an attempt to convert a `SourcePosition` to a character offset failed. It
 * is separate from `null` so that `null` can be used to indicate that the computation wasn't yet
 * attempted (and therefore to cache the failure)
 */
const BROKEN = 'BROKEN';
/**
 * A `SourceOffset` represents a single position in the source.
 *
 * There are three kinds of backing data for `SourceOffset` objects:
 *
 * - `CharPosition`, which contains a character offset into the raw source string
 * - `HbsPosition`, which contains a `SourcePosition` from the Handlebars AST, which can be
 *   converted to a `CharPosition` on demand.
 * - `InvisiblePosition`, which represents a position not in source (@see {InvisiblePosition})
 */
class SourceOffset {
  /**
   * Create a `SourceOffset` from a Handlebars `SourcePosition`. It's stored as-is, and converted
   * into a character offset on demand, which avoids unnecessarily computing the offset of every
   * `SourceLocation`, but also means that broken `SourcePosition`s are not always detected.
   */
  static forHbsPos(/** @type {Source} */ source, pos) {
    return new HbsPosition(source, pos, null).wrap();
  }

  /**
   * Create a `SourceOffset` that corresponds to a broken `SourcePosition`. This means that the
   * calling code determined (or knows) that the `SourceLocation` doesn't correspond correctly to
   * any part of the source.
   */
  static broken(pos = UNKNOWN_POSITION) {
    return new InvisiblePosition(BROKEN_KIND, pos).wrap();
  }
  constructor(/** @type {HbsPosition | CharPosition | InvisiblePosition} */ data) {
    /** @type {HbsPosition | CharPosition | InvisiblePosition} */ this.data = data;
  }

  /**
   * Get the character offset for this `SourceOffset`, if possible.
   * @returns {number | null}
   */
  get offset() {
    const charPos = this.data.toCharPos();
    return charPos === null ? null : charPos.offset;
  }

  /**
   * Compare this offset with another one.
   *
   * If both offsets are `HbsPosition`s, they're equivalent as long as their lines and columns are
   * the same. This avoids computing offsets unnecessarily.
   *
   * Otherwise, two `SourceOffset`s are equivalent if their successfully computed character offsets
   * are the same.
   */
  eql(right) {
    return eql(this.data, right.data);
  }

  /**
   * Create a span that starts from this source offset and ends with another source offset. Avoid
   * computing character offsets if both `SourceOffset`s are still lazy.
   * @returns {SourceSpan}
   */
  until(/** @type {SourceOffset} */ other) {
    return span(this.data, other.data);
  }

  /**
   * Create a `SourceOffset` by moving the character position represented by this source offset
   * forward or backward (if `by` is negative), if possible.
   *
   * If this `SourceOffset` can't compute a valid character offset, `move` returns a broken offset.
   *
   * If the resulting character offset is less than 0 or greater than the size of the source, `move`
   * returns a broken offset.
   * @returns {SourceOffset}
   */
  move(/** @type {number} */ by) {
    const charPos = this.data.toCharPos();
    if (charPos === null) {
      return SourceOffset.broken();
    } else {
      const result = charPos.offset + by;
      if (charPos.source.validate(result)) {
        return new CharPosition(charPos.source, result).wrap();
      } else {
        return SourceOffset.broken();
      }
    }
  }

  /**
   * Create a new `SourceSpan` that represents a collapsed range at this source offset. Avoid
   * computing the character offset if it has not already been computed.
   * @returns {SourceSpan}
   */
  collapsed() {
    return span(this.data, this.data);
  }

  /**
   * Convert this `SourceOffset` into a Handlebars {@see SourcePosition} for compatibility with
   * existing plugins.
   */
  toJSON() {
    return this.data.toJSON();
  }
}
class CharPosition {
  kind = CHAR_OFFSET_KIND;

  /** Computed from char offset */
  _locPos = null;
  constructor(source, charPos) {
    this.source = source;
    this.charPos = charPos;
  }

  /**
   * This is already a `CharPosition`.
   *
   * {@see HbsPosition} for the alternative.
   * @returns {CharPosition}
   */
  toCharPos() {
    return this;
  }

  /**
   * Produce a Handlebars {@see SourcePosition} for this `CharPosition`. If this `CharPosition` was
   * computed using {@see SourceOffset#move}, this will compute the `SourcePosition` for the offset.
   */
  toJSON() {
    const hbs = this.toHbsPos();
    return hbs === null ? UNKNOWN_POSITION : hbs.toJSON();
  }
  /** @returns {SourceOffset} */ wrap() {
    return new SourceOffset(this);
  }

  /**
   * A `CharPosition` always has an offset it can produce without any additional computation.
   * @returns {number}
   */
  get offset() {
    return this.charPos;
  }

  /**
   * Convert the current character offset to an `HbsPosition`, if it was not already computed. Once
   * a `CharPosition` has computed its `HbsPosition`, it will not need to do compute it again, and
   * the same `CharPosition` is retained when used as one of the ends of a `SourceSpan`, so
   * computing the `HbsPosition` should be a one-time operation.
   * @returns {HbsPosition | null}
   */
  toHbsPos() {
    let locPos = this._locPos;
    if (locPos === null) {
      const hbsPos = this.source.hbsPosFor(this.charPos);
      if (hbsPos === null) {
        this._locPos = locPos = BROKEN;
      } else {
        this._locPos = locPos = new HbsPosition(this.source, hbsPos, this.charPos);
      }
    }
    return locPos === BROKEN ? null : locPos;
  }
}
class HbsPosition {
  kind = HBS_POSITION_KIND;
  _charPos;
  constructor(/** @type {Source} */ source, /** @type {SourcePosition} */ hbsPos, /** @type {undefined | null | number} */ charPos = null) {
    this.source = source;
    this.hbsPos = hbsPos;
    this._charPos = charPos === null ? null : new CharPosition(source, charPos);
  }

  /**
   * Lazily compute the character offset from the {@see SourcePosition}. Once an `HbsPosition` has
   * computed its `CharPosition`, it will not need to do compute it again, and the same
   * `HbsPosition` is retained when used as one of the ends of a `SourceSpan`, so computing the
   * `CharPosition` should be a one-time operation.
   * @returns {CharPosition | null}
   */
  toCharPos() {
    let charPos = this._charPos;
    if (charPos === null) {
      const charPosNumber = this.source.charPosFor(this.hbsPos);
      if (charPosNumber === null) {
        this._charPos = charPos = BROKEN;
      } else {
        this._charPos = charPos = new CharPosition(this.source, charPosNumber);
      }
    }
    return charPos === BROKEN ? null : charPos;
  }

  /**
   * Return the {@see SourcePosition} that this `HbsPosition` was instantiated with. This operation
   * does not need to compute anything.
   */
  toJSON() {
    return this.hbsPos;
  }
  /** @returns {SourceOffset} */ wrap() {
    return new SourceOffset(this);
  }

  /**
   * This is already an `HbsPosition`.
   *
   * {@see CharPosition} for the alternative.
   */
  toHbsPos() {
    return this;
  }
}
class InvisiblePosition {
  constructor(kind,
  // whatever was provided, possibly broken
  pos) {
    this.kind = kind;
    this.pos = pos;
  }

  /**
   * A broken position cannot be turned into a {@see CharacterPosition}.
   */
  toCharPos() {
    return null;
  }

  /**
   * The serialization of an `InvisiblePosition is whatever Handlebars {@see SourcePosition} was
   * originally identified as broken, non-existent or synthetic.
   *
   * If an `InvisiblePosition` never had an source offset at all, this method returns
   * {@see UNKNOWN_POSITION} for compatibility.
   */
  toJSON() {
    return this.pos;
  }
  /** @returns {SourceOffset} */ wrap() {
    return new SourceOffset(this);
  }
  get offset() {
    return null;
  }
}

/**
 * Compare two {@see AnyPosition} and determine whether they are equal.
 *
 * @see {SourceOffset#eql}
 */
const eql = match(m => m.when(HBS_POSITION_KIND, HBS_POSITION_KIND, ({
  hbsPos: left
}, {
  hbsPos: right
}) => left.column === right.column && left.line === right.line).when(CHAR_OFFSET_KIND, CHAR_OFFSET_KIND, ({
  charPos: left
}, {
  charPos: right
}) => left === right).when(CHAR_OFFSET_KIND, HBS_POSITION_KIND, ({
  offset: left
}, right) => left === right.toCharPos()?.offset).when(HBS_POSITION_KIND, CHAR_OFFSET_KIND, (left, {
  offset: right
}) => left.toCharPos()?.offset === right).when(MatchAny, MatchAny, () => false));

/**
 * An object branded with a local debug type has special local trace logging
 * behavior.
 *
 * If `LOCAL_DEBUG` is `false`, this function does nothing (and is removed
 * by the minifier in builder).
 */

function setLocalDebugType(type, ...brand) {
}

class Source {
  /** @returns {Source} */ static from(/** @type {string} */ source, options = {}) {
    return new Source(source, options.meta?.moduleName);
  }

  /** Char offset of each `\n` in the source. */
  #newlineOffsets;
  constructor(/** @type {string} */ source, /** @type {undefined | string} */ module = 'an unknown module') {
    this.source = source;
    this.module = module;
    setLocalDebugType('syntax:source', this);
    this.#newlineOffsets = computeNewlineOffsets(source);
  }

  /**
   * Validate that the character offset represents a position in the source string.
   * @returns {boolean}
   */
  validate(/** @type {number} */ offset) {
    return offset >= 0 && offset <= this.source.length;
  }
  /** @returns {string} */ slice(/** @type {number} */ start, /** @type {number} */ end) {
    return this.source.slice(start, end);
  }
  /** @returns {SourceOffset} */ offsetFor(/** @type {number} */ line, /** @type {number} */ column) {
    return SourceOffset.forHbsPos(this, {
      line,
      column
    });
  }
  spanFor({
    start,
    end
  }) {
    return SourceSpan.forHbsLoc(this, {
      start: {
        line: start.line,
        column: start.column
      },
      end: {
        line: end.line,
        column: end.column
      }
    });
  }
  /** @returns {SourcePosition | null} */ hbsPosFor(/** @type {number} */ offset) {
    if (offset < 0 || offset > this.source.length) return null;
    const lineIdx = lowerBound(this.#newlineOffsets, offset);
    return {
      line: lineIdx + 1,
      column: offset - this.#lineStartFor(lineIdx)
    };
  }
  charPosFor({
    line,
    column
  }) {
    const lineIdx = line - 1;
    // Valid lines are [0, newlineOffsets.length]. Anything else has no offset.
    if (lineIdx < 0 || lineIdx > this.#newlineOffsets.length || column < 0) return null;
    const lineStart = lineIdx === 0 ? 0 : this.#newlineOffsets[lineIdx - 1] + 1;
    const lineEnd = this.#newlineOffsets[lineIdx] ?? this.source.length;
    const target = lineStart + column;
    if (target <= lineEnd) {
      return target;
    }
    return lineEnd;
  }
  #lineStartFor(lineIdx) {
    if (lineIdx === 0) return 0;
    const prevNl = this.#newlineOffsets[lineIdx - 1];
    return prevNl === undefined ? 0 : prevNl + 1;
  }
}
function computeNewlineOffsets(source) {
  const offsets = [];
  for (let i = source.indexOf('\n'); i !== -1; i = source.indexOf('\n', i + 1)) {
    offsets.push(i);
  }
  return offsets;
}

/** Lower-bound binary search: smallest i with arr[i] >= target, else arr.length. */
function lowerBound(arr, target) {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = lo + hi >>> 1;
    // mid is in [lo, hi) so always a valid index.
    if (arr[mid] < target) lo = mid + 1;else hi = mid;
  }
  return lo;
}

class SpanList {
  static range(span, fallback = SourceSpan.NON_EXISTENT) {
    return new SpanList(span.map(loc)).getRangeOffset(fallback);
  }
  _span;
  constructor(span = []) {
    this._span = span;
  }
  add(/** @type {SourceSpan} */ offset) {
    this._span.push(offset);
  }
  /** @returns {SourceSpan} */ getRangeOffset(/** @type {SourceSpan} */ fallback) {
    if (isPresentArray(this._span)) {
      let first = getFirst(this._span);
      let last = getLast(this._span);
      return first.extend(last);
    } else {
      return fallback;
    }
  }
}
function loc(span) {
  if (Array.isArray(span)) {
    let first = getFirst(span);
    let last = getLast(span);
    return loc(first).extend(loc(last));
  } else if (span instanceof SourceSpan) {
    return span;
  } else {
    return span.loc;
  }
}
function hasSpan(span) {
  if (Array.isArray(span) && span.length === 0) {
    return false;
  }
  return true;
}
function maybeLoc(location, fallback) {
  if (hasSpan(location)) {
    return loc(location);
  } else {
    return fallback;
  }
}

var api$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  NON_EXISTENT_LOCATION: NON_EXISTENT_LOCATION,
  SYNTHETIC_LOCATION: SYNTHETIC_LOCATION,
  Source: Source,
  SourceOffset: SourceOffset,
  SourceSlice: SourceSlice,
  SourceSpan: SourceSpan,
  SpanList: SpanList,
  UNKNOWN_POSITION: UNKNOWN_POSITION,
  hasSpan: hasSpan,
  loc: loc,
  maybeLoc: maybeLoc
});

function generateSyntaxError(/** @type {string} */ message, /** @type {SourceSpan} */ location) {
  let {
    module,
    loc
  } = location;
  let {
    line,
    column
  } = loc.start;
  let code = location.asString();
  let quotedCode = code ? `\n\n|\n|  ${code.split('\n').join('\n|  ')}\n|\n\n` : '';
  let error = new Error(`${message}: ${quotedCode}(error occurred in '${module}' @ line ${line} : column ${column})`);
  error.name = 'SyntaxError';
  error.location = location;
  error.code = code;
  return error;
}

// ensure stays in sync with typing
// ParentNode and ChildKey types are derived from VisitorKeysMap
const visitorKeys = {
  Template: ['body'],
  Block: ['body'],
  MustacheStatement: ['path', 'params', 'hash'],
  BlockStatement: ['path', 'params', 'hash', 'program', 'inverse'],
  ElementModifierStatement: ['path', 'params', 'hash'],
  CommentStatement: [],
  MustacheCommentStatement: [],
  ElementNode: ['attributes', 'modifiers', 'children', 'comments'],
  AttrNode: ['value'],
  TextNode: [],
  ConcatStatement: ['parts'],
  SubExpression: ['path', 'params', 'hash'],
  PathExpression: [],
  StringLiteral: [],
  BooleanLiteral: [],
  NumberLiteral: [],
  NullLiteral: [],
  UndefinedLiteral: [],
  Hash: ['pairs'],
  HashPair: ['value']
};

const TraversalError = function () {
  TraversalError.prototype = Object.create(Error.prototype);
  TraversalError.prototype.constructor = TraversalError;
  function TraversalError(message, node, parent, key) {
    let error = Error.call(this, message);
    this.key = key;
    this.message = message;
    this.node = node;
    this.parent = parent;
    if (error.stack) {
      this.stack = error.stack;
    }
  }
  return TraversalError;
}();
function cannotRemoveNode(/** @type {import("glimmer-ast-types").GlimmerNode} */ node, /** @type {import("glimmer-ast-types").GlimmerNode} */ parent, /** @type {string} */ key) {
  return new TraversalError('Cannot remove a node unless it is part of an array', node, parent, key);
}
function cannotReplaceNode(/** @type {import("glimmer-ast-types").GlimmerNode} */ node, /** @type {import("glimmer-ast-types").GlimmerNode} */ parent, /** @type {string} */ key) {
  return new TraversalError('Cannot replace a node with multiple nodes unless it is part of an array', node, parent, key);
}
function cannotReplaceOrRemoveInKeyHandlerYet(node, key) {
  return new TraversalError('Replacing and removing in key handlers is not yet supported.', node, null, key);
}

class WalkerPath {
  node;
  parent;
  parentKey;
  constructor(node, /** @type {undefined | null | WalkerPath} */ parent = null, /** @type {undefined | null | string} */ parentKey = null) {
    this.node = node;
    this.parent = parent;
    this.parentKey = parentKey;
  }
  get parentNode() {
    return this.parent ? this.parent.node : null;
  }
  parents() {
    return {
      [Symbol.iterator]: () => {
        return new PathParentsIterator(this);
      }
    };
  }
}
class PathParentsIterator {
  path;
  constructor(path) {
    this.path = path;
  }
  next() {
    if (this.path.parent) {
      this.path = this.path.parent;
      return {
        done: false,
        value: this.path
      };
    } else {
      return {
        done: true,
        value: null
      };
    }
  }
}

function getEnterFunction(handler) {
  if (typeof handler === 'function') {
    return handler;
  } else {
    return handler.enter;
  }
}
function getExitFunction(handler) {
  if (typeof handler === 'function') {
    return undefined;
  } else {
    return handler.exit;
  }
}
function getKeyHandler(handler, key) {
  let keyVisitor = typeof handler !== 'function' ? handler.keys : undefined;
  if (keyVisitor === undefined) return;
  let keyHandler = keyVisitor[key];
  if (keyHandler !== undefined) {
    return keyHandler;
  }
  return keyVisitor.All;
}
function getNodeHandler(visitor, nodeType) {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  if (visitor.Program) {
    if (nodeType === 'Template' && !visitor.Template || nodeType === 'Block' && !visitor.Block) {

      // eslint-disable-next-line @typescript-eslint/no-deprecated
      return visitor.Program;
    }
  }
  let handler = visitor[nodeType];
  if (handler !== undefined) {
    return handler;
  }
  return visitor.All;
}
function visitNode(visitor, path) {
  let {
    node,
    parent,
    parentKey
  } = path;
  let handler = getNodeHandler(visitor, node.type);
  let enter;
  let exit;
  if (handler !== undefined) {
    enter = getEnterFunction(handler);
    exit = getExitFunction(handler);
  }
  let result;
  if (enter !== undefined) {
    result = enter(node, path);
  }
  if (result !== undefined && result !== null) {
    if (JSON.stringify(node) === JSON.stringify(result)) {
      result = undefined;
    } else if (Array.isArray(result)) {
      visitArray(visitor, result, parent, parentKey);
      return result;
    } else {
      let path = new WalkerPath(result, parent, parentKey);
      return visitNode(visitor, path) || result;
    }
  }
  if (result === undefined) {
    let keys = visitorKeys[node.type];
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      // we know if it has child keys we can widen to a ParentNode
      visitKey(visitor, handler, path, key);
    }
    if (exit !== undefined) {
      result = exit(node, path);
    }
  }
  return result;
}
function get(node, key) {
  return node[key];
}
function set(node, key, value) {
  node[key] = value;
}
function visitKey(visitor, handler, /** @type {WalkerPath} */ path, /** @type {string} */ key) {
  let {
    node
  } = path;
  let value = get(node, key);
  if (!value) {
    return;
  }
  let keyEnter;
  let keyExit;
  if (handler !== undefined) {
    let keyHandler = getKeyHandler(handler, key);
    if (keyHandler !== undefined) {
      keyEnter = getEnterFunction(keyHandler);
      keyExit = getExitFunction(keyHandler);
    }
  }
  if (keyEnter !== undefined) {
    if (keyEnter(node, key) !== undefined) {
      throw cannotReplaceOrRemoveInKeyHandlerYet(node, key);
    }
  }
  if (Array.isArray(value)) {
    visitArray(visitor, value, path, key);
  } else {
    let keyPath = new WalkerPath(value, path, key);
    let result = visitNode(visitor, keyPath);
    if (result !== undefined) {
      // TODO: dynamically check the results by having a table of
      // expected node types in value space, not just type space

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      assignKey(node, key, value, result);
    }
  }
  if (keyExit !== undefined) {
    if (keyExit(node, key) !== undefined) {
      throw cannotReplaceOrRemoveInKeyHandlerYet(node, key);
    }
  }
}
function visitArray(visitor, /** @type {any[]} */ array, /** @type {WalkerPath} */ parent, /** @type {string} */ parentKey) {
  for (let i = 0; i < array.length; i++) {
    let node = unwrap(array[i]);
    let path = new WalkerPath(node, parent, parentKey);
    let result = visitNode(visitor, path);
    if (result !== undefined) {
      i += spliceArray(array, i, result) - 1;
    }
  }
}
function assignKey(node, key, value, result) {
  if (result === null) {
    throw cannotRemoveNode(value, node, key);
  } else if (Array.isArray(result)) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (result.length === 1) {
      set(node, key, result[0]);
    } else {
      if (result.length === 0) {
        throw cannotRemoveNode(value, node, key);
      } else {
        throw cannotReplaceNode(value, node, key);
      }
    }
  } else {
    set(node, key, result);
  }
}
function spliceArray(array, index, result) {
  if (result === null) {
    array.splice(index, 1);
    return 0;
  } else if (Array.isArray(result)) {
    array.splice(index, 1, ...result);
    return result.length;
  } else {
    array.splice(index, 1, result);
    return 1;
  }
}
function traverse(/** @type {import("glimmer-ast-types").GlimmerNode} */ node, visitor) {
  let path = new WalkerPath(node);
  visitNode(visitor, path);
}

class Walker {
  stack = [];
  constructor(order) {
    this.order = order;
  }
  visit(node, visitor) {
    if (!node) {
      return;
    }
    this.stack.push(node);
    if (this.order === 'post') {
      this.children(node, visitor);
      visitor(node, this);
    } else {
      visitor(node, this);
      this.children(node, visitor);
    }
    this.stack.pop();
  }
  children(node, callback) {
    switch (node.type) {
      case 'Block':
      case 'Template':
        walkBody(this, node.body, callback);
        return;
      case 'ElementNode':
        walkBody(this, node.children, callback);
        return;
      case 'BlockStatement':
        this.visit(node.program, callback);
        this.visit(node.inverse || null, callback);
        return;
      default:
        return;
    }
  }
}
function walkBody(walker, body, callback) {
  for (const child of body) {
    walker.visit(child, callback);
  }
}

function childrenFor(node) {
  switch (node.type) {
    case 'Block':
    case 'Template':
      return node.body;
    case 'ElementNode':
      return node.children;
  }
}
function appendChild(parent, node) {
  childrenFor(parent).push(node);
}
/** @returns {boolean} */ function isHBSLiteral(path) {
  return path.type === 'StringLiteral' || path.type === 'BooleanLiteral' || path.type === 'NumberLiteral' || path.type === 'NullLiteral' || path.type === 'UndefinedLiteral';
}
function printLiteral(literal) {
  if (literal.type === 'UndefinedLiteral') {
    return 'undefined';
  } else {
    return JSON.stringify(literal.value);
  }
}
function isUpperCase(tag) {
  return tag[0] === tag[0]?.toUpperCase() && tag[0] !== tag[0]?.toLowerCase();
}
function isLowerCase(tag) {
  return tag[0] === tag[0]?.toLowerCase() && tag[0] !== tag[0]?.toUpperCase();
}

let _SOURCE;
function SOURCE() {
  if (!_SOURCE) {
    _SOURCE = new Source('', '(synthetic)');
  }
  return _SOURCE;
}

// const SOURCE = new Source('', '(tests)');

// Statements

function buildMustache(path, params = [], hash = buildHash([]), trusting = false, loc, strip) {
  return b.mustache({
    path: buildPath(path),
    params,
    hash,
    trusting,
    strip,
    loc: buildLoc(loc || null)
  });
}
function buildBlock(path, params, hash, _defaultBlock, _elseBlock = null, loc, openStrip, inverseStrip, closeStrip) {
  let defaultBlock;
  let elseBlock = null;
  if (_defaultBlock.type === 'Template') {
    defaultBlock = b.blockItself({
      params: buildBlockParams(_defaultBlock.blockParams),
      body: _defaultBlock.body,
      loc: _defaultBlock.loc
    });
  } else {
    defaultBlock = _defaultBlock;
  }
  if (_elseBlock?.type === 'Template') {
    assert(_elseBlock.blockParams.length === 0);
    elseBlock = b.blockItself({
      params: [],
      body: _elseBlock.body,
      loc: _elseBlock.loc
    });
  } else {
    elseBlock = _elseBlock;
  }
  return b.block({
    path: buildPath(path),
    params: params || [],
    hash: hash || buildHash([]),
    defaultBlock,
    elseBlock,
    loc: buildLoc(loc || null),
    openStrip,
    inverseStrip,
    closeStrip
  });
}
function buildElementModifier(path, params, hash, loc) {
  return b.elementModifier({
    path: buildPath(path),
    params: params || [],
    hash: hash || buildHash([]),
    loc: buildLoc(loc || null)
  });
}
function buildComment(value, loc) {
  return b.comment({
    value: value,
    loc: buildLoc(loc || null)
  });
}
function buildMustacheComment(value, loc) {
  return b.mustacheComment({
    value: value,
    loc: buildLoc(loc || null)
  });
}
function buildConcat(parts, loc) {
  if (!isPresentArray(parts)) {
    throw new Error(`b.concat requires at least one part`);
  }
  return b.concat({
    parts,
    loc: buildLoc(loc || null)
  });
}

// Nodes

function buildElement(tag, options = {}) {
  let {
    attrs,
    blockParams,
    modifiers,
    comments,
    children,
    openTag,
    closeTag: _closeTag,
    loc
  } = options;

  // this is used for backwards compat, prior to `selfClosing` being part of the ElementNode AST
  let path;
  let selfClosing;
  if (typeof tag === 'string') {
    if (tag.endsWith('/')) {
      path = buildPath(tag.slice(0, -1));
      selfClosing = true;
    } else {
      path = buildPath(tag);
    }
  } else if ('type' in tag) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- supports JS users
    assert(tag.type === 'PathExpression', `Invalid tag type ${tag.type}`);
    path = tag;
  } else if ('path' in tag) {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- supports JS users
    assert(tag.path.type === 'PathExpression', `Invalid tag type ${tag.path.type}`);
    path = tag.path;
    selfClosing = tag.selfClosing;
  } else {
    path = buildPath(tag.name);
    selfClosing = tag.selfClosing;
  }
  let params = blockParams?.map(param => {
    if (typeof param === 'string') {
      return buildVar(param);
    } else {
      return param;
    }
  });
  let closeTag = null;
  if (_closeTag) {
    closeTag = buildLoc(_closeTag);
  } else if (_closeTag === undefined) {
    closeTag = selfClosing || isVoidTag(path.original) ? null : buildLoc(null);
  }
  return b.element({
    path,
    selfClosing: selfClosing || false,
    attributes: attrs || [],
    params: params || [],
    modifiers: modifiers || [],
    comments: comments || [],
    children: children || [],
    openTag: buildLoc(openTag || null),
    closeTag,
    loc: buildLoc(loc || null)
  });
}
function buildAttr(name, value, loc) {
  return b.attr({
    name: name,
    value: value,
    loc: buildLoc(loc || null)
  });
}
function buildText(chars = '', loc) {
  return b.text({
    chars,
    loc: buildLoc(loc || null)
  });
}

// Expressions

function buildSexpr(path, params = [], hash = buildHash([]), loc) {
  return b.sexpr({
    path: buildPath(path),
    params,
    hash,
    loc: buildLoc(loc || null)
  });
}
function buildHead(original, loc) {
  let [head, ...tail] = asPresentArray(original.split('.'));
  let headNode = b.head({
    original: head,
    loc: buildLoc(loc || null)
  });
  return b.path({
    head: headNode,
    tail,
    loc: buildLoc(loc || null)
  });
}
function buildThis(loc) {
  return b.this({
    loc: buildLoc(loc || null)
  });
}
function buildAtName(name, loc) {
  return b.atName({
    name,
    loc: buildLoc(loc || null)
  });
}
function buildVar(name, loc) {
  return b.var({
    name,
    loc: buildLoc(loc || null)
  });
}
function buildHeadFromString(original, loc) {
  return b.head({
    original,
    loc: buildLoc(loc || null)
  });
}
function buildCleanPath(head, tail = [], loc) {
  return b.path({
    head,
    tail,
    loc: buildLoc(loc || null)
  });
}
/** @returns {import("glimmer-ast-types").GlimmerNode} */ function buildPath(path, loc) {
  let span = buildLoc(loc || null);
  if (typeof path !== 'string') {
    if ('type' in path) {
      return path;
    } else {
      assert(path.head.indexOf('.') === -1);
      let {
        head,
        tail
      } = path;
      return b.path({
        head: b.head({
          original: head,
          loc: span.sliceStartChars({
            chars: head.length
          })
        }),
        tail,
        loc: buildLoc(loc || null)
      });
    }
  }
  let {
    head,
    tail
  } = buildHead(path, span);
  return b.path({
    head,
    tail,
    loc: span
  });
}
function buildLiteral(type, value, loc) {
  return b.literal({
    type,
    value,
    loc: buildLoc(loc || null)
  });
}

// Miscellaneous

/** @returns {import("glimmer-ast-types").GlimmerNode} */ function buildHash(pairs = [], loc) {
  return b.hash({
    pairs,
    loc: buildLoc(loc || null)
  });
}
function buildPair(key, value, loc) {
  return b.pair({
    key,
    value,
    loc: buildLoc(loc || null)
  });
}
function buildProgram(body, blockParams, loc) {
  if (blockParams && blockParams.length) {
    return buildBlockItself(body, blockParams, false, loc);
  } else {
    return buildTemplate(body, [], loc);
  }
}
function buildBlockParams(params) {
  return params.map(p => typeof p === 'string' ? b.var({
    name: p,
    loc: SourceSpan.synthetic(p)
  }) : p);
}
function buildBlockItself(body = [], params = [], chained = false, loc) {
  return b.blockItself({
    body,
    params: buildBlockParams(params),
    chained,
    loc: buildLoc(loc || null)
  });
}
/** @returns {import("glimmer-ast-types").GlimmerNode} */ function buildTemplate(body = [], blockParams = [], loc) {
  return b.template({
    body,
    blockParams,
    loc: buildLoc(loc || null)
  });
}
function buildPosition(line, column) {
  return b.pos({
    line,
    column
  });
}
function buildLoc(...args) {
  if (args.length === 1) {
    let loc = args[0];
    if (loc && typeof loc === 'object') {
      return SourceSpan.forHbsLoc(SOURCE(), loc);
    } else {
      return SourceSpan.forHbsLoc(SOURCE(), SYNTHETIC_LOCATION);
    }
  } else {
    let [startLine, startColumn, endLine, endColumn, _source] = args;
    let source = _source ? new Source('', _source) : SOURCE();
    return SourceSpan.forHbsLoc(source, {
      start: {
        line: startLine,
        column: startColumn
      },
      end: {
        line: endLine || startLine,
        column: endColumn || startColumn
      }
    });
  }
}
var publicBuilder = {
  mustache: buildMustache,
  block: buildBlock,
  comment: buildComment,
  mustacheComment: buildMustacheComment,
  element: buildElement,
  elementModifier: buildElementModifier,
  attr: buildAttr,
  text: buildText,
  sexpr: buildSexpr,
  concat: buildConcat,
  hash: buildHash,
  pair: buildPair,
  literal: buildLiteral,
  program: buildProgram,
  blockItself: buildBlockItself,
  template: buildTemplate,
  loc: buildLoc,
  pos: buildPosition,
  path: buildPath,
  fullPath: buildCleanPath,
  head: buildHeadFromString,
  at: buildAtName,
  var: buildVar,
  this: buildThis,
  string: literal('StringLiteral'),
  boolean: literal('BooleanLiteral'),
  number: literal('NumberLiteral'),
  undefined() {
    return buildLiteral('UndefinedLiteral', undefined);
  },
  null() {
    return buildLiteral('NullLiteral', null);
  }
};
function literal(/** @type {string} */ type) {
  return function (value, loc) {
    return buildLiteral(type, value, loc);
  };
}

function buildLegacyMustache({
  path,
  params,
  hash,
  trusting,
  strip,
  loc
}) {
  const node = {
    type: 'MustacheStatement',
    path,
    params,
    hash,
    trusting,
    strip,
    loc
  };
  Object.defineProperty(node, 'escaped', {
    enumerable: false,
    get() {
      return !this.trusting;
    },
    set(value) {
      this.trusting = !value;
    }
  });
  return node;
}
function buildLegacyPath({
  head,
  tail,
  loc
}) {
  const node = {
    type: 'PathExpression',
    head,
    tail,
    get original() {
      const head = this.head.original;
      return this.tail.length === 0 ? head : `${head}.${this.tail.join('.')}`;
    },
    set original(value) {
      let [head, ...tail] = asPresentArray(value.split('.'));
      this.head = publicBuilder.head(head, this.head.loc);
      this.tail = tail;
    },
    loc
  };
  Object.defineProperty(node, 'parts', {
    enumerable: false,
    get() {
      let parts = asPresentArray(this.original.split('.'));
      if (parts[0] === 'this') {
        // parts does not include `this`
        parts.shift();
      } else if (parts[0].startsWith('@')) {
        // parts does not include leading `@`
        parts[0] = parts[0].slice(1);
      }
      return Object.freeze(parts);
    },
    set(values) {
      let parts = [...values];

      // you are not supposed to already have `this` or `@` in the parts, but since this is
      // deprecated anyway, we will infer what you meant and allow it
      if (parts[0] !== 'this' && !parts[0]?.startsWith('@')) {
        if (this.head.type === 'ThisHead') {
          parts.unshift('this');
        } else if (this.head.type === 'AtHead') {
          parts[0] = `@${parts[0]}`;
        }
      }
      this.original = parts.join('.');
    }
  });
  Object.defineProperty(node, 'this', {
    enumerable: false,
    get() {
      return this.head.type === 'ThisHead';
    }
  });
  Object.defineProperty(node, 'data', {
    enumerable: false,
    get() {
      return this.head.type === 'AtHead';
    }
  });
  return node;
}
function buildLegacyLiteral({
  type,
  value,
  loc
}) {
  const node = {
    type,
    value,
    loc
  };
  Object.defineProperty(node, 'original', {
    enumerable: false,
    get() {
      return this.value;
    },
    set(value) {
      this.value = value;
    }
  });
  return node;
}

const DEFAULT_STRIP = {
  close: false,
  open: false
};

/**
 * The Parser Builder differentiates from the public builder API by:
 *
 * 1. Offering fewer different ways to instantiate nodes
 * 2. Mandating source locations
 */
class Builders {
  pos({
    line,
    column
  }) {
    return {
      line,
      column
    };
  }
  blockItself({
    body,
    params,
    chained = false,
    loc
  }) {
    return {
      type: 'Block',
      body,
      params,
      /** @returns {any[]} */ get blockParams() {
        return this.params.map(p => p.name);
      },
      set blockParams(params) {
        this.params = params.map(name => {
          return b.var({
            name,
            loc: SourceSpan.synthetic(name)
          });
        });
      },
      chained,
      loc
    };
  }
  template({
    body,
    blockParams,
    loc
  }) {
    return {
      type: 'Template',
      body,
      blockParams,
      loc
    };
  }
  mustache({
    path,
    params,
    hash,
    trusting,
    loc,
    strip = DEFAULT_STRIP
  }) {
    return buildLegacyMustache({
      path,
      params,
      hash,
      trusting,
      strip,
      loc
    });
  }
  block({
    path,
    params,
    hash,
    defaultBlock,
    elseBlock = null,
    loc,
    openStrip = DEFAULT_STRIP,
    inverseStrip = DEFAULT_STRIP,
    closeStrip = DEFAULT_STRIP
  }) {
    return {
      type: 'BlockStatement',
      path: path,
      params,
      hash,
      program: defaultBlock,
      inverse: elseBlock,
      loc,
      openStrip,
      inverseStrip,
      closeStrip
    };
  }
  comment({
    value,
    loc
  }) {
    return {
      type: 'CommentStatement',
      value,
      loc
    };
  }
  mustacheComment({
    value,
    loc
  }) {
    return {
      type: 'MustacheCommentStatement',
      value,
      loc
    };
  }
  concat({
    parts,
    loc
  }) {
    return {
      type: 'ConcatStatement',
      parts,
      loc
    };
  }
  element({
    path,
    selfClosing,
    attributes,
    modifiers,
    params,
    comments,
    children,
    openTag,
    closeTag,
    loc
  }) {
    let _selfClosing = selfClosing;
    return {
      type: 'ElementNode',
      path,
      attributes,
      modifiers,
      params,
      comments,
      children,
      openTag,
      closeTag,
      loc,
      /** @returns {string} */ get tag() {
        return this.path.original;
      },
      set tag(name) {
        this.path.original = name;
      },
      /** @returns {any[]} */ get blockParams() {
        return this.params.map(p => p.name);
      },
      set blockParams(params) {
        this.params = params.map(name => {
          return b.var({
            name,
            loc: SourceSpan.synthetic(name)
          });
        });
      },
      /** @returns {boolean} */ get selfClosing() {
        return _selfClosing;
      },
      set selfClosing(selfClosing) {
        _selfClosing = selfClosing;
        if (selfClosing) {
          this.closeTag = null;
        } else {
          this.closeTag = SourceSpan.synthetic(`</${this.tag}>`);
        }
      }
    };
  }
  elementModifier({
    path,
    params,
    hash,
    loc
  }) {
    return {
      type: 'ElementModifierStatement',
      path,
      params,
      hash,
      loc
    };
  }
  attr({
    name,
    value,
    loc
  }) {
    return {
      type: 'AttrNode',
      name: name,
      value: value,
      loc
    };
  }
  text({
    chars,
    loc
  }) {
    return {
      type: 'TextNode',
      chars,
      loc
    };
  }
  sexpr({
    path,
    params,
    hash,
    loc
  }) {
    return {
      type: 'SubExpression',
      path,
      params,
      hash,
      loc
    };
  }
  path({
    head,
    tail,
    loc
  }) {
    return buildLegacyPath({
      head,
      tail,
      loc
    });
  }
  head({
    original,
    loc
  }) {
    if (original === 'this') {
      return this.this({
        loc
      });
    }
    if (original[0] === '@') {
      return this.atName({
        name: original,
        loc
      });
    } else {
      return this.var({
        name: original,
        loc
      });
    }
  }
  this({
    loc
  }) {
    return {
      type: 'ThisHead',
      /** @returns {string} */ get original() {
        return 'this';
      },
      loc
    };
  }
  atName({
    name,
    loc
  }) {
    let _name = '';
    const node = {
      type: 'AtHead',
      /** @returns {string} */ get name() {
        return _name;
      },
      set name(/** @type {string} */ value) {
        assert(value[0] === '@');
        assert(value.indexOf('.') === -1);
        _name = value;
      },
      /** @returns {string} */ get original() {
        return this.name;
      },
      set original(value) {
        this.name = value;
      },
      loc
    };

    // trigger the assertions
    node.name = name;
    return node;
  }
  var({
    name,
    loc
  }) {
    let _name = '';
    const node = {
      type: 'VarHead',
      /** @returns {string} */ get name() {
        return _name;
      },
      set name(/** @type {string} */ value) {
        assert(value[0] !== '@');
        assert(value.indexOf('.') === -1);
        _name = value;
      },
      /** @returns {string} */ get original() {
        return this.name;
      },
      set original(value) {
        this.name = value;
      },
      loc
    };

    // trigger the assertions
    node.name = name;
    return node;
  }
  hash({
    pairs,
    loc
  }) {
    return {
      type: 'Hash',
      pairs,
      loc
    };
  }
  pair({
    key,
    value,
    loc
  }) {
    return {
      type: 'HashPair',
      key,
      value,
      loc
    };
  }
  literal({
    type,
    value,
    loc
  }) {
    return buildLegacyLiteral({
      type,
      value,
      loc
    });
  }
}
const b = new Builders();

class Parser {
  /** @type {any[]} */ elementStack = [];
  /** @type {string[]} */ lines;
  /** @type {Source} */ source;
  /** @type {GlimmerPendingAttribute | null} */ currentAttribute = null;
  /** @type {GlimmerPendingNode | null} */ currentNode = null;
  /** @type {EventedTokenizer} */ tokenizer;
  constructor(source, entityParser = new EntityParser(html5_named_char_refs_default), mode = 'precompile') {
    this.source = source;
    this.lines = source.source.split(/\r\n?|\n/u);
    this.tokenizer = new EventedTokenizer(this, entityParser, mode);
  }
  /** @returns {SourceOffset} */ offset() {
    let {
      line,
      column
    } = this.tokenizer;
    return this.source.offsetFor(line, column);
  }
  pos({
    line,
    column
  }) {
    return this.source.offsetFor(line, column);
  }
  finish(/** @type {GlimmerPendingNode} */ node) {
    return assign({}, node, {
      loc: node.start.until(this.offset())
    });

    // node.loc = node.loc.withEnd(end);
  }
  /** @returns {GlimmerPendingAttribute} */ get currentAttr() {
    return expect(this.currentAttribute);
  }
  /** @returns {GlimmerPendingNode} */ get currentTag() {
    let node = this.currentNode;
    assert(node && (node.type === 'StartTag' || node.type === 'EndTag'));
    return node;
  }
  /** @returns {GlimmerPendingNode} */ get currentStartTag() {
    let node = this.currentNode;
    assert(node && node.type === 'StartTag');
    return node;
  }
  /** @returns {GlimmerPendingNode} */ get currentEndTag() {
    let node = this.currentNode;
    assert(node && node.type === 'EndTag');
    return node;
  }
  /** @returns {GlimmerPendingNode} */ get currentComment() {
    let node = this.currentNode;
    assert(node && node.type === 'CommentStatement');
    return node;
  }
  /** @returns {GlimmerPendingNode} */ get currentData() {
    let node = this.currentNode;
    assert(node && node.type === 'TextNode');
    return node;
  }
  acceptNode(/** @type {HbsNode} */ node) {
    return this[node.type](node);
  }
  currentElement() {
    return getLast(asPresentArray(this.elementStack));
  }
  sourceForNode(/** @type {HbsNode} */ node, endNode) {
    let firstLine = node.loc.start.line - 1;
    let currentLine = firstLine - 1;
    let firstColumn = node.loc.start.column;
    let string = [];
    let line;
    let lastLine;
    let lastColumn;
    if (endNode) {
      lastLine = endNode.loc.end.line - 1;
      lastColumn = endNode.loc.end.column;
    } else {
      lastLine = node.loc.end.line - 1;
      lastColumn = node.loc.end.column;
    }
    while (currentLine < lastLine) {
      currentLine++;
      line = unwrap(this.lines[currentLine]);
      if (currentLine === firstLine) {
        if (firstLine === lastLine) {
          string.push(line.slice(firstColumn, lastColumn));
        } else {
          string.push(line.slice(firstColumn));
        }
      } else if (currentLine === lastLine) {
        string.push(line.slice(0, lastColumn));
      } else {
        string.push(line);
      }
    }
    return string.join('\n');
  }
}

class HandlebarsNodeVisitors extends Parser {
  // Because we interleave the HTML and HBS parsing, sometimes the HTML
  // tokenizer can run out of tokens when we switch into {{...}} or reached
  // EOF. There are positions where neither of these are expected, and it would
  // like to generate an error, but there is no span to attach the error to.
  // This allows the HTML tokenization to stash an error message and the next
  // mustache visitor will attach the message to the appropriate span and throw
  // the error.
  pendingError = null;
  parse(/** @type {HbsNode} */ program, /** @type {any[] | undefined} */ blockParams) {
    assert(program.loc);
    let node = b.template({
      body: [],
      blockParams,
      loc: this.source.spanFor(program.loc)
    });
    let template = this.parseProgram(node, program);

    // TODO: we really need to verify that the tokenizer is in an acceptable
    // state when we are "done" parsing. For example, right now, `<foo` parses
    // into `Template { body: [] }` which is obviously incorrect

    this.pendingError?.eof(template.loc.getEnd());
    return template;
  }
  Program(/** @type {HbsNode} */ program, /** @type {any[]} */ blockParams) {
    assert(program.loc);
    let node = b.blockItself({
      body: [],
      params: blockParams,
      chained: program.chained,
      loc: this.source.spanFor(program.loc)
    });
    return this.parseProgram(node, program);
  }
  parseProgram(node, /** @type {HbsNode} */ program) {
    if (program.body.length === 0) {
      return node;
    }
    let poppedNode;
    try {
      this.elementStack.push(node);
      for (let child of program.body) {
        this.acceptNode(child);
      }
    } finally {
      poppedNode = this.elementStack.pop();
    }

    // Ensure that that the element stack is balanced properly.
    if (node !== poppedNode) {
      if (poppedNode?.type === 'ElementNode') {
        throw generateSyntaxError(`Unclosed element \`${poppedNode.tag}\``, poppedNode.loc);
      } else {
        assert(false, `[BUG] mismatched parser elementStack node: ${node.type}`);
      }
    }
    return node;
  }
  BlockStatement(/** @type {HbsNode} */ block) {
    assert(block.loc);
    if (this.appendToHtmlComment(block)) {
      return;
    }
    if (this.tokenizer.state !== 'data' && this.tokenizer.state !== 'beforeData') {
      throw generateSyntaxError('A block may only be used inside an HTML element or another block.', this.source.spanFor(block.loc));
    }

    // For an inverse section (`{{^foo}}...{{/foo}}`), the upstream parser swaps the program and
    // the inverse, so there is no program unless the section has an `{{else}}`.
    if (block.program === undefined) {
      throw generateSyntaxError('Inverse sections (`{{^foo}}...{{/foo}}`) are not supported. Use `{{#unless foo}}...{{/unless}}` instead', this.source.spanFor(block.loc));
    }
    const {
      path,
      params,
      hash
    } = acceptCallNodes(this, block);
    const loc = this.source.spanFor(block.loc);

    // Backfill block params loc for the default block
    let blockParams = [];
    let repairedBlock;
    if (block.program.blockParams?.length) {
      // Start from right after the hash
      let span = hash.loc.collapse('end');

      // Extend till the beginning of the block
      if (block.program.loc) {
        span = span.withEnd(this.source.spanFor(block.program.loc).getStart());
      } else if (block.program.body[0]) {
        span = span.withEnd(this.source.spanFor(block.program.body[0].loc).getStart());
      } else {
        // ...or if all else fail, use the end of the block statement
        // this can only happen if the block statement is empty anyway
        span = span.withEnd(loc.getEnd());
      }
      repairedBlock = repairBlock(this.source, block, span);

      // Now we have a span for something like this:
      //
      //   {{#foo bar baz=bat as |wow wat|}}
      //                     ~~~~~~~~~~~~~~~
      //
      // Or, if we are unlucky:
      //
      // {{#foo bar baz=bat as |wow wat|}}{{/foo}}
      //                   ~~~~~~~~~~~~~~~~~~~~~~~
      //
      // Either way, within this span, there should be exactly two pipes
      // fencing our block params, neatly whitespace separated and with
      // legal identifiers only
      const content = span.asString();
      let skipStart = content.indexOf('|') + 1;
      const limit = content.indexOf('|', skipStart);
      for (const name of block.program.blockParams) {
        let nameStart;
        let loc;
        if (skipStart >= limit) {
          nameStart = -1;
        } else {
          nameStart = content.indexOf(name, skipStart);
        }
        if (nameStart === -1 || nameStart + name.length > limit) {
          skipStart = limit;
          loc = this.source.spanFor(NON_EXISTENT_LOCATION);
        } else {
          skipStart = nameStart;
          loc = span.sliceStartChars({
            skipStart,
            chars: name.length
          });
          skipStart += name.length;
        }
        blockParams.push(b.var({
          name,
          loc
        }));
      }
    } else {
      repairedBlock = repairBlock(this.source, block, loc);
    }
    const program = this.Program(repairedBlock.program, blockParams);
    const inverse = repairedBlock.inverse ? this.Program(repairedBlock.inverse, []) : null;
    const node = b.block({
      path,
      params,
      hash,
      defaultBlock: program,
      elseBlock: inverse,
      loc: this.source.spanFor(block.loc),
      openStrip: block.openStrip,
      inverseStrip: block.inverseStrip,
      closeStrip: block.closeStrip
    });
    const parentProgram = this.currentElement();
    appendChild(parentProgram, node);
  }
  MustacheStatement(/** @type {HbsNode} */ rawMustache) {
    this.pendingError?.mustache(this.source.spanFor(rawMustache.loc));
    const {
      tokenizer
    } = this;
    if (this.appendToHtmlComment(rawMustache)) {
      return;
    }
    let mustache;
    const {
      escaped,
      loc,
      strip
    } = rawMustache;
    if ('original' in rawMustache.path && rawMustache.path.original === '...attributes') {
      throw generateSyntaxError('Illegal use of ...attributes', this.source.spanFor(rawMustache.loc));
    }
    if (isHBSLiteral(rawMustache.path)) {
      mustache = b.mustache({
        path: this.acceptNode(rawMustache.path),
        params: [],
        hash: b.hash({
          pairs: [],
          loc: this.source.spanFor(rawMustache.path.loc).collapse('end')
        }),
        trusting: !escaped,
        loc: this.source.spanFor(loc),
        strip
      });
    } else {
      const {
        path,
        params,
        hash
      } = acceptCallNodes(this, rawMustache);
      mustache = b.mustache({
        path,
        params,
        hash,
        trusting: !escaped,
        loc: this.source.spanFor(loc),
        strip
      });
    }
    switch (tokenizer.state) {
      // Tag helpers
      case 'tagOpen':
      case 'tagName':
      case 'endTagOpen':
      case 'endTagName':
        throw generateSyntaxError(`Cannot use mustaches in an elements tagname`, mustache.loc);
      case 'beforeAttributeName':
      case 'selfClosingStartTag':
        this.assertNotInEndTag('mustaches', mustache.loc);
        // A `/` that is not followed by `>` is ignored, as in HTML (`<div / {{x}}>`)
        addElementModifier(this.currentStartTag, mustache);
        tokenizer.transitionTo('beforeAttributeName');
        break;
      case 'attributeName':
      case 'afterAttributeName':
        this.assertNotInEndTag('mustaches', mustache.loc);
        this.beginAttributeValue(false);
        this.finishAttributeValue();
        addElementModifier(this.currentStartTag, mustache);
        tokenizer.transitionTo('beforeAttributeName');
        break;
      case 'afterAttributeValueQuoted':
        addElementModifier(this.currentStartTag, mustache);
        tokenizer.transitionTo('beforeAttributeName');
        break;

      // Attribute values
      case 'beforeAttributeValue':
        this.beginAttributeValue(false);
        this.appendDynamicAttributeValuePart(mustache);
        tokenizer.transitionTo('attributeValueUnquoted');
        break;
      case 'attributeValueDoubleQuoted':
      case 'attributeValueSingleQuoted':
      case 'attributeValueUnquoted':
        this.appendDynamicAttributeValuePart(mustache);
        break;
      case 'beforeData':
      case 'data':
        appendChild(this.currentElement(), mustache);
        break;
      default:
        throw generateSyntaxError(`Using a Handlebars mustache when in the \`${tokenizer.state}\` state is not supported`, mustache.loc);
    }
    return mustache;
  }

  /**
   * If the HTML tokenizer is inside an HTML comment, append the source of `node` to the comment
   * and return true. The tokenizer may be part-way through a `-` or `--` sequence that is not
   * followed by `>`, so those characters are flushed first, as the tokenizer itself would do.
   */
  appendToHtmlComment(node) {
    let pending;
    switch (this.tokenizer.state) {
      case 'comment':
      case 'commentStart':
        pending = '';
        break;
      case 'commentStartDash':
      case 'commentEndDash':
        pending = '-';
        break;
      case 'commentEnd':
        pending = '--';
        break;
      default:
        return false;
    }
    this.appendToCommentData(pending + this.sourceForNode(node));
    this.tokenizer.transitionTo('comment');
    return true;
  }
  assertNotInEndTag(what, loc) {
    if (this.currentTag.type === 'EndTag') {
      throw generateSyntaxError(`Invalid end tag: closing tag must not contain ${what}`, loc);
    }
  }
  appendDynamicAttributeValuePart(part) {
    this.finalizeTextPart();
    const attr = this.currentAttr;
    attr.isDynamic = true;
    attr.parts.push(part);
  }
  finalizeTextPart() {
    const attr = this.currentAttr;
    const text = attr.currentPart;
    if (text !== null) {
      this.currentAttr.parts.push(text);
      this.startTextPart();
    }
  }
  startTextPart() {
    this.currentAttr.currentPart = null;
  }
  ContentStatement(/** @type {HbsNode} */ content) {
    updateTokenizerLocation(this.tokenizer, content);
    this.tokenizer.tokenizePart(content.value);
    this.tokenizer.flushData();
  }
  CommentStatement(/** @type {HbsNode} */ rawComment) {
    const {
      tokenizer
    } = this;
    if (this.appendToHtmlComment(rawComment)) {
      return null;
    }
    const {
      value,
      loc
    } = rawComment;
    const comment = b.mustacheComment({
      value,
      loc: this.source.spanFor(loc)
    });
    switch (tokenizer.state) {
      case 'beforeAttributeName':
      case 'afterAttributeName':
        this.assertNotInEndTag('Handlebars comments', comment.loc);
        this.currentStartTag.comments.push(comment);
        break;
      case 'beforeData':
      case 'data':
        appendChild(this.currentElement(), comment);
        break;
      default:
        throw generateSyntaxError(`Using a Handlebars comment when in the \`${tokenizer['state']}\` state is not supported`, this.source.spanFor(rawComment.loc));
    }
    return comment;
  }
  PartialStatement(/** @type {HbsNode} */ partial) {
    throw generateSyntaxError(`Handlebars partials are not supported`, this.source.spanFor(partial.loc));
  }
  PartialBlockStatement(/** @type {HbsNode} */ partialBlock) {
    throw generateSyntaxError(`Handlebars partial blocks are not supported`, this.source.spanFor(partialBlock.loc));
  }
  Decorator(/** @type {HbsNode} */ decorator) {
    throw generateSyntaxError(`Handlebars decorators are not supported`, this.source.spanFor(decorator.loc));
  }
  DecoratorBlock(/** @type {HbsNode} */ decoratorBlock) {
    throw generateSyntaxError(`Handlebars decorator blocks are not supported`, this.source.spanFor(decoratorBlock.loc));
  }
  SubExpression(/** @type {HbsNode} */ sexpr) {
    const {
      path,
      params,
      hash
    } = acceptCallNodes(this, sexpr);
    return b.sexpr({
      path,
      params,
      hash,
      loc: this.source.spanFor(sexpr.loc)
    });
  }
  HashLiteral(hash) {
    throw generateSyntaxError(`Hash literals are not supported. Use named arguments (\`{{helper foo=bar}}\`) or the \`hash\` helper (\`(hash foo=bar)\`) instead`, this.source.spanFor(hash.loc));
  }
  PathExpression(/** @type {HbsNode} */ path) {
    const {
      original
    } = path;
    let parts;
    if (typeof path.head === 'object') {
      throw generateSyntaxError(`A path cannot start with a sub-expression. Use the \`get\` helper (\`(get (foo) "bar")\`) instead`, this.source.spanFor(path.loc));
    }
    if (original.indexOf('/') !== -1) {
      if (original.slice(0, 2) === './') {
        throw generateSyntaxError(`Using "./" is not supported in Glimmer and unnecessary`, this.source.spanFor(path.loc));
      }
      if (original.slice(0, 3) === '../') {
        throw generateSyntaxError(`Changing context using "../" is not supported in Glimmer`, this.source.spanFor(path.loc));
      }
      if (original.indexOf('.') !== -1) {
        throw generateSyntaxError(`Mixing '.' and '/' in paths is not supported in Glimmer; use only '.' to separate property paths`, this.source.spanFor(path.loc));
      }
      parts = [path.parts.join('/')];
    } else if (original === '.') {
      throw generateSyntaxError(`'.' is not a supported path in Glimmer; check for a path with a trailing '.'`, this.source.spanFor(path.loc));
    } else {
      parts = path.parts;
    }
    let thisHead = false;

    // This is to fix a bug in the Handlebars AST where the path expressions in
    // `{{this.foo}}` (and similarly `{{foo-bar this.foo named=this.foo}}` etc)
    // are simply turned into `{{foo}}`. The fix is to push it back onto the
    // parts array and let the runtime see the difference. However, we cannot
    // simply use the string `this` as it means literally the property called
    // "this" in the current context (it can be expressed in the syntax as
    // `{{[this]}}`, where the square bracket are generally for this kind of
    // escaping – such as `{{foo.["bar.baz"]}}` would mean lookup a property
    // named literally "bar.baz" on `this.foo`). By convention, we use `null`
    // for this purpose.
    if (/^this(?:\..+)?$/u.test(original)) {
      thisHead = true;
    }
    let pathHead;
    if (thisHead) {
      pathHead = b.this({
        loc: this.source.spanFor({
          start: path.loc.start,
          end: {
            line: path.loc.start.line,
            column: path.loc.start.column + 4
          }
        })
      });
    } else if (path.data) {
      const head = parts.shift();
      if (head === undefined) {
        throw generateSyntaxError(`Attempted to parse a path expression, but it was not valid. Paths beginning with @ must start with a-z.`, this.source.spanFor(path.loc));
      }
      pathHead = b.atName({
        name: `@${head}`,
        loc: this.source.spanFor({
          start: path.loc.start,
          end: {
            line: path.loc.start.line,
            column: path.loc.start.column + head.length + 1
          }
        })
      });
    } else {
      const head = parts.shift();
      if (head === undefined) {
        throw generateSyntaxError(`Attempted to parse a path expression, but it was not valid. Paths must start with a-z or A-Z.`, this.source.spanFor(path.loc));
      }
      pathHead = b.var({
        name: head,
        loc: this.source.spanFor({
          start: path.loc.start,
          end: {
            line: path.loc.start.line,
            column: path.loc.start.column + head.length
          }
        })
      });
    }
    return b.path({
      head: pathHead,
      tail: parts,
      loc: this.source.spanFor(path.loc)
    });
  }
  Hash(/** @type {HbsNode} */ hash) {
    const pairs = hash.pairs.map(pair => b.pair({
      key: pair.key,
      value: this.acceptNode(pair.value),
      loc: this.source.spanFor(pair.loc)
    }));
    return b.hash({
      pairs,
      loc: this.source.spanFor(hash.loc)
    });
  }
  StringLiteral(/** @type {HbsNode} */ string) {
    return b.literal({
      type: 'StringLiteral',
      value: string.value,
      loc: this.source.spanFor(string.loc)
    });
  }
  BooleanLiteral(/** @type {HbsNode} */ boolean) {
    return b.literal({
      type: 'BooleanLiteral',
      value: boolean.value,
      loc: this.source.spanFor(boolean.loc)
    });
  }
  NumberLiteral(/** @type {HbsNode} */ number) {
    return b.literal({
      type: 'NumberLiteral',
      value: number.value,
      loc: this.source.spanFor(number.loc)
    });
  }
  UndefinedLiteral(/** @type {HbsNode} */ undef) {
    return b.literal({
      type: 'UndefinedLiteral',
      value: undefined,
      loc: this.source.spanFor(undef.loc)
    });
  }
  NullLiteral(/** @type {HbsNode} */ nul) {
    return b.literal({
      type: 'NullLiteral',
      value: null,
      loc: this.source.spanFor(nul.loc)
    });
  }
}
function calculateRightStrippedOffsets(original, value) {
  if (value === '') {
    // if it is empty, just return the count of newlines
    // in original
    return {
      lines: original.split('\n').length - 1,
      columns: 0
    };
  }

  // otherwise, return the number of newlines prior to
  // `value`
  const [difference] = original.split(value);
  const lines = difference.split(/\n/u);
  const lineCount = lines.length - 1;
  return {
    lines: lineCount,
    columns: unwrap(lines[lineCount]).length
  };
}
function updateTokenizerLocation(tokenizer, content) {
  let line = content.loc.start.line;
  let column = content.loc.start.column;
  const offsets = calculateRightStrippedOffsets(content.original, content.value);
  line = line + offsets.lines;
  if (offsets.lines) {
    column = offsets.columns;
  } else {
    column = column + offsets.columns;
  }
  tokenizer.line = line;
  tokenizer.column = column;
}
function acceptCallNodes(/** @type {HandlebarsNodeVisitors} */ compiler, /** @type {HbsNode} */ node) {
  let path;
  switch (node.path.type) {
    case 'PathExpression':
      path = compiler.PathExpression(node.path);
      break;
    case 'SubExpression':
      path = compiler.SubExpression(node.path);
      break;
    case 'HashLiteral':
      return compiler.HashLiteral(node.path);
    case 'StringLiteral':
    case 'UndefinedLiteral':
    case 'NullLiteral':
    case 'NumberLiteral':
    case 'BooleanLiteral':
      {
        let value;
        if (node.path.type === 'BooleanLiteral') {
          value = node.path.original.toString();
        } else if (node.path.type === 'StringLiteral') {
          value = `"${node.path.original}"`;
        } else if (node.path.type === 'NullLiteral') {
          value = 'null';
        } else if (node.path.type === 'NumberLiteral') {
          value = node.path.value.toString();
        } else {
          value = 'undefined';
        }
        throw generateSyntaxError(`${node.path.type} "${node.path.type === 'StringLiteral' ? node.path.original : value}" cannot be called as a sub-expression, replace (${value}) with ${value}`, compiler.source.spanFor(node.path.loc));
      }
  }
  const params = node.params.map(e => compiler.acceptNode(e));

  // if there is no hash, position it as a collapsed node immediately after the last param (or the
  // path, if there are also no params)
  const end = isPresentArray(params) ? getLast(params).loc : path.loc;
  const hash = node.hash ? compiler.Hash(node.hash) : b.hash({
    pairs: [],
    loc: compiler.source.spanFor(end).collapse('end')
  });
  return {
    path,
    params,
    hash
  };
}
function addElementModifier(element, mustache) {
  const {
    path,
    params,
    hash,
    loc
  } = mustache;
  if (isHBSLiteral(path)) {
    const modifier = `{{${printLiteral(path)}}}`;
    const tag = `<${element.name} ... ${modifier} ...`;
    throw generateSyntaxError(`In ${tag}, ${modifier} is not a valid modifier`, mustache.loc);
  }
  const modifier = b.elementModifier({
    path,
    params,
    hash,
    loc
  });
  element.modifiers.push(modifier);
}
function repairBlock(/** @type {Source} */ source, /** @type {HbsNode} */ block, /** @type {SourceSpan} */ fallbackStart) {
  // Extend till the beginning of the block
  if (!block.program.loc) {
    const start = block.program.body.at(0);
    const end = block.program.body.at(-1);
    if (start && end) {
      block.program.loc = {
        ...start.loc,
        end: end.loc.end
      };
    } else {
      const loc = source.spanFor(block.loc);
      block.program.loc = fallbackStart.withEnd(loc.getEnd());
    }
  }
  let endProgram = source.spanFor(block.program.loc).getEnd();
  if (block.inverse && !block.inverse.loc) {
    block.inverse.loc = endProgram.collapsed();
  }
  return block;
}

// vendored from simple-html-tokenizer because it's unexported
/** @returns {boolean} */ function isSpace(/** @type {string} */ char) {
  return /[\t\n\f ]/u.test(char);
}
class TokenizerEventHandlers extends HandlebarsNodeVisitors {
  tagOpenLine = 0;
  tagOpenColumn = 0;
  reset() {
    this.currentNode = null;
  }

  // Comment

  beginComment() {
    this.currentNode = /** @type {GlimmerPendingNode} */ ({
      type: 'CommentStatement',
      value: '',
      start: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn)
    });
  }
  appendToCommentData(/** @type {string} */ char) {
    this.currentComment.value += char;
  }
  finishComment() {
    appendChild(this.currentElement(), b.comment(this.finish(this.currentComment)));
  }

  // Data

  beginData() {
    this.currentNode = /** @type {GlimmerPendingNode} */ ({
      type: 'TextNode',
      chars: '',
      start: this.offset()
    });
  }
  appendToData(/** @type {string} */ char) {
    this.currentData.chars += char;
  }
  finishData() {
    appendChild(this.currentElement(), b.text(this.finish(this.currentData)));
  }

  // Tags - basic

  tagOpen() {
    this.tagOpenLine = this.tokenizer.line;
    this.tagOpenColumn = this.tokenizer.column;
  }
  beginStartTag() {
    this.currentNode = /** @type {GlimmerPendingNode} */ ({
      type: 'StartTag',
      name: '',
      nameStart: null,
      nameEnd: null,
      attributes: [],
      modifiers: [],
      comments: [],
      params: [],
      selfClosing: false,
      start: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn)
    });
  }
  beginEndTag() {
    this.currentNode = /** @type {GlimmerPendingNode} */ ({
      type: 'EndTag',
      name: '',
      start: this.source.offsetFor(this.tagOpenLine, this.tagOpenColumn)
    });
  }
  finishTag() {
    let tag = this.finish(this.currentTag);
    if (tag.type === 'StartTag') {
      this.finishStartTag();
      if (tag.name === ':') {
        throw generateSyntaxError('Invalid named block named detected, you may have created a named block without a name, or you may have began your name with a number. Named blocks must have names that are at least one character long, and begin with a lower case letter', this.source.spanFor({
          start: this.currentTag.start.toJSON(),
          end: this.offset().toJSON()
        }));
      }
      if (voidMap.has(tag.name) || tag.selfClosing) {
        this.finishEndTag(true);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- exhaustive
      assert(tag.type === 'EndTag', `Invalid tag type ${tag.type}`);
      this.finishEndTag(false);
    }
  }
  finishStartTag() {
    let {
      name,
      nameStart,
      nameEnd
    } = this.currentStartTag;
    let nameLoc = nameStart.until(nameEnd);
    let [head, ...tail] = asPresentArray(name.split('.'));
    let path = b.path({
      head: b.head({
        original: head,
        loc: nameLoc.sliceStartChars({
          chars: head.length
        })
      }),
      tail,
      loc: nameLoc
    });
    let {
      attributes,
      modifiers,
      comments,
      params,
      selfClosing,
      loc
    } = this.finish(this.currentStartTag);
    let element = b.element({
      path,
      selfClosing,
      attributes,
      modifiers,
      comments,
      params,
      children: [],
      openTag: loc,
      closeTag: selfClosing ? null : SourceSpan.broken(),
      loc
    });
    this.elementStack.push(element);
  }
  finishEndTag(/** @type {boolean} */ isVoid) {
    let {
      start: closeTagStart
    } = this.currentTag;
    let tag = this.finish(this.currentTag);
    let element = this.elementStack.pop();
    this.validateEndTag(tag, element, isVoid);
    let parent = this.currentElement();
    if (isVoid) {
      element.closeTag = null;
    } else if (element.selfClosing) {
      assert(element.closeTag === null);
    } else {
      element.closeTag = closeTagStart.until(this.offset());
    }
    element.loc = element.loc.withEnd(this.offset());
    appendChild(parent, b.element(element));
  }
  markTagAsSelfClosing() {
    let tag = this.currentTag;
    if (tag.type === 'StartTag') {
      tag.selfClosing = true;
    } else {
      throw generateSyntaxError(`Invalid end tag: closing tag must not be self-closing`, this.source.spanFor({
        start: tag.start.toJSON(),
        end: this.offset().toJSON()
      }));
    }
  }

  // Tags - name

  appendToTagName(/** @type {string} */ char) {
    let tag = this.currentTag;
    tag.name += char;
    if (tag.type === 'StartTag') {
      let offset = this.offset();
      if (tag.nameStart === null) {
        assert(tag.nameEnd === null);

        // Note that the tokenizer already consumed the token here
        tag.nameStart = offset.move(-1);
      }
      tag.nameEnd = offset;
    }
  }

  // Tags - attributes

  beginAttribute() {
    let offset = this.offset();
    this.currentAttribute = /** @type {GlimmerPendingAttribute} */ ({
      name: '',
      parts: [],
      currentPart: null,
      isQuoted: false,
      isDynamic: false,
      start: offset,
      valueSpan: offset.collapsed()
    });
  }
  appendToAttributeName(/** @type {string} */ char) {
    this.currentAttr.name += char;

    // The block params parsing code can actually handle peek=non-space just
    // fine, but this check was added as an optimization, as there is a little
    // bit of setup overhead for the parsing logic just to immediately bail
    if (this.currentAttr.name === 'as') {
      this.parsePossibleBlockParams();
    }
  }
  beginAttributeValue(/** @type {boolean} */ isQuoted) {
    this.currentAttr.isQuoted = isQuoted;
    this.startTextPart();
    this.currentAttr.valueSpan = this.offset().collapsed();
  }
  appendToAttributeValue(/** @type {string} */ char) {
    let parts = this.currentAttr.parts;
    let lastPart = parts[parts.length - 1];
    let current = this.currentAttr.currentPart;
    if (current) {
      current.chars += char;

      // update end location for each added char
      current.loc = current.loc.withEnd(this.offset());
    } else {
      // initially assume the text node is a single char
      let loc = this.offset();

      // the tokenizer line/column have already been advanced, correct location info
      if (char === '\n') {
        loc = lastPart ? lastPart.loc.getEnd() : this.currentAttr.valueSpan.getStart();
      } else {
        loc = loc.move(-1);
      }
      this.currentAttr.currentPart = b.text({
        chars: char,
        loc: loc.collapsed()
      });
    }
  }
  finishAttributeValue() {
    this.finalizeTextPart();
    let tag = this.currentTag;
    let tokenizerPos = this.offset();
    if (tag.type === 'EndTag') {
      throw generateSyntaxError(`Invalid end tag: closing tag must not have attributes`, this.source.spanFor({
        start: tag.start.toJSON(),
        end: tokenizerPos.toJSON()
      }));
    }
    let {
      name,
      parts,
      start,
      isQuoted,
      isDynamic,
      valueSpan
    } = this.currentAttr;

    // Just trying to be helpful with `<Hello |foo|>` rather than letting it through as an attribute
    if (name.startsWith('|') && parts.length === 0 && !isQuoted && !isDynamic) {
      throw generateSyntaxError('Invalid block parameters syntax: block parameters must be preceded by the `as` keyword', start.until(start.move(name.length)));
    }
    let value = this.assembleAttributeValue(parts, isQuoted, isDynamic, start.until(tokenizerPos));
    value.loc = valueSpan.withEnd(tokenizerPos);
    let attribute = b.attr({
      name,
      value,
      loc: start.until(tokenizerPos)
    });
    this.currentStartTag.attributes.push(attribute);
  }
  parsePossibleBlockParams() {
    // Regex to validate the identifier for block parameters.
    // Based on the ID validation regex in Handlebars.

    const ID_INVERSE_PATTERN = /[!"#%&'()*+./;<=>@[\\\]^`{|}~]/u;
    assert(this.tokenizer.state === 'attributeName');
    const element = this.currentStartTag;
    const as = this.currentAttr;
    let state = {
      state: 'PossibleAs'
    };
    const handlers = {
      PossibleAs: next => {
        assert(state.state === 'PossibleAs');
        if (isSpace(next)) {
          // " as ..."
          state = {
            state: 'BeforeStartPipe'
          };
          this.tokenizer.transitionTo('afterAttributeName');
          this.tokenizer.consume();
        } else if (next === '|') {
          // " as|..."
          // Following Handlebars and require a space between "as" and the pipe
          throw generateSyntaxError(`Invalid block parameters syntax: expecting at least one space character between "as" and "|"`, as.start.until(this.offset().move(1)));
        } else {
          // " as{{...", " async...", " as=...", " as>...", " as/>..."
          // Don't consume, let the normal tokenizer code handle the next steps
          state = {
            state: 'Done'
          };
        }
      },
      BeforeStartPipe: next => {
        assert(state.state === 'BeforeStartPipe');
        if (isSpace(next)) {
          this.tokenizer.consume();
        } else if (next === '|') {
          state = {
            state: 'BeforeBlockParamName'
          };
          this.tokenizer.transitionTo('beforeAttributeName');
          this.tokenizer.consume();
        } else {
          // " as {{...", " as bs...", " as =...", " as ...", " as/>..."
          // Don't consume, let the normal tokenizer code handle the next steps
          state = {
            state: 'Done'
          };
        }
      },
      BeforeBlockParamName: next => {
        assert(state.state === 'BeforeBlockParamName');
        if (isSpace(next)) {
          this.tokenizer.consume();
        } else if (next === '') {
          // The HTML tokenizer ran out of characters, so we are either
          // encountering mustache or <EOF>
          state = {
            state: 'Done'
          };
          this.pendingError = {
            mustache(loc) {
              throw generateSyntaxError(`Invalid block parameters syntax: mustaches cannot be used inside parameters list`, loc);
            },
            eof(loc) {
              throw generateSyntaxError(`Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list`, as.start.until(loc));
            }
          };
        } else if (next === '|') {
          if (element.params.length === 0) {
            // Following Handlebars and treat empty block params a syntax error
            throw generateSyntaxError(`Invalid block parameters syntax: empty parameters list, expecting at least one identifier`, as.start.until(this.offset().move(1)));
          } else {
            state = {
              state: 'AfterEndPipe'
            };
            this.tokenizer.consume();
          }
        } else if (next === '>' || next === '/') {
          throw generateSyntaxError(`Invalid block parameters syntax: incomplete parameters list, expecting "|" but the tag was closed prematurely`, as.start.until(this.offset().move(1)));
        } else {
          // slurp up anything else into the name, validate later
          state = {
            state: 'BlockParamName',
            name: next,
            start: this.offset()
          };
          this.tokenizer.consume();
        }
      },
      BlockParamName: next => {
        assert(state.state === 'BlockParamName');
        if (next === '') {
          // The HTML tokenizer ran out of characters, so we are either
          // encountering mustache or <EOF>, HBS side will attach the error
          // to the next span
          state = {
            state: 'Done'
          };
          this.pendingError = {
            mustache(loc) {
              throw generateSyntaxError(`Invalid block parameters syntax: mustaches cannot be used inside parameters list`, loc);
            },
            eof(loc) {
              throw generateSyntaxError(`Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list`, as.start.until(loc));
            }
          };
        } else if (next === '|' || isSpace(next)) {
          let loc = state.start.until(this.offset());
          if (state.name === 'this' || ID_INVERSE_PATTERN.test(state.name)) {
            throw generateSyntaxError(`Invalid block parameters syntax: invalid identifier name \`${state.name}\``, loc);
          }
          element.params.push(b.var({
            name: state.name,
            loc
          }));
          state = next === '|' ? {
            state: 'AfterEndPipe'
          } : {
            state: 'BeforeBlockParamName'
          };
          this.tokenizer.consume();
        } else if (next === '>' || next === '/') {
          throw generateSyntaxError(`Invalid block parameters syntax: expecting "|" but the tag was closed prematurely`, as.start.until(this.offset().move(1)));
        } else {
          // slurp up anything else into the name, validate later
          state.name += next;
          this.tokenizer.consume();
        }
      },
      AfterEndPipe: next => {
        assert(state.state === 'AfterEndPipe');
        if (isSpace(next)) {
          this.tokenizer.consume();
        } else if (next === '') {
          // The HTML tokenizer ran out of characters, so we are either
          // encountering mustache or <EOF>, HBS side will attach the error
          // to the next span
          state = {
            state: 'Done'
          };
          this.pendingError = {
            mustache(loc) {
              throw generateSyntaxError(`Invalid block parameters syntax: modifiers cannot follow parameters list`, loc);
            },
            eof(loc) {
              throw generateSyntaxError(`Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list`, as.start.until(loc));
            }
          };
        } else if (next === '>' || next === '/') {
          // Don't consume, let the normal tokenizer code handle the next steps
          state = {
            state: 'Done'
          };
        } else {
          // Slurp up the next "token" for the error span
          state = {
            state: 'Error',
            message: 'Invalid block parameters syntax: expecting the tag to be closed with ">" or "/>" after parameters list',
            start: this.offset()
          };
          this.tokenizer.consume();
        }
      },
      Error: next => {
        assert(state.state === 'Error');
        if (next === '' || next === '/' || next === '>' || isSpace(next)) {
          throw generateSyntaxError(state.message, state.start.until(this.offset()));
        } else {
          // Slurp up the next "token" for the error span
          this.tokenizer.consume();
        }
      },
      Done: () => {
      }
    };
    let next;
    do {
      next = this.tokenizer.peek();
      handlers[state.state](next);
    } while (state.state !== 'Done' && next !== '');
    assert(state.state === 'Done');
  }
  reportSyntaxError(message) {
    throw generateSyntaxError(message, this.offset().collapsed());
  }
  assembleConcatenatedValue(/** @type {any[]} */ parts) {
    let first = getFirst(parts);
    let last = getLast(parts);
    return b.concat({
      parts,
      loc: this.source.spanFor(first.loc).extend(this.source.spanFor(last.loc))
    });
  }
  validateEndTag(tag, element, /** @type {boolean} */ selfClosing) {
    if (voidMap.has(tag.name) && !selfClosing) {
      // EngTag is also called by StartTag for void and self-closing tags (i.e.
      // <input> or <br />, so we need to check for that here. Otherwise, we would
      // throw an error for those cases.
      throw generateSyntaxError(`<${tag.name}> elements do not need end tags. You should remove it`, tag.loc);
    } else if (element.type !== 'ElementNode') {
      throw generateSyntaxError(`Closing tag </${tag.name}> without an open tag`, tag.loc);
    } else if (element.tag !== tag.name) {
      throw generateSyntaxError(`Closing tag </${tag.name}> did not match last open tag <${element.tag}> (on line ${element.loc.startPosition.line})`, tag.loc);
    }
  }
  assembleAttributeValue(/** @type {any[]} */ parts, /** @type {boolean} */ isQuoted, /** @type {boolean} */ isDynamic, /** @type {SourceSpan} */ span) {
    if (isDynamic) {
      if (isQuoted) {
        return this.assembleConcatenatedValue(parts);
      } else {
        const [head, a] = parts;
        if (a === undefined || a.type === 'TextNode' && a.chars === '/') {
          return head;
        } else {
          throw generateSyntaxError(`An unquoted attribute value must be a string or a mustache, ` + `preceded by whitespace or a '=' character, and ` + `followed by whitespace, a '>' character, or '/>'`, span);
        }
      }
    } else if (isPresentArray(parts)) {
      return parts[0];
    } else {
      return b.text({
        chars: '',
        loc: span
      });
    }
  }
}

/**
  ASTPlugins can make changes to the Glimmer template AST before
  compilation begins.
*/

const syntax = {
  parse: preprocess,
  builders: publicBuilder,
  print: build,
  traverse,
  Walker
};
class CodemodEntityParser extends EntityParser {
  // match upstream types, but never match an entity
  constructor() {
    super({});
  }
  parse() {
    return undefined;
  }
}
/** @returns {import("glimmer-ast-types").GlimmerNode} */ function preprocess(/** @type {string | undefined} */ input, options = {}) {
  let mode = options.mode || 'precompile';
  let source;
  let ast;
  if (typeof input === 'string') {
    source = new Source(input, options.meta?.moduleName);
    if (mode === 'codemod') {
      ast = parseWithoutProcessing(input, options.parseOptions);
    } else {
      ast = parse(input, options.parseOptions);
    }
  } else if (input instanceof Source) {
    source = input;
    if (mode === 'codemod') {
      ast = parseWithoutProcessing(input.source, options.parseOptions);
    } else {
      ast = parse(input.source, options.parseOptions);
    }
  } else {
    source = new Source('', options.meta?.moduleName);
    ast = input;
  }
  let entityParser = undefined;
  if (mode === 'codemod') {
    entityParser = new CodemodEntityParser();
  }
  let offsets = SourceSpan.forCharPositions(source, 0, source.source.length);
  ast.loc = {
    source: '(program)',
    start: offsets.startPosition,
    end: offsets.endPosition
  };
  let template = new TokenizerEventHandlers(source, entityParser, mode).parse(ast, options.locals ?? []);
  if (options.plugins?.ast) {
    for (const transform of options.plugins.ast) {
      let env = assign({}, options, {
        syntax
      }, {
        plugins: undefined
      });
      let pluginResult = transform(env);
      traverse(template, pluginResult.visitor);
    }
  }
  return template;
}

/**
 * Gets the correct Token from the Node based on it's type
 */
function getPathName(node, scopedTokens, options) {
  if (node.type === 'PathExpression') {
    if (node.head.type === 'AtHead' || node.head.type === 'ThisHead') {
      return;
    }
    const possbleToken = node.head.name;
    if (scopedTokens.indexOf(possbleToken) === -1) {
      return possbleToken;
    }
  } else if (node.type === 'ElementNode') {
    const {
      tag
    } = node;
    const char = tag.charAt(0);
    if (char === ':' || char === '@') {
      return;
    }
    if (!options.includeHtmlElements && tag.indexOf('.') === -1 && tag.toLowerCase() === tag) {
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated -- @fixme
    if (tag.substr(0, 5) === 'this.') {
      return;
    }

    // the tag may be from a yielded object
    // example:
    //   <x.button>
    // An ElementNode does not parse the "tag" in to a PathExpression
    // so we have to split on `.`, just like how `this` presence is checked.
    if (tag.includes('.')) {
      let [potentialLocal] = tag.split('.');
      if (scopedTokens.includes(potentialLocal)) return;
    }
    if (scopedTokens.includes(tag)) return;
    return tag;
  }
}

/**
 * Adds tokens to the tokensSet based on their node.type
 */
function addTokens(tokensSet, node, scopedTokens, options) {
  const maybePathName = getPathName(node, scopedTokens, options);
  if (maybePathName !== undefined && maybePathName[0] !== '@') {
    const maybeFirstPathSegment = maybePathName.split('.')[0];
    if (maybeFirstPathSegment && !scopedTokens.includes(maybeFirstPathSegment)) {
      tokensSet.add(maybeFirstPathSegment);
    }
  }
}

/**
 * Parses and traverses a given template to extract all template locals
 * referenced that could possible come from the parent scope. Can exclude known keywords
 * optionally.
 */
function getTemplateLocals(html, options = {
  includeHtmlElements: false,
  includeKeywords: false
}) {
  const ast = preprocess(html);
  const tokensSet = new Set();
  const scopedTokens = [];
  traverse(ast, {
    Block: {
      enter({
        blockParams
      }) {
        blockParams.forEach(param => {
          scopedTokens.push(param);
        });
      },
      exit({
        blockParams
      }) {
        blockParams.forEach(() => {
          scopedTokens.pop();
        });
      }
    },
    ElementNode: {
      enter(node) {
        node.blockParams.forEach(param => {
          scopedTokens.push(param);
        });
        addTokens(tokensSet, node, scopedTokens, options);
      },
      exit({
        blockParams
      }) {
        blockParams.forEach(() => {
          scopedTokens.pop();
        });
      }
    },
    PathExpression(node) {
      addTokens(tokensSet, node, scopedTokens, options);
    }
  });
  let tokens = [];
  tokensSet.forEach(s => tokens.push(s));
  if (!options.includeKeywords) {
    tokens = tokens.filter(token => !isKeyword(token));
  }
  return tokens;
}

const opcodes = {
  GetStrictKeyword: 31,
  GetFreeAsComponentOrHelperHead: 35,
  GetFreeAsHelperHead: 37,
  GetFreeAsModifierHead: 38,
  GetFreeAsComponentHead: 39};

/**
 * This is a convenience function for creating ASTv2 nodes, with an optional name and the node's
 * options.
 *
 * ```ts
 * export class HtmlText extends node('HtmlText').fields<{ chars: string }>() {}
 * ```
 *
 * This creates a new ASTv2 node with the name `'HtmlText'` and one field `chars: string` (in
 * addition to a `loc: SourceOffsets` field, which all nodes have).
 *
 * ```ts
 * export class Args extends node().fields<{
 *  positional: PositionalArguments;
 *  named: NamedArguments
 * }>() {}
 * ```
 *
 * This creates a new un-named ASTv2 node with two fields (`positional: Positional` and `named:
 * Named`, in addition to the generic `loc: SourceOffsets` field).
 *
 * Once you create a node using `node`, it is instantiated with all of its fields (including `loc`):
 *
 * ```ts
 * new HtmlText({ loc: offsets, chars: someString });
 * ```
 */

function node(/** @type {string | undefined} */ name) {
  if (name !== undefined) {
    const type = name;
    return {
      fields() {
        return class {
          // SAFETY: initialized via `assign` in the constructor.

          type;
          constructor(fields) {
            this.type = type;
            assign(this, fields);
            setLocalDebugType('syntax:mir:node', this);
          }
        };
      }
    };
  } else {
    return {
      fields() {
        return class {
          // SAFETY: initialized via `assign` in the constructor.

          constructor(fields) {
            assign(this, fields);
          }
        };
      }
    };
  }
}

/**
 * Corresponds to syntaxes with positional and named arguments:
 *
 * - SubExpression
 * - Invoking Append
 * - Invoking attributes
 * - InvokeBlock
 *
 * If `Args` is empty, the `SourceOffsets` for this node should be the collapsed position
 * immediately after the parent call node's `callee`.
 */
class Args extends node().fields() {
  /** @returns {Args} */ static empty(/** @type {SourceSpan} */ loc) {
    return new Args({
      loc,
      positional: PositionalArguments.empty(loc),
      named: NamedArguments.empty(loc)
    });
  }
  /** @returns {Args} */ static named(/** @type {NamedArguments} */ named) {
    return new Args({
      loc: named.loc,
      positional: PositionalArguments.empty(named.loc.collapse('end')),
      named
    });
  }
  nth(/** @type {number} */ offset) {
    return this.positional.nth(offset);
  }
  get(/** @type {string} */ name) {
    return this.named.get(name);
  }
  /** @returns {boolean} */ isEmpty() {
    return this.positional.isEmpty() && this.named.isEmpty();
  }
}

/**
 * Corresponds to positional arguments.
 *
 * If `PositionalArguments` is empty, the `SourceOffsets` for this node should be the collapsed
 * position immediately after the parent call node's `callee`.
 */
class PositionalArguments extends node().fields() {
  /** @returns {PositionalArguments} */ static empty(/** @type {SourceSpan} */ loc) {
    return new PositionalArguments({
      loc,
      exprs: []
    });
  }
  get size() {
    return this.exprs.length;
  }
  nth(/** @type {number} */ offset) {
    return this.exprs[offset] || null;
  }
  /** @returns {boolean} */ isEmpty() {
    return this.exprs.length === 0;
  }
}

/**
 * Corresponds to named arguments.
 *
 * If `PositionalArguments` and `NamedArguments` are empty, the `SourceOffsets` for this node should
 * be the same as the `Args` node that contains this node.
 *
 * If `PositionalArguments` is not empty but `NamedArguments` is empty, the `SourceOffsets` for this
 * node should be the collapsed position immediately after the last positional argument.
 */
class NamedArguments extends node().fields() {
  /** @returns {NamedArguments} */ static empty(/** @type {SourceSpan} */ loc) {
    return new NamedArguments({
      loc,
      entries: []
    });
  }
  get size() {
    return this.entries.length;
  }
  get(/** @type {string} */ name) {
    let entry = this.entries.filter(e => e.name.chars === name)[0];
    return entry ? entry.value : null;
  }
  /** @returns {boolean} */ isEmpty() {
    return this.entries.length === 0;
  }
}

/**
 * Corresponds to a single named argument.
 *
 * ```hbs
 * x=<expr>
 * ```
 */
class NamedArgument {
  loc;
  name;
  value;
  constructor(options) {
    this.loc = options.name.loc.extend(options.value.loc);
    this.name = options.name;
    this.value = options.value;
  }
}

/**
 * Attr nodes look like HTML attributes, but are classified as:
 *
 * 1. `HtmlAttr`, which means a regular HTML attribute in Glimmer
 * 2. `SplatAttr`, which means `...attributes`
 * 3. `ComponentArg`, which means an attribute whose name begins with `@`, and it is therefore a
 *    component argument.
 */

/**
 * `HtmlAttr` and `SplatAttr` are grouped together because the order of the `SplatAttr` node,
 * relative to other attributes, matters.
 */

/**
 * "Attr Block" nodes are allowed inside an open element tag in templates. They interact with the
 * element (or component).
 */

/**
 * `HtmlAttr` nodes are valid HTML attributes, with or without a value.
 *
 * Exceptions:
 *
 * - `...attributes` is `SplatAttr`
 * - `@x=<value>` is `ComponentArg`
 */
class HtmlAttr extends node('HtmlAttr').fields() {}
class SplatAttr extends node('SplatAttr').fields() {}

/**
 * Corresponds to an argument passed by a component (`@x=<value>`)
 */
class ComponentArg extends node().fields() {
  /**
   * Convert the component argument into a named argument node
   */
  /** @returns {NamedArgument} */ toNamedArgument() {
    return new NamedArgument({
      name: this.name,
      value: this.value
    });
  }
}

/**
 * An `ElementModifier` is just a normal call node in modifier position.
 */
class ElementModifier extends node('ElementModifier').fields() {}

/**
 * Content Nodes are allowed in content positions in templates. They correspond to behavior in the
 * [Data][data] tokenization state in HTML.
 *
 * [data]: https://html.spec.whatwg.org/multipage/parsing.html#data-state
 */

class GlimmerComment extends node('GlimmerComment').fields() {}
class HtmlText extends node('HtmlText').fields() {}
class HtmlComment extends node('HtmlComment').fields() {}
class AppendContent extends node('AppendContent').fields() {
  get callee() {
    if (this.value.type === 'Call') {
      return this.value.callee;
    } else {
      return this.value;
    }
  }
  get args() {
    if (this.value.type === 'Call') {
      return this.value.args;
    } else {
      return Args.empty(this.value.loc.collapse('end'));
    }
  }
}
class InvokeBlock extends node('InvokeBlock').fields() {}
/**
 * Corresponds to a component invocation. When the content of a component invocation contains no
 * named blocks, `blocks` contains a single named block named `"default"`. When a component
 * invocation is self-closing, `blocks` is empty.
 */
class InvokeComponent extends node('InvokeComponent').fields() {
  get args() {
    let entries = this.componentArgs.map(a => a.toNamedArgument());
    return Args.named(new NamedArguments({
      loc: SpanList.range(entries, this.callee.loc.collapse('end')),
      entries
    }));
  }
}
/**
 * Corresponds to a simple HTML element. The AST allows component arguments and modifiers to support
 * future extensions.
 */
class SimpleElement extends node('SimpleElement').fields() {
  get args() {
    let entries = this.componentArgs.map(a => a.toNamedArgument());
    return Args.named(new NamedArguments({
      loc: SpanList.range(entries, this.tag.loc.collapse('end')),
      entries
    }));
  }
}

/**
 * A Handlebars literal.
 *
 * {@link https://handlebarsjs.com/guide/expressions.html#literal-segments}
 */

/**
 * Corresponds to a Handlebars literal.
 *
 * @see {LiteralValue}
 */
class LiteralExpression extends node('Literal').fields() {
  /** @returns {SourceSlice} */ toSlice() {
    return new SourceSlice({
      loc: this.loc,
      chars: this.value
    });
  }
}
/**
 * Returns true if an input {@see ExpressionNode} is a literal.
 */
function isLiteral$1(node, kind) {
  if (node.type === 'Literal') {
    if (kind === undefined) {
      return true;
    } else if (kind === 'null') {
      return node.value === null;
    } else {
      return typeof node.value === kind;
    }
  } else {
    return false;
  }
}

/**
 * Corresponds to a path in expression position.
 *
 * ```hbs
 * this
 * this.x
 * @x
 * @x.y
 * x
 * x.y
 * ```
 */
class PathExpression extends node('Path').fields() {}

/**
 * Corresponds to a known strict-mode keyword. It behaves similarly to a
 * PathExpression with a FreeVarReference, but implies StrictResolution and
 * is guaranteed to not have a tail, since `{{outlet.foo}}` would have been
 * illegal.
 */
class KeywordExpression extends node('Keyword').fields() {}

/**
 * Corresponds to a parenthesized call expression.
 *
 * ```hbs
 * (x)
 * (x.y)
 * (x y)
 * (x.y z)
 * ```
 */
class CallExpression extends node('Call').fields() {}

/**
 * Corresponds to an interpolation in attribute value position.
 *
 * ```hbs
 * <a href="{{url}}.html"
 * ```
 */
class InterpolateExpression extends node('Interpolate').fields() {}

/**
 * Corresponds to an entire template.
 */
class Template extends node().fields() {}

/**
 * Represents a block. In principle this could be merged with `NamedBlock`, because all cases
 * involving blocks have at least a notional name.
 */
class Block extends node().fields() {}

/**
 * Corresponds to a collection of named blocks.
 */
class NamedBlocks extends node().fields() {
  /**
   * Get the `NamedBlock` for a given name.
   */

  get(name) {
    return this.blocks.filter(block => block.name.chars === name)[0] || null;
  }
}
/**
 * Corresponds to a single named block. This is used for anonymous named blocks (`default` and
 * `else`).
 */
class NamedBlock extends node().fields() {
  get args() {
    let entries = this.componentArgs.map(a => a.toNamedArgument());
    return Args.named(new NamedArguments({
      loc: SpanList.range(entries, this.name.loc.collapse('end')),
      entries
    }));
  }
}

/**
 * Corresponds to `this` at the head of an expression.
 */
class ThisReference extends node('This').fields() {}

/**
 * Corresponds to `@<ident>` at the beginning of an expression.
 */
class ArgReference extends node('Arg').fields() {}

/**
 * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is in the current
 * block's scope.
 */
class LocalVarReference extends node('Local').fields() {}

/**
 * Corresponds to `<ident>` at the beginning of an expression, when `<ident>` is *not* in the
 * current block's scope.
 *
 * The `resolution: FreeVarResolution` field describes how to resolve the free variable.
 *
 * Note: In strict mode, it must always be a variable that is in a concrete JavaScript scope that
 * the template will be installed into.
 */
class FreeVarReference extends node('Free').fields() {}

/// FreeVarNamespace ///

const HELPER_VAR_NS = 'Helper';
const MODIFIER_VAR_NS = 'Modifier';
const COMPONENT_VAR_NS = 'Component';

/**
 * A free variable is resolved according to a resolution rule:
 *
 * 1. Strict resolution
 * 2. Namespaced resolution
 */


/**
 * Strict resolution is used:
 *
 * 1. in a strict mode template
 * 2. in an local variable invocation with dot paths
 */
const STRICT_RESOLUTION = {
  resolution: () => opcodes.GetStrictKeyword,
  serialize: () => 'Strict',
  isAngleBracket: false
};
const HTML_RESOLUTION = {
  ...STRICT_RESOLUTION,
  isAngleBracket: true
};
function isStrictResolution(value) {
  return value === STRICT_RESOLUTION;
}

/**
 * A `LooseModeResolution` includes one or more namespaces to resolve the variable in
 *
 * In practice, there are a limited number of possible combinations of these degrees of freedom,
 * and they are captured by the `Namespaces` union below.
 */
class LooseModeResolution {
  /**
   * Namespaced resolution is used in an unambiguous syntax position:
   *
   * 1. `(sexp)` (namespace: `Helper`)
   * 2. `{{#block}}` (namespace: `Component`)
   * 3. `<a {{modifier}}>` (namespace: `Modifier`)
   * 4. `<Component />` (namespace: `Component`)
   */
  static namespaced(namespace, isAngleBracket = false) {
    return new LooseModeResolution([namespace], isAngleBracket);
  }

  /**
   * Append resolution is used when the variable should be resolved in both the `component` and
   * `helper` namespaces.
   *
   * ```hbs
   * {{x}}
   * ```
   *
   * ```hbs
   * {{x y}}
   * ```
   *
   * ^ In either case, `x` should be resolved in the `component` and `helper` namespaces.
   */
  static append() {
    return new LooseModeResolution([COMPONENT_VAR_NS, HELPER_VAR_NS]);
  }

  /**
   * Trusting append resolution is used when the variable should be resolved only in the
   * `helper` namespaces.
   *
   * ```hbs
   * {{{x}}}
   * ```
   *
   * ```hbs
   * {{{x y}}}
   * ```
   *
   * ^ In either case, `x` should be resolved in the `helper` namespace.
   */
  static trustingAppend() {
    return this.namespaced(HELPER_VAR_NS);
  }
  constructor(namespaces, isAngleBracket = false) {
    this.namespaces = namespaces;
    this.isAngleBracket = isAngleBracket;
  }
  /** @returns {number} */ resolution() {
    if (this.namespaces.length === 1) {
      switch (this.namespaces[0]) {
        case HELPER_VAR_NS:
          return opcodes.GetFreeAsHelperHead;
        case MODIFIER_VAR_NS:
          return opcodes.GetFreeAsModifierHead;
        case COMPONENT_VAR_NS:
          return opcodes.GetFreeAsComponentHead;
      }
    } else {
      return opcodes.GetFreeAsComponentOrHelperHead;
    }
  }
  /** @returns {string} */ serialize() {
    if (this.namespaces.length === 1) {
      return this.namespaces[0];
    } else {
      return 'ComponentOrHelper';
    }
  }
}
const HELPER_NAMESPACE = HELPER_VAR_NS;
const MODIFIER_NAMESPACE = MODIFIER_VAR_NS;
const COMPONENT_NAMESPACE = COMPONENT_VAR_NS;

/**
 * A `Namespaced` must be resolved in one or more namespaces.
 *
 * ```hbs
 * <X />
 * ```
 *
 * ^ `X` is resolved in the `component` namespace
 *
 * ```hbs
 * (x)
 * ```
 *
 * ^ `x` is resolved in the `helper` namespace
 *
 * ```hbs
 * <a {{x}} />
 * ```
 *
 * ^ `x` is resolved in the `modifier` namespace
 */

// Serialization

function loadResolution(resolution) {
  if (resolution === 'Strict') {
    return STRICT_RESOLUTION;
  } else if (resolution === 'ComponentOrHelper') {
    return LooseModeResolution.append();
  } else {
    return LooseModeResolution.namespaced(resolution);
  }
}

var api = /*#__PURE__*/Object.freeze({
  __proto__: null,
  AppendContent: AppendContent,
  ArgReference: ArgReference,
  Args: Args,
  Block: Block,
  COMPONENT_NAMESPACE: COMPONENT_NAMESPACE,
  CallExpression: CallExpression,
  ComponentArg: ComponentArg,
  ElementModifier: ElementModifier,
  FreeVarReference: FreeVarReference,
  GlimmerComment: GlimmerComment,
  HELPER_NAMESPACE: HELPER_NAMESPACE,
  HTML_RESOLUTION: HTML_RESOLUTION,
  HtmlAttr: HtmlAttr,
  HtmlComment: HtmlComment,
  HtmlText: HtmlText,
  InterpolateExpression: InterpolateExpression,
  InvokeBlock: InvokeBlock,
  InvokeComponent: InvokeComponent,
  KeywordExpression: KeywordExpression,
  LiteralExpression: LiteralExpression,
  LocalVarReference: LocalVarReference,
  LooseModeResolution: LooseModeResolution,
  MODIFIER_NAMESPACE: MODIFIER_NAMESPACE,
  NamedArgument: NamedArgument,
  NamedArguments: NamedArguments,
  NamedBlock: NamedBlock,
  NamedBlocks: NamedBlocks,
  PathExpression: PathExpression,
  PositionalArguments: PositionalArguments,
  STRICT_RESOLUTION: STRICT_RESOLUTION,
  SimpleElement: SimpleElement,
  SplatAttr: SplatAttr,
  Template: Template,
  ThisReference: ThisReference,
  isLiteral: isLiteral$1,
  isStrictResolution: isStrictResolution,
  loadResolution: loadResolution,
  node: node
});

class SymbolTable {
  /** @returns {ProgramSymbolTable} */ static top(locals, keywords, options) {
    return new ProgramSymbolTable(locals, keywords, options);
  }
  /** @returns {BlockSymbolTable} */ child(locals) {
    let symbols = locals.map(name => this.allocate(name));
    return new BlockSymbolTable(this, locals, symbols);
  }
}
class ProgramSymbolTable extends SymbolTable {
  constructor(templateLocals, keywords, options) {
    super();
    this.templateLocals = templateLocals;
    this.keywords = keywords;
    this.options = options;
    setLocalDebugType('syntax:symbol-table:program', this, {
      debug: () => ({
        templateLocals: this.templateLocals,
        keywords: this.keywords,
        symbols: this.symbols,
        upvars: this.upvars,
        named: this.named,
        blocks: this.blocks
      })
    });
  }
  symbols = [];
  upvars = [];
  size = 1;
  named = dict();
  blocks = dict();
  usedTemplateLocals = [];
  /** @returns {ProgramSymbolTable} */ root() {
    return this;
  }
  /** @returns {boolean} */ hasLexical(/** @type {string} */ name) {
    return this.options.lexicalScope(name);
  }
  /** @returns {boolean} */ hasKeyword(/** @type {string} */ name) {
    return this.keywords.includes(name);
  }
  /** @returns {number} */ getKeyword(/** @type {string} */ name) {
    return this.allocateFree(name, STRICT_RESOLUTION);
  }
  getUsedTemplateLocals() {
    return this.usedTemplateLocals;
  }
  /** @returns {boolean} */ has(/** @type {string} */ name) {
    return this.templateLocals.includes(name);
  }
  get(/** @type {string} */ name) {
    let index = this.usedTemplateLocals.indexOf(name);
    if (index !== -1) {
      return [index, true];
    }
    index = this.usedTemplateLocals.length;
    this.usedTemplateLocals.push(name);
    return [index, true];
  }
  getLocalsMap() {
    return dict();
  }
  getDebugInfo() {
    return [this.getLocalsMap(), this.named];
  }
  /** @returns {number} */ allocateFree(/** @type {string} */ name, resolution) {
    // If the name in question is an uppercase (i.e. angle-bracket) component invocation, run
    // the optional `customizeComponentName` function provided to the precompiler.
    if (resolution.resolution() === opcodes.GetFreeAsComponentHead && resolution.isAngleBracket) {
      name = this.options.customizeComponentName(name);
    }
    let index = this.upvars.indexOf(name);
    if (index !== -1) {
      return index;
    }
    index = this.upvars.length;
    this.upvars.push(name);
    return index;
  }
  /** @returns {number} */ allocateNamed(/** @type {string} */ name) {
    let named = this.named[name];
    if (!named) {
      named = this.named[name] = this.allocate(name);
    }
    return named;
  }
  /** @returns {number} */ allocateBlock(/** @type {string} */ name) {
    if (name === 'inverse') {
      name = 'else';
    }
    let block = this.blocks[name];
    if (!block) {
      block = this.blocks[name] = this.allocate(`&${name}`);
    }
    return block;
  }
  /** @returns {number} */ allocate(/** @type {string} */ identifier) {
    this.symbols.push(identifier);
    return this.size++;
  }
}
class BlockSymbolTable extends SymbolTable {
  constructor(/** @type {SymbolTable} */ parent, symbols, slots) {
    super();
    this.parent = parent;
    this.symbols = symbols;
    this.slots = slots;
  }
  /** @returns {ProgramSymbolTable} */ root() {
    return this.parent.root();
  }
  get locals() {
    return this.symbols;
  }
  /** @returns {boolean} */ hasLexical(/** @type {string} */ name) {
    return this.parent.hasLexical(name);
  }
  /** @returns {number} */ getKeyword(/** @type {string} */ name) {
    return this.parent.getKeyword(name);
  }
  /** @returns {boolean} */ hasKeyword(/** @type {string} */ name) {
    return this.parent.hasKeyword(name);
  }
  /** @returns {boolean} */ has(/** @type {string} */ name) {
    return this.symbols.indexOf(name) !== -1 || this.parent.has(name);
  }
  get(/** @type {string} */ name) {
    let local = this.#get(name);
    return local ? [local, false] : this.parent.get(name);
  }
  #get(name) {
    let slot = this.symbols.indexOf(name);
    return slot === -1 ? null : unwrap(this.slots[slot]);
  }
  getLocalsMap() {
    let dict = this.parent.getLocalsMap();
    this.symbols.forEach(symbol => dict[symbol] = this.get(symbol)[0]);
    return dict;
  }
  getDebugInfo() {
    const locals = this.getLocalsMap();
    const root = this.root();
    const named = root.named;
    return [{
      ...locals,
      ...named
    }, Object.fromEntries(root.upvars.map((s, i) => [s, i]))];
  }
  /** @returns {number} */ allocateFree(/** @type {string} */ name, resolution) {
    return this.parent.allocateFree(name, resolution);
  }
  /** @returns {number} */ allocateNamed(/** @type {string} */ name) {
    return this.parent.allocateNamed(name);
  }
  /** @returns {number} */ allocateBlock(/** @type {string} */ name) {
    return this.parent.allocateBlock(name);
  }
  /** @returns {number} */ allocate(/** @type {string} */ identifier) {
    return this.parent.allocate(identifier);
  }
}

class Builder {
  // TEMPLATE //

  template(symbols, body, loc) {
    return new Template({
      table: symbols,
      body,
      loc
    });
  }

  // INTERNAL (these nodes cannot be reached when doing general-purpose visiting) //

  block(symbols, body, loc) {
    return new Block({
      scope: symbols,
      body,
      loc
    });
  }
  namedBlock(name, block, loc) {
    return new NamedBlock({
      name,
      block,
      attrs: [],
      componentArgs: [],
      modifiers: [],
      loc
    });
  }
  simpleNamedBlock(name, block, loc) {
    return new BuildElement({
      selfClosing: false,
      attrs: [],
      componentArgs: [],
      modifiers: [],
      comments: []
    }).named(name, block, loc);
  }
  slice(chars, loc) {
    return new SourceSlice({
      loc,
      chars
    });
  }
  args(positional, named, loc) {
    return new Args({
      loc,
      positional,
      named
    });
  }
  positional(exprs, loc) {
    return new PositionalArguments({
      loc,
      exprs
    });
  }
  namedArgument(key, value) {
    return new NamedArgument({
      name: key,
      value
    });
  }
  named(entries, loc) {
    return new NamedArguments({
      loc,
      entries
    });
  }
  attr({
    name,
    value,
    trusting
  }, loc) {
    return new HtmlAttr({
      loc,
      name,
      value,
      trusting
    });
  }
  splatAttr(symbol, loc) {
    return new SplatAttr({
      symbol,
      loc
    });
  }
  arg({
    name,
    value,
    trusting
  }, loc) {
    return new ComponentArg({
      name,
      value,
      trusting,
      loc
    });
  }

  // EXPRESSIONS //

  path(head, tail, loc) {
    return new PathExpression({
      loc,
      ref: head,
      tail
    });
  }
  keyword(name, symbol, loc) {
    return new KeywordExpression({
      loc,
      name,
      symbol
    });
  }
  self(loc) {
    return new ThisReference({
      loc
    });
  }
  at(name, symbol, loc) {
    // the `@` should be included so we have a complete source range
    assert(name[0] === '@');
    return new ArgReference({
      loc,
      name: new SourceSlice({
        loc,
        chars: name
      }),
      symbol
    });
  }
  freeVar({
    name,
    context,
    symbol,
    loc
  }) {
    assert(name[0] !== '@');
    return new FreeVarReference({
      name,
      resolution: context,
      symbol,
      loc
    });
  }
  localVar(name, symbol, isTemplateLocal, loc) {
    assert(name[0] !== '@');
    return new LocalVarReference({
      loc,
      name,
      isTemplateLocal,
      symbol
    });
  }
  sexp(parts, loc) {
    return new CallExpression({
      loc,
      callee: parts.callee,
      args: parts.args
    });
  }
  interpolate(parts, loc) {
    return new InterpolateExpression({
      loc,
      parts
    });
  }
  literal(value, loc) {
    return new LiteralExpression({
      loc,
      value
    });
  }

  // STATEMENTS //

  append({
    table,
    trusting,
    value
  }, loc) {
    return new AppendContent({
      table,
      trusting,
      value,
      loc
    });
  }
  modifier({
    callee,
    args
  }, loc) {
    return new ElementModifier({
      loc,
      callee,
      args
    });
  }
  namedBlocks(blocks, loc) {
    return new NamedBlocks({
      loc,
      blocks
    });
  }
  blockStatement({
    program,
    inverse = null,
    ...call
  }, loc) {
    let blocksLoc = program.loc;
    let blocks = [this.namedBlock(SourceSlice.synthetic('default'), program, program.loc)];
    if (inverse) {
      blocksLoc = blocksLoc.extend(inverse.loc);
      blocks.push(this.namedBlock(SourceSlice.synthetic('else'), inverse, inverse.loc));
    }
    return new InvokeBlock({
      loc,
      blocks: this.namedBlocks(blocks, blocksLoc),
      callee: call.callee,
      args: call.args
    });
  }
  element(options) {
    return new BuildElement(options);
  }
}
class BuildElement {
  builder;
  constructor(base) {
    this.base = base;
    this.builder = new Builder();
  }
  simple(tag, body, loc) {
    return new SimpleElement(assign({
      tag,
      body,
      componentArgs: [],
      loc
    }, this.base));
  }
  named(name, block, loc) {
    return new NamedBlock(assign({
      name,
      block,
      componentArgs: [],
      loc
    }, this.base));
  }
  selfClosingComponent(callee, loc) {
    return new InvokeComponent(assign({
      loc,
      callee,
      // point the empty named blocks at the `/` self-closing tag
      blocks: new NamedBlocks({
        blocks: [],
        loc: loc.sliceEndChars({
          skipEnd: 1,
          chars: 1
        })
      })
    }, this.base));
  }
  componentWithDefaultBlock(callee, children, symbols, loc) {
    let block = this.builder.block(symbols, children, loc);
    let namedBlock = this.builder.namedBlock(SourceSlice.synthetic('default'), block, loc); // BUILDER.simpleNamedBlock('default', children, symbols, loc);

    return new InvokeComponent(assign({
      loc,
      callee,
      blocks: this.builder.namedBlocks([namedBlock], namedBlock.loc)
    }, this.base));
  }
  componentWithNamedBlocks(callee, blocks, loc) {
    return new InvokeComponent(assign({
      loc,
      callee,
      blocks: this.builder.namedBlocks(blocks, SpanList.range(blocks))
    }, this.base));
  }
}

function SexpSyntaxContext(node) {
  if (isSimpleCallee(node)) {
    return LooseModeResolution.namespaced(HELPER_NAMESPACE);
  } else {
    return null;
  }
}
function ModifierSyntaxContext(node) {
  if (isSimpleCallee(node)) {
    return LooseModeResolution.namespaced(MODIFIER_NAMESPACE);
  } else {
    return null;
  }
}
function BlockSyntaxContext(node) {
  if (isSimpleCallee(node)) {
    return LooseModeResolution.namespaced(COMPONENT_NAMESPACE);
  } else {
    return null;
  }
}
function ComponentSyntaxContext(node) {
  if (isSimplePath(node)) {
    return LooseModeResolution.namespaced(COMPONENT_NAMESPACE, true);
  } else {
    return null;
  }
}

/**
 * This corresponds to attribute curlies (<Foo bar={{...}}>).
 * In strict mode, this also corresponds to arg curlies.
 */
function AttrValueSyntaxContext(node) {
  if (isSimpleCallee(node)) {
    return LooseModeResolution.namespaced(HELPER_NAMESPACE);
  } else {
    return null;
  }
}

/**
 * This corresponds to append positions text curlies.
 */
function AppendSyntaxContext(node) {
  let isSimple = isSimpleCallee(node);
  let trusting = node.trusting;
  if (isSimple) {
    return trusting ? LooseModeResolution.trustingAppend() : LooseModeResolution.append();
  } else {
    return null;
  }
}
// UTILITIES

/**
 * A call node has a simple callee if its head is:
 *
 * - a `PathExpression`
 * - the `PathExpression`'s head is a `VarHead`
 * - it has no tail
 *
 * Simple heads:
 *
 * ```
 * {{x}}
 * {{x y}}
 * ```
 *
 * Not simple heads:
 *
 * ```
 * {{x.y}}
 * {{x.y z}}
 * {{@x}}
 * {{@x a}}
 * {{this}}
 * {{this a}}
 * ```
 */
function isSimpleCallee(node) {
  return isSimplePath(node.path);
}
function isSimplePath(node) {
  if (node.type === 'PathExpression' && node.head.type === 'VarHead') {
    return node.tail.length === 0;
  } else {
    return false;
  }
}

function normalize(/** @type {Source} */ source, options = {
  lexicalScope: () => false
}) {
  let ast = preprocess(source, options);
  let normalizeOptions = {
    strictMode: false,
    ...options,
    locals: ast.blockParams,
    keywords: options.keywords ?? []
  };
  let top = SymbolTable.top(normalizeOptions.locals, normalizeOptions.keywords, {
    customizeComponentName: options.customizeComponentName ?? (name => name),
    lexicalScope: options.lexicalScope
  });
  let block = new BlockContext(source, normalizeOptions, top);
  let normalizer = new StatementNormalizer(block);
  let astV2 = new TemplateChildren(block.loc(ast.loc), ast.body.map(b => normalizer.normalize(b)), block).assertTemplate(top);
  let locals = top.getUsedTemplateLocals();
  return [astV2, locals];
}

/**
 * A `BlockContext` represents the block that a particular AST node is contained inside of.
 *
 * `BlockContext` is aware of template-wide options (such as strict mode), as well as the bindings
 * that are in-scope within that block.
 *
 * Concretely, it has the `PrecompileOptions` and current `SymbolTable`, and provides
 * facilities for working with those options.
 *
 * `BlockContext` is stateless.
 */
class BlockContext {
  builder;
  constructor(source, options, table) {
    this.source = source;
    this.options = options;
    this.table = table;
    this.builder = new Builder();
  }
  get strict() {
    return this.options.strictMode || false;
  }
  loc(loc) {
    return this.source.spanFor(loc);
  }
  resolutionFor(node, resolution) {
    if (this.strict) {
      return {
        result: STRICT_RESOLUTION
      };
    }
    if (this.isFreeVar(node)) {
      let r = resolution(node);
      if (r === null) {
        return {
          result: 'error',
          path: printPath(node),
          head: printHead(node)
        };
      }
      return {
        result: r
      };
    } else {
      return {
        result: STRICT_RESOLUTION
      };
    }
  }
  isLexicalVar(variable) {
    return this.table.hasLexical(variable);
  }
  isKeyword(name) {
    return this.strict && !this.table.hasLexical(name) && this.table.hasKeyword(name);
  }
  isFreeVar(callee) {
    if (callee.type === 'PathExpression') {
      if (callee.head.type !== 'VarHead') {
        return false;
      }
      return !this.table.has(callee.head.name);
    } else if (callee.path.type === 'PathExpression') {
      return this.isFreeVar(callee.path);
    } else {
      return false;
    }
  }
  hasBinding(name) {
    return this.table.has(name) || this.table.hasLexical(name);
  }
  child(blockParams) {
    return new BlockContext(this.source, this.options, this.table.child(blockParams));
  }
  customizeComponentName(input) {
    if (this.options.customizeComponentName) {
      return this.options.customizeComponentName(input);
    } else {
      return input;
    }
  }
}

/**
 * An `ExpressionNormalizer` normalizes expressions within a block.
 *
 * `ExpressionNormalizer` is stateless.
 */
class ExpressionNormalizer {
  constructor(block) {
    this.block = block;
  }

  /**
   * The `normalize` method takes an arbitrary expression and its original syntax context and
   * normalizes it to an ASTv2 expression.
   *
   * @see {SyntaxContext}
   */

  normalize(expr, resolution) {
    switch (expr.type) {
      case 'NullLiteral':
      case 'BooleanLiteral':
      case 'NumberLiteral':
      case 'StringLiteral':
      case 'UndefinedLiteral':
        return this.block.builder.literal(expr.value, this.block.loc(expr.loc));
      case 'PathExpression':
        return this.path(expr, resolution);
      case 'SubExpression':
        {
          // expr.path used to incorrectly have the type ASTv1.Expression
          if (isLiteral(expr.path)) {
            assertIllegalLiteral(expr.path, expr.loc);
          }
          let resolution = this.block.resolutionFor(expr, SexpSyntaxContext);
          if (resolution.result === 'error') {
            throw generateSyntaxError(`You attempted to invoke a path (\`${resolution.path}\`) but ${resolution.head} was not in scope`, expr.loc);
          }
          return this.block.builder.sexp(this.callParts(expr, resolution.result), this.block.loc(expr.loc));
        }
    }
  }
  path(expr, resolution) {
    let loc = this.block.loc(expr.loc);
    if (expr.head.type === 'VarHead' && expr.tail.length === 0 && this.block.isKeyword(expr.head.name)) {
      return this.block.builder.keyword(expr.head.name, this.block.table.getKeyword(expr.head.name), loc);
    }
    let headOffsets = this.block.loc(expr.head.loc);
    let tail = [];

    // start with the head
    let offset = headOffsets;
    for (let part of expr.tail) {
      offset = offset.sliceStartChars({
        chars: part.length,
        skipStart: 1
      });
      tail.push(new SourceSlice({
        loc: offset,
        chars: part
      }));
    }
    return this.block.builder.path(this.ref(expr.head, resolution), tail, loc);
  }

  /**
   * The `callParts` method takes ASTv1.CallParts as well as a syntax context and normalizes
   * it to an ASTv2 CallParts.
   */
  callParts(parts, context) {
    let {
      path,
      params,
      hash,
      loc
    } = parts;
    let callee = this.normalize(path, context);
    let paramList = params.map(p => this.normalize(p, STRICT_RESOLUTION));
    let paramLoc = SpanList.range(paramList, callee.loc.collapse('end'));
    let namedLoc = this.block.loc(hash.loc);
    let argsLoc = SpanList.range([paramLoc, namedLoc]);
    let positional = this.block.builder.positional(paramList, paramLoc);
    let named = this.block.builder.named(hash.pairs.map(p => this.namedArgument(p)), this.block.loc(hash.loc));
    switch (callee.type) {
      case 'Literal':
        throw generateSyntaxError(`Invalid invocation of a literal value (\`${callee.value}\`)`, loc);

      // This really shouldn't be possible, something has gone pretty wrong
      case 'Interpolate':
        throw generateSyntaxError(`Invalid invocation of a interpolated string`, loc);
    }
    return {
      callee,
      args: this.block.builder.args(positional, named, argsLoc)
    };
  }
  namedArgument(pair) {
    let offsets = this.block.loc(pair.loc);
    let keyOffsets = offsets.sliceStartChars({
      chars: pair.key.length
    });
    return this.block.builder.namedArgument(new SourceSlice({
      chars: pair.key,
      loc: keyOffsets
    }), this.normalize(pair.value, STRICT_RESOLUTION));
  }

  /**
   * The `ref` method normalizes an `ASTv1.PathHead` into an `ASTv2.VariableReference`.
   * This method is extremely important, because it is responsible for normalizing free
   * variables into an an ASTv2.PathHead *with appropriate context*.
   *
   * The syntax context is originally determined by the syntactic position that this `PathHead`
   * came from, and is ultimately attached to the `ASTv2.VariableReference` here. In ASTv2,
   * the `VariableReference` node bears full responsibility for loose mode rules that control
   * the behavior of free variables.
   */
  ref(head, resolution) {
    let {
      block
    } = this;
    let {
      builder,
      table
    } = block;
    let offsets = block.loc(head.loc);
    switch (head.type) {
      case 'ThisHead':
        if (block.hasBinding('this')) {
          let [symbol, isRoot] = table.get('this');
          return block.builder.localVar('this', symbol, isRoot, offsets);
        }
        return builder.self(offsets);
      case 'AtHead':
        {
          let symbol = table.allocateNamed(head.name);
          return builder.at(head.name, symbol, offsets);
        }
      case 'VarHead':
        {
          if (block.hasBinding(head.name)) {
            let [symbol, isRoot] = table.get(head.name);
            return block.builder.localVar(head.name, symbol, isRoot, offsets);
          } else {
            let context = block.strict ? STRICT_RESOLUTION : resolution;
            let symbol = block.table.allocateFree(head.name, context);
            return block.builder.freeVar({
              name: head.name,
              context,
              symbol,
              loc: offsets
            });
          }
        }
    }
  }
}

/**
 * `TemplateNormalizer` normalizes top-level ASTv1 statements to ASTv2.
 */
class StatementNormalizer {
  constructor(block) {
    this.block = block;
  }
  normalize(node) {
    switch (node.type) {
      case 'BlockStatement':
        return this.BlockStatement(node);
      case 'ElementNode':
        return new ElementNormalizer(this.block).ElementNode(node);
      case 'MustacheStatement':
        return this.MustacheStatement(node);

      // These are the same in ASTv2
      case 'MustacheCommentStatement':
        return this.MustacheCommentStatement(node);
      case 'CommentStatement':
        {
          let loc = this.block.loc(node.loc);
          return new HtmlComment({
            loc,
            text: loc.slice({
              skipStart: 4,
              skipEnd: 3
            }).toSlice(node.value)
          });
        }
      case 'TextNode':
        return new HtmlText({
          loc: this.block.loc(node.loc),
          chars: node.chars
        });
    }
  }
  MustacheCommentStatement(node) {
    let loc = this.block.loc(node.loc);

    // If someone cares for these cases to have the right loc, feel free to attempt:
    // {{!}} {{~!}} {{!~}} {{~!~}}
    // {{!-}} {{~!-}} {{!-~}} {{~!-~}}
    // {{!--}} {{~!--}} {{!--~}} {{~!--~}}
    // {{!---}} {{~!---}} {{!---~}} {{~!---~}}
    // {{!----}} {{~!----}} {{!----~}} {{~!----~}}
    if (node.value === '') {
      return new GlimmerComment({
        loc,
        text: SourceSlice.synthetic('')
      });
    }
    let source = loc.asString();
    let span = loc;
    if (node.value.startsWith('-')) {
      span = span.sliceStartChars({
        skipStart: source.startsWith('{{~') ? 6 : 5,
        chars: node.value.length
      });
    } else if (node.value.endsWith('-')) {
      const skipEnd = source.endsWith('~}}') ? 5 : 4;
      const skipStart = source.length - node.value.length - skipEnd;
      span = span.slice({
        skipStart,
        skipEnd
      });
    } else {
      span = span.sliceStartChars({
        skipStart: source.lastIndexOf(node.value),
        chars: node.value.length
      });
    }
    return new GlimmerComment({
      loc,
      text: span.toSlice(node.value)
    });
  }

  /**
   * Normalizes an ASTv1.MustacheStatement to an ASTv2.AppendStatement
   */
  MustacheStatement(mustache) {
    let {
      path,
      params,
      hash,
      trusting
    } = mustache;
    let loc = this.block.loc(mustache.loc);
    let value;
    if (isLiteral(path)) {
      if (params.length === 0 && hash.pairs.length === 0) {
        value = this.expr.normalize(path);
      } else {
        assertIllegalLiteral(path, loc);
      }
    } else {
      let resolution = this.block.resolutionFor(mustache, AppendSyntaxContext);
      if (resolution.result === 'error') {
        throw generateSyntaxError(`You attempted to render a path (\`{{${resolution.path}}}\`), but ${resolution.head} was not in scope`, loc);
      }

      // Normalize the call parts in AppendSyntaxContext
      let callParts = this.expr.callParts({
        path,
        params,
        hash,
        loc
      }, resolution.result);
      value = callParts.args.isEmpty() ? callParts.callee : this.block.builder.sexp(callParts, loc);
    }
    return this.block.builder.append({
      table: this.block.table,
      trusting,
      value
    }, loc);
  }

  /**
   * Normalizes a ASTv1.BlockStatement to an ASTv2.BlockStatement
   */
  BlockStatement(block) {
    let {
      program,
      inverse
    } = block;
    let loc = this.block.loc(block.loc);

    // block.path used to incorrectly have the type ASTv1.Expression
    if (isLiteral(block.path)) {
      assertIllegalLiteral(block.path, loc);
    }
    let resolution = this.block.resolutionFor(block, BlockSyntaxContext);
    if (resolution.result === 'error') {
      throw generateSyntaxError(`You attempted to invoke a path (\`{{#${resolution.path}}}\`) but ${resolution.head} was not in scope`, loc);
    }
    let callParts = this.expr.callParts(block, resolution.result);
    return this.block.builder.blockStatement(assign({
      symbols: this.block.table,
      program: this.Block(program),
      inverse: inverse ? this.Block(inverse) : null
    }, callParts), loc);
  }
  Block({
    body,
    loc,
    blockParams
  }) {
    let child = this.block.child(blockParams);
    let normalizer = new StatementNormalizer(child);
    return new BlockChildren(this.block.loc(loc), body.map(b => normalizer.normalize(b)), this.block).assertBlock(child.table);
  }
  get expr() {
    return new ExpressionNormalizer(this.block);
  }
}
class ElementNormalizer {
  constructor(ctx) {
    this.ctx = ctx;
  }

  /**
   * Normalizes an ASTv1.ElementNode to:
   *
   * - ASTv2.NamedBlock if the tag name begins with `:`
   * - ASTv2.Component if the tag name matches the component heuristics
   * - ASTv2.SimpleElement if the tag name doesn't match the component heuristics
   *
   * A tag name represents a component if:
   *
   * - it begins with `@`
   * - it is exactly `this` or begins with `this.`
   * - the part before the first `.` is a reference to an in-scope variable binding
   * - it begins with an uppercase character
   */
  ElementNode(element) {
    let {
      tag,
      selfClosing,
      comments
    } = element;
    let loc = this.ctx.loc(element.loc);
    let [tagHead, ...rest] = asPresentArray(tag.split('.'));

    // the head, attributes and modifiers are in the current scope
    let path = this.classifyTag(tagHead, rest, element.loc);
    let attrs = element.attributes.filter(a => a.name[0] !== '@').map(a => this.attr(a));
    let args = element.attributes.filter(a => a.name[0] === '@').map(a => this.arg(a));
    let modifiers = element.modifiers.map(m => this.modifier(m));

    // the element's block params are in scope for the children
    let child = this.ctx.child(element.blockParams);
    let normalizer = new StatementNormalizer(child);
    let childNodes = element.children.map(s => normalizer.normalize(s));
    let el = this.ctx.builder.element({
      selfClosing,
      attrs,
      componentArgs: args,
      modifiers,
      comments: comments.map(c => new StatementNormalizer(this.ctx).MustacheCommentStatement(c))
    });
    let children = new ElementChildren(el, loc, childNodes, this.ctx);
    let offsets = this.ctx.loc(element.loc);
    let tagOffsets = offsets.sliceStartChars({
      chars: tag.length,
      skipStart: 1
    });
    if (path === 'ElementHead') {
      if (tag[0] === ':') {
        return children.assertNamedBlock(tagOffsets.slice({
          skipStart: 1
        }).toSlice(tag.slice(1)), child.table);
      } else {
        return children.assertElement(tagOffsets.toSlice(tag), element.blockParams.length > 0);
      }
    }
    if (element.selfClosing) {
      return el.selfClosingComponent(path, loc);
    } else {
      let blocks = children.assertComponent(tag, child.table, element.blockParams.length > 0);
      return el.componentWithNamedBlocks(path, blocks, loc);
    }
  }
  modifier(m) {
    // modifier.path used to incorrectly have the type ASTv1.Expression
    if (isLiteral(m.path)) {
      assertIllegalLiteral(m.path, m.loc);
    }
    let resolution = this.ctx.resolutionFor(m, ModifierSyntaxContext);
    if (resolution.result === 'error') {
      throw generateSyntaxError(`You attempted to invoke a path (\`{{${resolution.path}}}\`) as a modifier, but ${resolution.head} was not in scope`, m.loc);
    }
    let callParts = this.expr.callParts(m, resolution.result);
    return this.ctx.builder.modifier(callParts, this.ctx.loc(m.loc));
  }

  /**
   * This method handles attribute values that are curlies, as well as curlies nested inside of
   * interpolations:
   *
   * ```hbs
   * <a href={{url}} />
   * <a href="{{url}}.html" />
   * ```
   */
  mustacheAttr(mustache) {
    let {
      path,
      params,
      hash,
      loc
    } = mustache;
    if (isLiteral(path)) {
      if (params.length === 0 && hash.pairs.length === 0) {
        return this.expr.normalize(path);
      } else {
        assertIllegalLiteral(path, loc);
      }
    }

    // Normalize the call parts in AttrValueSyntaxContext
    let resolution = this.ctx.resolutionFor(mustache, AttrValueSyntaxContext);
    if (resolution.result === 'error') {
      throw generateSyntaxError(`You attempted to render a path (\`{{${resolution.path}}}\`), but ${resolution.head} was not in scope`, mustache.loc);
    }
    let sexp = this.ctx.builder.sexp(this.expr.callParts(mustache, resolution.result), this.ctx.loc(mustache.loc));

    // If there are no params or hash, just return the function part as its own expression
    if (sexp.args.isEmpty()) {
      return sexp.callee;
    } else {
      return sexp;
    }
  }

  /**
   * attrPart is the narrowed down list of valid attribute values that are also
   * allowed as a concat part (you can't nest concats).
   */
  attrPart(part) {
    switch (part.type) {
      case 'MustacheStatement':
        return {
          expr: this.mustacheAttr(part),
          trusting: part.trusting
        };
      case 'TextNode':
        return {
          expr: this.ctx.builder.literal(part.chars, this.ctx.loc(part.loc)),
          trusting: true
        };
    }
  }
  attrValue(part) {
    switch (part.type) {
      case 'ConcatStatement':
        {
          let parts = part.parts.map(p => this.attrPart(p).expr);
          return {
            expr: this.ctx.builder.interpolate(parts, this.ctx.loc(part.loc)),
            trusting: false
          };
        }
      default:
        return this.attrPart(part);
    }
  }
  attr(m) {
    assert(m.name[0] !== '@');
    if (m.name === '...attributes') {
      return this.ctx.builder.splatAttr(this.ctx.table.allocateBlock('attrs'), this.ctx.loc(m.loc));
    }
    let offsets = this.ctx.loc(m.loc);
    let nameSlice = offsets.sliceStartChars({
      chars: m.name.length
    }).toSlice(m.name);
    let value = this.attrValue(m.value);
    return this.ctx.builder.attr({
      name: nameSlice,
      value: value.expr,
      trusting: value.trusting
    }, offsets);
  }

  // An arg curly <Foo @bar={{...}} /> is the same as an attribute curly for
  // our purposes, except that in loose mode <Foo @bar={{baz}} /> is an error:
  checkArgCall(arg) {
    let {
      value
    } = arg;
    if (value.type !== 'MustacheStatement') {
      return;
    }
    if (value.params.length !== 0 || value.hash.pairs.length !== 0) {
      return;
    }
    let {
      path
    } = value;
    if (path.type !== 'PathExpression') {
      return;
    }
    if (path.tail.length > 0) {
      return;
    }
    let resolution = this.ctx.resolutionFor(path, () => {
      // We deliberately don't want this to resolve anything. The purpose of
      // calling `resolutionFor` here is to check for strict mode, in-scope
      // local variables, etc.
      return null;
    });
    if (resolution.result === 'error' && resolution.path !== 'has-block') {
      throw generateSyntaxError(`You attempted to pass a path as argument (\`${arg.name}={{${resolution.path}}}\`) but ${resolution.head} was not in scope. Try:\n` + `* \`${arg.name}={{this.${resolution.path}}}\` if this is meant to be a property lookup, or\n` + `* \`${arg.name}={{(${resolution.path})}}\` if this is meant to invoke the resolved helper, or\n` + `* \`${arg.name}={{helper "${resolution.path}"}}\` if this is meant to pass the resolved helper by value`, arg.loc);
    }
  }
  arg(arg) {
    assert(arg.name[0] === '@');
    this.checkArgCall(arg);
    let offsets = this.ctx.loc(arg.loc);
    let nameSlice = offsets.sliceStartChars({
      chars: arg.name.length
    }).toSlice(arg.name);
    let value = this.attrValue(arg.value);
    return this.ctx.builder.arg({
      name: nameSlice,
      value: value.expr,
      trusting: value.trusting
    }, offsets);
  }

  /**
   * This function classifies the head of an ASTv1.Element into an ASTv2.PathHead (if the
   * element is a component) or `'ElementHead'` (if the element is a simple element).
   *
   * Rules:
   *
   * 1. If the variable is an `@arg`, return an `AtHead`
   * 2. If the variable is `this`, return a `ThisHead`
   * 3. If the variable is in the current scope:
   *   a. If the scope is the root scope, then return a Free `LocalVarHead`
   *   b. Else, return a standard `LocalVarHead`
   * 4. If the tag name is a path and the variable is not in the current scope, Syntax Error
   * 5. If the variable is uppercase return a FreeVar(ResolveAsComponentHead)
   * 6. Otherwise, return `'ElementHead'`
   */
  classifyTag(variable, tail, loc) {
    let uppercase = isUpperCase(variable);
    let inScope = variable[0] === '@' || variable === 'this' || this.ctx.hasBinding(variable);
    if (this.ctx.strict && !inScope) {
      if (uppercase) {
        throw generateSyntaxError(`Attempted to invoke a component that was not in scope in a strict mode template, \`<${variable}>\`. If you wanted to create an element with that name, convert it to lowercase - \`<${variable.toLowerCase()}>\``, loc);
      }

      // In strict mode, values are always elements unless they are in scope
      return 'ElementHead';
    }

    // Since the parser handed us the HTML element name as a string, we need
    // to convert it into an ASTv1 path so it can be processed using the
    // expression normalizer.
    let isComponent = inScope || uppercase;
    let variableLoc = loc.sliceStartChars({
      skipStart: 1,
      chars: variable.length
    });
    let tailLength = tail.reduce((accum, part) => accum + 1 + part.length, 0);
    let pathEnd = variableLoc.getEnd().move(tailLength);
    let pathLoc = variableLoc.withEnd(pathEnd);
    if (isComponent) {
      let path = b.path({
        head: b.head({
          original: variable,
          loc: variableLoc
        }),
        tail,
        loc: pathLoc
      });
      let resolution = this.ctx.isLexicalVar(variable) ? {
        result: STRICT_RESOLUTION
      } : this.ctx.resolutionFor(path, ComponentSyntaxContext);
      if (resolution.result === 'error') {
        throw generateSyntaxError(`You attempted to invoke a path (\`<${resolution.path}>\`) but ${resolution.head} was not in scope`, loc);
      }
      return new ExpressionNormalizer(this.ctx).normalize(path, resolution.result);
    } else {
      this.ctx.table.allocateFree(variable, STRICT_RESOLUTION);
    }

    // If the tag name wasn't a valid component but contained a `.`, it's
    // a syntax error.
    if (tail.length > 0) {
      throw generateSyntaxError(`You used ${variable}.${tail.join('.')} as a tag name, but ${variable} is not in scope`, loc);
    }
    return 'ElementHead';
  }
  get expr() {
    return new ExpressionNormalizer(this.ctx);
  }
}
class Children {
  namedBlocks;
  hasSemanticContent;
  nonBlockChildren;
  constructor(loc, children, block) {
    this.loc = loc;
    this.children = children;
    this.block = block;
    this.namedBlocks = children.filter(c => c instanceof NamedBlock);
    this.hasSemanticContent = Boolean(children.filter(c => {
      if (c instanceof NamedBlock) {
        return false;
      }
      switch (c.type) {
        case 'GlimmerComment':
        case 'HtmlComment':
          return false;
        case 'HtmlText':
          return !/^\s*$/u.test(c.chars);
        default:
          return true;
      }
    }).length);
    this.nonBlockChildren = children.filter(c => !(c instanceof NamedBlock));
  }
}
class TemplateChildren extends Children {
  assertTemplate(table) {
    if (isPresentArray(this.namedBlocks)) {
      throw generateSyntaxError(`Unexpected named block at the top-level of a template`, this.loc);
    }
    return this.block.builder.template(table, this.nonBlockChildren, this.block.loc(this.loc));
  }
}
class BlockChildren extends Children {
  assertBlock(table) {
    if (isPresentArray(this.namedBlocks)) {
      throw generateSyntaxError(`Unexpected named block nested in a normal block`, this.loc);
    }
    return this.block.builder.block(table, this.nonBlockChildren, this.loc);
  }
}
class ElementChildren extends Children {
  constructor(el, loc, children, block) {
    super(loc, children, block);
    this.el = el;
  }
  assertNamedBlock(name, table) {
    if (this.el.base.selfClosing) {
      throw generateSyntaxError(`<:${name.chars}/> is not a valid named block: named blocks cannot be self-closing`, this.loc);
    }
    if (isPresentArray(this.namedBlocks)) {
      throw generateSyntaxError(`Unexpected named block inside <:${name.chars}> named block: named blocks cannot contain nested named blocks`, this.loc);
    }
    if (!isLowerCase(name.chars)) {
      throw generateSyntaxError(`<:${name.chars}> is not a valid named block, and named blocks must begin with a lowercase letter`, this.loc);
    }
    if (this.el.base.attrs.length > 0 || this.el.base.componentArgs.length > 0 || this.el.base.modifiers.length > 0) {
      throw generateSyntaxError(`named block <:${name.chars}> cannot have attributes, arguments, or modifiers`, this.loc);
    }
    let offsets = SpanList.range(this.nonBlockChildren, this.loc);
    return this.block.builder.namedBlock(name, this.block.builder.block(table, this.nonBlockChildren, offsets), this.loc);
  }
  assertElement(name, hasBlockParams) {
    if (hasBlockParams) {
      throw generateSyntaxError(`Unexpected block params in <${name.chars}>: simple elements cannot have block params`, this.loc);
    }
    if (isPresentArray(this.namedBlocks)) {
      let names = this.namedBlocks.map(b => b.name);
      if (names.length === 1) {
        throw generateSyntaxError(`Unexpected named block <:foo> inside <${name.chars}> HTML element`, this.loc);
      } else {
        let printedNames = names.map(n => `<:${n.chars}>`).join(', ');
        throw generateSyntaxError(`Unexpected named blocks inside <${name.chars}> HTML element (${printedNames})`, this.loc);
      }
    }
    return this.el.simple(name, this.nonBlockChildren, this.loc);
  }
  assertComponent(name, table, hasBlockParams) {
    if (isPresentArray(this.namedBlocks) && this.hasSemanticContent) {
      throw generateSyntaxError(`Unexpected content inside <${name}> component invocation: when using named blocks, the tag cannot contain other content`, this.loc);
    }
    if (isPresentArray(this.namedBlocks)) {
      if (hasBlockParams) {
        throw generateSyntaxError(`Unexpected block params list on <${name}> component invocation: when passing named blocks, the invocation tag cannot take block params`, this.loc);
      }
      let seenNames = new Set();
      for (let block of this.namedBlocks) {
        let name = block.name.chars;
        if (seenNames.has(name)) {
          throw generateSyntaxError(`Component had two named blocks with the same name, \`<:${name}>\`. Only one block with a given name may be passed`, this.loc);
        }
        if (name === 'inverse' && seenNames.has('else') || name === 'else' && seenNames.has('inverse')) {
          throw generateSyntaxError(`Component has both <:else> and <:inverse> block. <:inverse> is an alias for <:else>`, this.loc);
        }
        seenNames.add(name);
      }
      return this.namedBlocks;
    } else {
      return [this.block.builder.namedBlock(SourceSlice.synthetic('default'), this.block.builder.block(table, this.nonBlockChildren, this.loc), this.loc)];
    }
  }
}
/** @returns {boolean} */ function isLiteral(node) {
  switch (node.type) {
    case 'StringLiteral':
    case 'BooleanLiteral':
    case 'NumberLiteral':
    case 'UndefinedLiteral':
    case 'NullLiteral':
      return true;
    default:
      return false;
  }
}
function assertIllegalLiteral(node, loc) {
  let value = node.type === 'StringLiteral' ? JSON.stringify(node.value) : String(node.value);
  throw generateSyntaxError(`Unexpected literal \`${value}\``, loc);
}
function printPath(node) {
  if (node.type !== 'PathExpression' && node.path.type === 'PathExpression') {
    return printPath(node.path);
  } else {
    return new Printer({
      entityEncoding: 'raw'
    }).print(node);
  }
}
function printHead(node) {
  if (node.type === 'PathExpression') {
    return node.head.original;
  } else if (node.path.type === 'PathExpression') {
    return printHead(node.path);
  } else {
    return new Printer({
      entityEncoding: 'raw'
    }).print(node);
  }
}

export { api as ASTv2, BlockSymbolTable, KEYWORDS_TYPES, Walker as Path, ProgramSymbolTable, SourceSlice, SpanList, SymbolTable, Walker, WalkerPath, publicBuilder as builders, cannotRemoveNode, cannotReplaceNode, generateSyntaxError, getTemplateLocals, getVoidTags, hasSpan, isKeyword, isVoidTag, loc, maybeLoc, node, normalize, preprocess, build as print, sortByLoc, api$1 as src, traverse, visitorKeys };

// @nts-check
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _HermesParserDecodeUTF8String = _interopRequireDefault(require("./HermesParserDecodeUTF8String"));
var _FlowParserNodeDeserializers = _interopRequireDefault(require("./FlowParserNodeDeserializers"));
function _interopRequireDefault(e) {
  return e && e.__esModule ? e : {
    default: e
  };
}
class FlowParserDeserializer {
  constructor(/** @type {number} */ programBuffer, /** @type {number} */ positionBuffer, /** @type {number} */ positionBufferSize, /** @type {number} */ stringBufferBase, wasmParser, options) {
    /** @type {number | undefined} */ this.programBufferIdx = void 0;
    /** @type {number | undefined} */ this.positionBufferIdx = void 0;
    /** @type {number | undefined} */ this.positionBufferSize = void 0;
    /** @type {number | undefined} */ this.stringBufferBase = void 0;
    /** @type {Record<number, any> | undefined} */ this.locMap = void 0;
    this.HEAPU8 = void 0;
    this.HEAPU32 = void 0;
    this.HEAPF64 = void 0;
    this.options = void 0;
    /** @type {string[]} */ this.commentTypes = ['Block', 'Line'];
    /** @type {string[]} */ this.tokenTypes = ['Boolean', 'Identifier', 'Keyword', 'Null', 'Numeric', 'BigInt', 'Punctuator', 'String', 'RegularExpression', 'Template', 'JSXText'];
    this.programBufferIdx = programBuffer / 4;
    this.positionBufferIdx = positionBuffer / 4;
    this.positionBufferSize = positionBufferSize;
    this.stringBufferBase = stringBufferBase;
    this.locMap = {};
    this.HEAPU8 = wasmParser.HEAPU8;
    this.HEAPU32 = wasmParser.HEAPU32;
    this.HEAPF64 = wasmParser.HEAPF64;
    this.options = options;
  }
  /** @returns {number} */ next() {
    const num = this.HEAPU32[this.programBufferIdx++];
    return num;
  }
  deserialize() {
    const program = {
      type: 'Program',
      loc: this.addEmptyLoc(),
      body: this.deserializeNodeList(),
      comments: this.deserializeComments()
    };
    program.interpreter = this.deserializeNode();
    if (this.options.tokens === true) {
      program.tokens = this.deserializeTokens();
    } else {
      this.deserializeTokens();
    }
    program.errors = this.deserializeErrors();
    this.fillLocs();
    return program;
  }
  /** @returns {any[]} */ deserializeErrors() {
    const size = this.next();
    const errors = [];
    for (let i = 0; i < size; i++) {
      const loc = this.addEmptyLoc();
      const message = this.deserializeString();
      if (message == null) {
        throw new Error('Expected serialized parser error message');
      }
      errors.push({
        loc,
        message
      });
    }
    return errors;
  }
  /** @returns {boolean} */ deserializeBoolean() {
    return Boolean(this.next());
  }
  /** @returns {number} */ deserializeNumber() {
    let floatIdx;
    if (this.programBufferIdx % 2 === 0) {
      floatIdx = this.programBufferIdx / 2;
      this.programBufferIdx += 2;
    } else {
      floatIdx = (this.programBufferIdx + 1) / 2;
      this.programBufferIdx += 3;
    }
    return this.HEAPF64[floatIdx];
  }
  /** @returns {string | null} */ deserializeString() {
    const offsetPlusOne = this.next();
    if (offsetPlusOne === 0) {
      return null;
    }
    const size = this.next();
    return (0, _HermesParserDecodeUTF8String.default)(this.stringBufferBase + offsetPlusOne - 1, size, this.HEAPU8);
  }
  deserializeNode() {
    const nodeType = this.next();
    if (nodeType === 0) {
      return null;
    }
    const nodeDeserializer = _FlowParserNodeDeserializers.default[nodeType - 1].bind(this);
    return nodeDeserializer();
  }
  /** @returns {any[]} */ deserializeNodeList() {
    const size = this.next();
    const nodeList = [];
    for (let i = 0; i < size; i++) {
      nodeList.push(this.deserializeNode());
    }
    return nodeList;
  }
  /** @returns {any[]} */ deserializeComments() {
    const size = this.next();
    const comments = [];
    for (let i = 0; i < size; i++) {
      const commentType = this.commentTypes[this.next()];
      const loc = this.addEmptyLoc();
      const value = this.deserializeString();
      comments.push({
        type: commentType,
        loc,
        value
      });
    }
    return comments;
  }
  /** @returns {any[]} */ deserializeTokens() {
    const size = this.next();
    const tokens = [];
    for (let i = 0; i < size; i++) {
      const tokenType = this.tokenTypes[this.next()];
      const loc = this.addEmptyLoc();
      const value = this.deserializeString();
      tokens.push({
        type: tokenType,
        loc,
        value
      });
    }
    return tokens;
  }
  addEmptyLoc() {
    const loc = {};
    this.locMap[this.next()] = loc;
    return loc;
  }
  fillLocs() {
    for (let i = 0; i < this.positionBufferSize; i++) {
      const locId = this.HEAPU32[this.positionBufferIdx++];
      const kind = this.HEAPU32[this.positionBufferIdx++];
      const line = this.HEAPU32[this.positionBufferIdx++];
      const column = this.HEAPU32[this.positionBufferIdx++];
      const offset = this.HEAPU32[this.positionBufferIdx++];
      const loc = this.locMap[locId];
      if (kind === 0) {
        loc.start = {
          line,
          column
        };
        loc.rangeStart = offset;
      } else {
        loc.end = {
          line,
          column
        };
        loc.rangeEnd = offset;
      }
    }
  }
}
exports.default = FlowParserDeserializer;
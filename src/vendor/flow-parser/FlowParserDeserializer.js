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
const LOCATION_IDENTIFIER_NAME = 1 << 0;
/** @typedef {{ start?: { line: number, column: number }, end?: { line: number, column: number }, source?: string | null, identifierName?: string }} FlowLoc */
/** @typedef {import("./FlowParserNodeDeserializers.js").FlowNode} FlowNode */

class FlowParserDeserializer {
  constructor(/** @type {number} */ programBuffer, /** @type {number} */ positionBuffer, /** @type {number} */ positionBufferSize, /** @type {number} */ stringBufferBase, wasmParser, options) {
    /** @type {number | undefined} */ this.programBufferIdx = void 0;
    /** @type {number | undefined} */ this.positionBufferIdx = void 0;
    /** @type {number | undefined} */ this.positionBufferSize = void 0;
    /** @type {number | undefined} */ this.stringBufferBase = void 0;
    /** @type {Record<number, any> | undefined} */ this.locMap = void 0;
    this.locRanges = void 0;
    this.sourceFilename = void 0;
    this.extendedPositions = void 0;
    this.HEAPU8 = void 0;
    this.HEAPU32 = void 0;
    this.HEAPF64 = void 0;
    /** @type {{ tokens?: boolean } | undefined} */ this.options = void 0;
    this.extendedLocationHeaders = void 0;
    /** @type {string[]} */ this.commentTypes = ['Block', 'Line'];
    /** @type {string[]} */ this.tokenTypes = ['Boolean', 'Identifier', 'Keyword', 'Null', 'Numeric', 'BigInt', 'Punctuator', 'String', 'RegularExpression', 'Template', 'JSXText'];
    this.programBufferIdx = programBuffer / 4;
    this.positionBufferIdx = positionBuffer / 4;
    this.positionBufferSize = positionBufferSize;
    this.stringBufferBase = stringBufferBase;
    this.locMap = {};
    this.locRanges = [];
    this.sourceFilename = typeof options.sourceFilename === 'string' ? options.sourceFilename : null;
    this.extendedPositions = [];
    this.HEAPU8 = wasmParser.HEAPU8;
    this.HEAPU32 = wasmParser.HEAPU32;
    this.HEAPF64 = wasmParser.HEAPF64;
    this.options = options;
    this.extendedLocationHeaders = false;
  }
  /** @returns {number} */ next() {
    const num = this.HEAPU32[this.programBufferIdx++];
    return num;
  }
  deserialize() {
    if (this.HEAPU32[this.programBufferIdx] === 0) {
      return this.deserializeESTreeProgram();
    }
    this.extendedLocationHeaders = true;
    this.prepareExtendedPositions();
    const root = this.deserializeNode();
    if (root == null) {
      throw new Error('Expected serialized parser root');
    }
    return root;
  }
  deserializeESTreeProgram() {
    const range = this.addRangeForNextLoc();
    /** @type {FlowNode} */ const program = {
      type: 'Program',
      loc: this.addEmptyLoc(),
      body: this.deserializeNodeList(),
      comments: this.deserializeESTreeComments()
    };
    program.interpreter = this.deserializeNode();
    if (this.options.tokens === true) {
      program.tokens = this.deserializeTokens();
    } else {
      this.deserializeTokens();
    }
    program.errors = this.deserializeErrors();
    program.range = range;
    this.fillLocs();
    return program;
  }
  /** @returns {any[]} */ deserializeErrors() {
    const size = this.next();
    const errors = [];
    for (let i = 0; i < size; i++) {
      const range = this.addRangeForNextLoc();
      const loc = this.addEmptyLoc();
      const message = this.deserializeString();
      if (message == null) {
        throw new Error('Expected serialized parser error message');
      }
      errors.push({
        loc,
        message,
        range
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
  /** @returns {FlowNode | null} */ deserializeNode() {
    const nodeType = this.next();
    if (nodeType === 0) {
      return null;
    }
    const deserializeNode = _FlowParserNodeDeserializers.default[nodeType - 1];
    if (deserializeNode == null) {
      throw new Error(`Unknown serialized node kind ${nodeType - 1} at program word ${this.programBufferIdx - 1}`);
    }
    if (this.extendedLocationHeaders) {
      const position = this.nextExtendedPosition();
      const node = deserializeNode.call(this);
      this.addExtendedRange(node, position);
      return node;
    }
    const range = this.addRangeForNextLoc();
    const node = deserializeNode.call(this);
    node.range = range;
    return node;
  }
  /** @returns {any[]} */ deserializeNodeList() {
    const size = this.next();
    const nodeList = [];
    for (let i = 0; i < size; i++) {
      nodeList.push(this.deserializeNode());
    }
    return nodeList;
  }
  deserializeEnumRuntime() {
    var _this$options$transfo, _this$options$transfo2;
    const getRuntime = (_this$options$transfo = this.options.transformOptions) == null ? void 0 : (_this$options$transfo2 = _this$options$transfo.TransformEnumSyntax) == null ? void 0 : _this$options$transfo2.getRuntime;
    if (typeof getRuntime !== 'function') {
      throw new Error('Expected TransformEnumSyntax.getRuntime callback');
    }
    return getRuntime();
  }
  /** @returns {any[]} */ deserializeComments() {
    const size = this.next();
    const comments = [];
    for (let i = 0; i < size; i++) {
      const commentType = this.deserializeString();
      if (commentType == null) {
        throw new Error('Expected serialized comment type');
      }
      const position = this.nextExtendedPosition();
      const loc = this.addEmptyLoc();
      const comment = {
        type: commentType,
        loc,
        value: this.deserializeString()
      };
      this.addExtendedRange(comment, position);
      comments.push(comment);
    }
    return comments;
  }
  deserializeESTreeComments() {
    const size = this.next();
    const comments = [];
    for (let i = 0; i < size; i++) {
      const commentType = this.commentTypes[this.next()];
      const range = this.addRangeForNextLoc();
      const comment = {
        type: commentType,
        loc: this.addEmptyLoc(),
        value: this.deserializeString(),
        range
      };
      comments.push(comment);
    }
    return comments;
  }
  /** @returns {any[]} */ deserializeTokens() {
    const size = this.next();
    const tokens = [];
    for (let i = 0; i < size; i++) {
      const tokenType = this.tokenTypes[this.next()];
      const range = this.addRangeForNextLoc();
      const loc = this.addEmptyLoc();
      const value = this.deserializeString();
      const token = {
        type: tokenType,
        loc,
        value,
        range
      };
      tokens.push(token);
    }
    return tokens;
  }
  /** @returns {FlowLoc} */ addEmptyLoc() {
    const locId = this.next();
    if (this.extendedLocationHeaders) {
      const flags = this.next();
      const position = this.extendedPositions[locId];
      if (position == null) {
        throw new Error(`Missing serialized extended location ${locId}`);
      }
      const loc = position.loc;
      if (flags & LOCATION_IDENTIFIER_NAME) {
        const identifierName = this.deserializeString();
        if (identifierName != null) {
          loc.identifierName = identifierName;
        }
      }
      return loc;
    }
    /** @type {FlowLoc} */ const loc = {};
    this.locMap[locId] = loc;
    return loc;
  }
  prepareExtendedPositions() {
    let index = this.positionBufferIdx;
    for (let i = 0; i < this.positionBufferSize; i++) {
      var _this$extendedPositio;
      const locId = this.HEAPU32[index++];
      const kind = this.HEAPU32[index++];
      const line = this.HEAPU32[index++];
      const column = this.HEAPU32[index++];
      const offset = this.HEAPU32[index++];
      const position = (_this$extendedPositio = this.extendedPositions[locId]) != null ? _this$extendedPositio : {
        loc: {},
        start: 0,
        end: 0
      };
      if (kind === 0) {
        position.loc.start = {
          line,
          column
        };
        position.start = offset;
      } else {
        position.loc.end = {
          line,
          column
        };
        position.end = offset;
      }
      this.extendedPositions[locId] = position;
    }
  }
  nextExtendedPosition() {
    return this.extendedPositions[this.HEAPU32[this.programBufferIdx]];
  }
  addExtendedRange(owner, position) {
    if (position == null || owner.loc !== position.loc) {
      return;
    }
    owner.start = position.start;
    owner.end = position.end;
  }
  addRangeForNextLoc() {
    const range = [0, 0];
    this.locRanges[this.HEAPU32[this.programBufferIdx]] = range;
    return range;
  }
  fillLocs() {
    const sourceFilename = this.sourceFilename;
    for (let i = 0; i < this.positionBufferSize; i++) {
      const locId = this.HEAPU32[this.positionBufferIdx++];
      const kind = this.HEAPU32[this.positionBufferIdx++];
      const line = this.HEAPU32[this.positionBufferIdx++];
      const column = this.HEAPU32[this.positionBufferIdx++];
      const offset = this.HEAPU32[this.positionBufferIdx++];
      /** @type {FlowLoc} */ const loc = this.locMap[locId];
      if (loc == null) {
        throw new Error(`Missing serialized location ${locId}`);
      }
      const range = this.locRanges[locId];
      if (kind === 0) {
        loc.start = {
          line,
          column
        };
        if (range != null) {
          range[0] = offset;
        }
      } else {
        loc.end = {
          line,
          column
        };
        loc.source = sourceFilename;
        if (range != null) {
          range[1] = offset;
        }
      }
    }
  }
}
exports.default = FlowParserDeserializer;
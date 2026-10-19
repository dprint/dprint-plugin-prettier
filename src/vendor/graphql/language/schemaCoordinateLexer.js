"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaCoordinateLexer = void 0;
const syntaxError_ts_1 = require("../error/syntaxError.js");
const ast_ts_1 = require("./ast.js");
const characterClasses_ts_1 = require("./characterClasses.js");
const lexer_ts_1 = require("./lexer.js");
const tokenKind_ts_1 = require("./tokenKind.js");
class SchemaCoordinateLexer {
    constructor(/** @type {import("./source.mjs").Source} */ source) {
        this.line = 1;
        /** @type {number} */ this.lineStart = 0;
        const startOfFileToken = new ast_ts_1.Token(tokenKind_ts_1.TokenKind.SOF, 0, 0, 0, 0);
        /** @type {import("./source.mjs").Source} */ this.source = source;
        /** @type {Token} */ this.lastToken = startOfFileToken;
        /** @type {Token} */ this.token = startOfFileToken;
    }
    get [Symbol.toStringTag]() {
        return 'SchemaCoordinateLexer';
    }
    advance() {
        this.lastToken = this.token;
        /** @type {Token} */ const token = (this.token = this.lookahead());
        return token;
    }
    lookahead() {
        /** @type {Token} */ let token = this.token;
        if (token.kind !== tokenKind_ts_1.TokenKind.EOF) {
            const nextToken = readNextToken(this, token.end);
            token.next = nextToken;
            nextToken.prev = token;
            token = nextToken;
        }
        return token;
    }
}
exports.SchemaCoordinateLexer = SchemaCoordinateLexer;
function readNextToken(/** @type {Lexer} */ lexer, /** @type {number} */ start) {
    const body = lexer.source.body;
    /** @type {number} */ const bodyLength = body.length;
    const position = start;
    if (position < bodyLength) {
        /** @type {number} */ const code = body.charCodeAt(position);
        switch (code) {
            case 0x002e:
                return (0, lexer_ts_1.createToken)(lexer, tokenKind_ts_1.TokenKind.DOT, position, position + 1);
            case 0x0028:
                return (0, lexer_ts_1.createToken)(lexer, tokenKind_ts_1.TokenKind.PAREN_L, position, position + 1);
            case 0x0029:
                return (0, lexer_ts_1.createToken)(lexer, tokenKind_ts_1.TokenKind.PAREN_R, position, position + 1);
            case 0x003a:
                return (0, lexer_ts_1.createToken)(lexer, tokenKind_ts_1.TokenKind.COLON, position, position + 1);
            case 0x0040:
                return (0, lexer_ts_1.createToken)(lexer, tokenKind_ts_1.TokenKind.AT, position, position + 1);
        }
        if ((0, characterClasses_ts_1.isNameStart)(code)) {
            return (0, lexer_ts_1.readName)(lexer, position);
        }
        throw (0, syntaxError_ts_1.syntaxError)(lexer.source, position, `Invalid character: ${(0, lexer_ts_1.printCodePointAt)(lexer, position)}.`);
    }
    return (0, lexer_ts_1.createToken)(lexer, tokenKind_ts_1.TokenKind.EOF, bodyLength, bodyLength);
}
//# sourceMappingURL=schemaCoordinateLexer.js.map
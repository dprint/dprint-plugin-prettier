import { syntaxError } from "../error/syntaxError.mjs";
import { Token } from "./ast.mjs";
import { isNameStart } from "./characterClasses.mjs";
import { createToken, printCodePointAt, readName } from "./lexer.mjs";
import { TokenKind } from "./tokenKind.mjs";
export class SchemaCoordinateLexer {
    constructor(/** @type {import("./source.mjs").Source} */ source) {
        this.line = 1;
        /** @type {number} */ this.lineStart = 0;
        /** @type {Token} */ const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);
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
        if (token.kind !== TokenKind.EOF) {
            const nextToken = readNextToken(this, token.end);
            token.next = nextToken;
            nextToken.prev = token;
            token = nextToken;
        }
        return token;
    }
}
function readNextToken(/** @type {Lexer} */ lexer, /** @type {number} */ start) {
    const body = lexer.source.body;
    /** @type {number} */ const bodyLength = body.length;
    const position = start;
    if (position < bodyLength) {
        /** @type {number} */ const code = body.charCodeAt(position);
        switch (code) {
            case 0x002e:
                return createToken(lexer, TokenKind.DOT, position, position + 1);
            case 0x0028:
                return createToken(lexer, TokenKind.PAREN_L, position, position + 1);
            case 0x0029:
                return createToken(lexer, TokenKind.PAREN_R, position, position + 1);
            case 0x003a:
                return createToken(lexer, TokenKind.COLON, position, position + 1);
            case 0x0040:
                return createToken(lexer, TokenKind.AT, position, position + 1);
        }
        if (isNameStart(code)) {
            return readName(lexer, position);
        }
        throw syntaxError(lexer.source, position, `Invalid character: ${printCodePointAt(lexer, position)}.`);
    }
    return createToken(lexer, TokenKind.EOF, bodyLength, bodyLength);
}
//# sourceMappingURL=schemaCoordinateLexer.js.map
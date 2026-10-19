"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripIgnoredCharacters = stripIgnoredCharacters;
const blockString_ts_1 = require("../language/blockString.js");
const lexer_ts_1 = require("../language/lexer.js");
const source_ts_1 = require("../language/source.js");
const tokenKind_ts_1 = require("../language/tokenKind.js");
function stripIgnoredCharacters(source) {
    const sourceObj = (0, source_ts_1.isSource)(source) ? source : new source_ts_1.Source(source);
    const body = sourceObj.body;
    const lexer = new lexer_ts_1.Lexer(sourceObj);
    let strippedBody = '';
    let wasLastAddedTokenNonPunctuator = false;
    while (lexer.advance().kind !== tokenKind_ts_1.TokenKind.EOF) {
        const currentToken = lexer.token;
        const tokenKind = currentToken.kind;
        const isNonPunctuator = !(0, lexer_ts_1.isPunctuatorTokenKind)(currentToken.kind);
        if (wasLastAddedTokenNonPunctuator) {
            if (isNonPunctuator || currentToken.kind === tokenKind_ts_1.TokenKind.SPREAD) {
                strippedBody += ' ';
            }
        }
        const tokenBody = body.slice(currentToken.start, currentToken.end);
        if (tokenKind === tokenKind_ts_1.TokenKind.BLOCK_STRING) {
            strippedBody += (0, blockString_ts_1.printBlockString)(currentToken.value, { minimize: true });
        }
        else {
            strippedBody += tokenBody;
        }
        wasLastAddedTokenNonPunctuator = isNonPunctuator;
    }
    return strippedBody;
}
//# sourceMappingURL=stripIgnoredCharacters.js.map
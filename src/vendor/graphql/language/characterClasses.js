"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWhiteSpace = isWhiteSpace;
exports.isDigit = isDigit;
exports.isLetter = isLetter;
exports.isNameStart = isNameStart;
exports.isNameContinue = isNameContinue;
function isWhiteSpace(code) {
    return code === 0x0009 || code === 0x0020;
}
function isDigit(code) {
    return code >= 0x0030 && code <= 0x0039;
}
function isLetter(code) {
    return ((code >= 0x0061 && code <= 0x007a) ||
        (code >= 0x0041 && code <= 0x005a));
}
function isNameStart(code) {
    return isLetter(code) || code === 0x005f;
}
function isNameContinue(code) {
    return isLetter(code) || isDigit(code) || code === 0x005f;
}
//# sourceMappingURL=characterClasses.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isWhiteSpace = isWhiteSpace;
exports.isDigit = isDigit;
exports.isLetter = isLetter;
exports.isNameStart = isNameStart;
exports.isNameContinue = isNameContinue;
/** @returns {boolean} */ function isWhiteSpace(/** @type {number} */ code) {
    return code === 0x0009 || code === 0x0020;
}
/** @returns {boolean} */ function isDigit(/** @type {number} */ code) {
    return code >= 0x0030 && code <= 0x0039;
}
/** @returns {boolean} */ function isLetter(/** @type {number} */ code) {
    return ((code >= 0x0061 && code <= 0x007a) ||
        (code >= 0x0041 && code <= 0x005a));
}
/** @returns {boolean} */ function isNameStart(/** @type {number} */ code) {
    return isLetter(code) || code === 0x005f;
}
/** @returns {boolean} */ function isNameContinue(/** @type {number} */ code) {
    return isLetter(code) || isDigit(code) || code === 0x005f;
}
//# sourceMappingURL=characterClasses.js.map
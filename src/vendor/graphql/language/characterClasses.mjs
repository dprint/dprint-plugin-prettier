// @nts-check
/** @returns {boolean} */ export function isWhiteSpace(/** @type {number} */ code) {
    return code === 0x0009 || code === 0x0020;
}
/** @returns {boolean} */ export function isDigit(/** @type {number} */ code) {
    return code >= 0x0030 && code <= 0x0039;
}
/** @returns {boolean} */ export function isLetter(/** @type {number} */ code) {
    return ((code >= 0x0061 && code <= 0x007a) ||
        (code >= 0x0041 && code <= 0x005a));
}
/** @returns {boolean} */ export function isNameStart(/** @type {number} */ code) {
    return isLetter(code) || code === 0x005f;
}
/** @returns {boolean} */ export function isNameContinue(/** @type {number} */ code) {
    return isLetter(code) || isDigit(code) || code === 0x005f;
}
//# sourceMappingURL=characterClasses.js.map
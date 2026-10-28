// @nts-check
/**
* @license
* Copyright Google LLC All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.dev/license
* @returns {boolean}
*/
function isWhitespace(/** @type {number} */ code) {
	return code >= 9 && code <= 32 || code == 160;
}
/** @returns {boolean} */ function isDigit(/** @type {number} */ code) {
	return 48 <= code && code <= 57;
}
/** @returns {boolean} */ function isAsciiLetter(/** @type {number} */ code) {
	return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
/** @returns {boolean} */ function isAsciiHexDigit(/** @type {number} */ code) {
	return code >= 97 && code <= 102 || code >= 65 && code <= 70 || isDigit(code);
}
/** @returns {boolean} */ function isNewLine(/** @type {number} */ code) {
	return code === 10 || code === 13;
}
function isOctalDigit(code) {
	return 48 <= code && code <= 55;
}
/** @returns {boolean} */ function isQuote(/** @type {number} */ code) {
	return code === 39 || code === 34 || code === 96;
}
//#endregion
export { isAsciiHexDigit, isAsciiLetter, isDigit, isNewLine, isOctalDigit, isQuote, isWhitespace };

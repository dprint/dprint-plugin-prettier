// @nts-check
//#region src/utils/find-last-char-index.ts
/** @returns {number} */ function findLastCharIndex(/** @type {string} */ text, /** @type {number} */ from, /** @type {RegExp} */ regex) {
	for (let i = from; i >= 0; i--) if (regex.test(text[i])) return i;
	// istanbul ignore next -- @preserve
	return -1;
}
//#endregion
export { findLastCharIndex };

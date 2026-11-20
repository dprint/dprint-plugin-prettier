// @nts-check
//#region src/utils/find-char-index.ts
/** @returns {number | null} */ function findCharIndex(/** @type {string} */ text, /** @type {number} */ from, /** @type {RegExp} */ regex) {
	for (let i = from; i < text.length; i++) if (regex.test(text[i])) return i;
	return null;
}
//#endregion
export { findCharIndex };

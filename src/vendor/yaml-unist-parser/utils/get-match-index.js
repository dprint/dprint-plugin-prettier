// @nts-check
/** @returns {number} */ export function getMatchIndex(/** @type {string} */ text, /** @type {RegExp} */ regex) {
    const match = text.match(regex);
    return match ? match.index : -1;
}

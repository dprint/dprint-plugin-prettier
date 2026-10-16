// @nts-check
/** @returns {number} */ export function findLastCharIndex(/** @type {string} */ text, /** @type {number} */ from, /** @type {RegExp} */ regex) {
    for (let i = from; i >= 0; i--) {
        if (regex.test(text[i])) {
            return i;
        }
    }
    // istanbul ignore next
    return -1;
}

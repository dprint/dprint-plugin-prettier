export function devAssert(/** @type {boolean} */ condition, /** @type {string} */ message) {
    if (!condition) {
        throw new Error(message);
    }
}
//# sourceMappingURL=devAssert.js.map
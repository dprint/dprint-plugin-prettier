export function invariant(/** @type {boolean} */ condition, /** @type {undefined | string} */ message) {
    if (!condition) {
        throw new Error(message ?? 'Unexpected invariant triggered.');
    }
}
//# sourceMappingURL=invariant.js.map
/** @returns {boolean} */ export function isPromise(value) {
    return value instanceof Promise;
}
/** @returns {boolean} */ export function isPromiseLike(value) {
    return typeof value?.then === 'function';
}
//# sourceMappingURL=isPromise.js.map
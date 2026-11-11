"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = isPromise;
exports.isPromiseLike = isPromiseLike;
/** @returns {boolean} */ function isPromise(value) {
    return value instanceof Promise;
}
/** @returns {boolean} */ function isPromiseLike(value) {
    return typeof value?.then === 'function';
}
//# sourceMappingURL=isPromise.js.map
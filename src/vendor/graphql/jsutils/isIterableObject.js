"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIterableObject = isIterableObject;
function isIterableObject(maybeIterable) {
    return (typeof maybeIterable === 'object' &&
        typeof maybeIterable?.[Symbol.iterator] === 'function');
}
//# sourceMappingURL=isIterableObject.js.map
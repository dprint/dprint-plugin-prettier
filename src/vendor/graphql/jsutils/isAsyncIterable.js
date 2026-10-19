"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsyncIterable = isAsyncIterable;
function isAsyncIterable(maybeAsyncIterable) {
    return typeof maybeAsyncIterable?.[Symbol.asyncIterator] === 'function';
}
//# sourceMappingURL=isAsyncIterable.js.map
export function isIterableObject(maybeIterable) {
    return (typeof maybeIterable === 'object' &&
        typeof maybeIterable?.[Symbol.iterator] === 'function');
}
//# sourceMappingURL=isIterableObject.js.map
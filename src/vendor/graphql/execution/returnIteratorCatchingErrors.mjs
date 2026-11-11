export async function returnIteratorCatchingErrors(iterator) {
    try {
        await iterator.return?.();
    }
    catch {
    }
}
//# sourceMappingURL=returnIteratorCatchingErrors.js.map
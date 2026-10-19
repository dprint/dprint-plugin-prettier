"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.returnIteratorCatchingErrors = returnIteratorCatchingErrors;
async function returnIteratorCatchingErrors(iterator) {
    try {
        await iterator.return?.();
    }
    catch {
    }
}
//# sourceMappingURL=returnIteratorCatchingErrors.js.map
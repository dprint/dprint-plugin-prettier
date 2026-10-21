"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.devAssert = devAssert;
function devAssert(/** @type {boolean} */ condition, /** @type {string} */ message) {
    if (!condition) {
        throw new Error(message);
    }
}
//# sourceMappingURL=devAssert.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printPathArray = printPathArray;
function printPathArray(path) {
    if (path.length === 0) {
        return '';
    }
    return ` at ${path
        .map((key) => (typeof key === 'number' ? `[${key}]` : `.${key}`))
        .join('')}`;
}
//# sourceMappingURL=printPathArray.js.map
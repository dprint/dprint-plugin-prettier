"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyValMap = keyValMap;
function keyValMap(list, keyFn, valFn) {
    const result = Object.create(null);
    for (const item of list) {
        result[keyFn(item)] = valFn(item);
    }
    return result;
}
//# sourceMappingURL=keyValMap.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.keyMap = keyMap;
function keyMap(list, keyFn) {
    const result = Object.create(null);
    for (const item of list) {
        result[keyFn(item)] = item;
    }
    return result;
}
//# sourceMappingURL=keyMap.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapValue = mapValue;
function mapValue(map, fn) {
    const result = Object.create(null);
    for (const key of Object.keys(map)) {
        result[key] = fn(map[key], key);
    }
    return result;
}
//# sourceMappingURL=mapValue.js.map
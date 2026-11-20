"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccumulatorMap = void 0;
class AccumulatorMap extends Map {
    get [Symbol.toStringTag]() {
        return 'AccumulatorMap';
    }
    add(key, item) {
        const group = this.get(key);
        if (group === undefined) {
            this.set(key, [item]);
        }
        else {
            group.push(item);
        }
    }
}
exports.AccumulatorMap = AccumulatorMap;
//# sourceMappingURL=AccumulatorMap.js.map
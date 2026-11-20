"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupBy = groupBy;
const AccumulatorMap_ts_1 = require("./AccumulatorMap.js");
function groupBy(list, keyFn) {
    const result = new AccumulatorMap_ts_1.AccumulatorMap();
    for (const item of list) {
        result.add(keyFn(item), item);
    }
    return result;
}
//# sourceMappingURL=groupBy.js.map
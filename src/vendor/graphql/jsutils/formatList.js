"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orList = orList;
exports.andList = andList;
const invariant_ts_1 = require("./invariant.js");
function orList(items) {
    return formatList('or', items);
}
function andList(items) {
    return formatList('and', items);
}
function formatList(conjunction, items) {
    if (!(items.length !== 0))
        (0, invariant_ts_1.invariant)(false);
    switch (items.length) {
        case 1:
            return items[0];
        case 2:
            return items[0] + ' ' + conjunction + ' ' + items[1];
    }
    const allButLast = items.slice(0, -1);
    const lastItem = items.at(-1);
    return allButLast.join(', ') + ', ' + conjunction + ' ' + lastItem;
}
//# sourceMappingURL=formatList.js.map
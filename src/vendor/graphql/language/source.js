"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Source = void 0;
exports.isSource = isSource;
const devAssert_ts_1 = require("../jsutils/devAssert.js");
const instanceOf_ts_1 = require("../jsutils/instanceOf.js");
const sourceSymbol = Symbol('Source');
class Source {
    constructor(body, name = 'GraphQL request', locationOffset = { line: 1, column: 1 }) {
        this.__kind = sourceSymbol;
        /** @type {string} */ this.body = body;
        /** @type {string} */ this.name = name;
        this.locationOffset = locationOffset;
        if (!(this.locationOffset.line > 0))
            (0, devAssert_ts_1.devAssert)(false, 'line in locationOffset is 1-indexed and must be positive.');
        if (!(this.locationOffset.column > 0))
            (0, devAssert_ts_1.devAssert)(false, 'column in locationOffset is 1-indexed and must be positive.');
    }
    get [Symbol.toStringTag]() {
        return 'Source';
    }
}
exports.Source = Source;
function isSource(source) {
    return (0, instanceOf_ts_1.instanceOf)(source, sourceSymbol, Source);
}
//# sourceMappingURL=source.js.map
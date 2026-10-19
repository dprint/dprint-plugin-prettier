"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toError = toError;
const inspect_ts_1 = require("./inspect.js");
function toError(thrownValue) {
    return thrownValue instanceof Error
        ? thrownValue
        : new NonErrorThrown(thrownValue);
}
class NonErrorThrown extends Error {
    constructor(thrownValue) {
        super('Unexpected error value: ' + (0, inspect_ts_1.inspect)(thrownValue));
        this.name = 'NonErrorThrown';
        this.thrownValue = thrownValue;
    }
}
//# sourceMappingURL=toError.js.map
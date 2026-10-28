"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueFromASTUntyped = valueFromASTUntyped;
const keyValMap_ts_1 = require("../jsutils/keyValMap.js");
const kinds_ts_1 = require("../language/kinds.js");
function valueFromASTUntyped(valueNode, variables) {
    switch (valueNode.kind) {
        case kinds_ts_1.Kind.NULL:
            return null;
        case kinds_ts_1.Kind.INT:
            return parseInt(valueNode.value, 10);
        case kinds_ts_1.Kind.FLOAT:
            return parseFloat(valueNode.value);
        case kinds_ts_1.Kind.STRING:
        case kinds_ts_1.Kind.ENUM:
        case kinds_ts_1.Kind.BOOLEAN:
            return valueNode.value;
        case kinds_ts_1.Kind.LIST:
            return valueNode.values.map((node) => valueFromASTUntyped(node, variables));
        case kinds_ts_1.Kind.OBJECT:
            return (0, keyValMap_ts_1.keyValMap)(valueNode.fields, (field) => field.name.value, (field) => valueFromASTUntyped(field.value, variables));
        case kinds_ts_1.Kind.VARIABLE:
            return variables?.[valueNode.name.value];
    }
}
//# sourceMappingURL=valueFromASTUntyped.js.map
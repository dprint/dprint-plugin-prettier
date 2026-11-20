"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortValueNode = sortValueNode;
const naturalCompare_ts_1 = require("../jsutils/naturalCompare.js");
const kinds_ts_1 = require("../language/kinds.js");
function sortValueNode(valueNode) {
    switch (valueNode.kind) {
        case kinds_ts_1.Kind.OBJECT:
            return {
                ...valueNode,
                fields: sortFields(valueNode.fields),
            };
        case kinds_ts_1.Kind.LIST:
            return {
                ...valueNode,
                values: valueNode.values.map(sortValueNode),
            };
        case kinds_ts_1.Kind.INT:
        case kinds_ts_1.Kind.FLOAT:
        case kinds_ts_1.Kind.STRING:
        case kinds_ts_1.Kind.BOOLEAN:
        case kinds_ts_1.Kind.NULL:
        case kinds_ts_1.Kind.ENUM:
        case kinds_ts_1.Kind.VARIABLE:
            return valueNode;
    }
}
function sortFields(fields) {
    return fields
        .map((fieldNode) => ({
        ...fieldNode,
        value: sortValueNode(fieldNode.value),
    }))
        .sort((fieldA, fieldB) => (0, naturalCompare_ts_1.naturalCompare)(fieldA.name.value, fieldB.name.value));
}
//# sourceMappingURL=sortValueNode.js.map
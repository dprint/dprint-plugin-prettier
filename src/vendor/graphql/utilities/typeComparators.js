"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEqualType = isEqualType;
exports.isTypeSubTypeOf = isTypeSubTypeOf;
exports.doTypesOverlap = doTypesOverlap;
const definition_ts_1 = require("../type/definition.js");
function isEqualType(typeA, typeB) {
    if (typeA === typeB) {
        return true;
    }
    if ((0, definition_ts_1.isNonNullType)(typeA) && (0, definition_ts_1.isNonNullType)(typeB)) {
        return isEqualType(typeA.ofType, typeB.ofType);
    }
    if ((0, definition_ts_1.isListType)(typeA) && (0, definition_ts_1.isListType)(typeB)) {
        return isEqualType(typeA.ofType, typeB.ofType);
    }
    return false;
}
function isTypeSubTypeOf(schema, maybeSubType, superType) {
    if (maybeSubType === superType) {
        return true;
    }
    if ((0, definition_ts_1.isNonNullType)(superType)) {
        if ((0, definition_ts_1.isNonNullType)(maybeSubType)) {
            return isTypeSubTypeOf(schema, maybeSubType.ofType, superType.ofType);
        }
        return false;
    }
    if ((0, definition_ts_1.isNonNullType)(maybeSubType)) {
        return isTypeSubTypeOf(schema, maybeSubType.ofType, superType);
    }
    if ((0, definition_ts_1.isListType)(superType)) {
        if ((0, definition_ts_1.isListType)(maybeSubType)) {
            return isTypeSubTypeOf(schema, maybeSubType.ofType, superType.ofType);
        }
        return false;
    }
    if ((0, definition_ts_1.isListType)(maybeSubType)) {
        return false;
    }
    return ((0, definition_ts_1.isAbstractType)(superType) &&
        ((0, definition_ts_1.isInterfaceType)(maybeSubType) || (0, definition_ts_1.isObjectType)(maybeSubType)) &&
        schema.isSubType(superType, maybeSubType));
}
function doTypesOverlap(schema, typeA, typeB) {
    if (typeA === typeB) {
        return true;
    }
    if ((0, definition_ts_1.isAbstractType)(typeA)) {
        if ((0, definition_ts_1.isAbstractType)(typeB)) {
            return schema
                .getPossibleTypes(typeA)
                .some((type) => schema.isSubType(typeB, type));
        }
        return schema.isSubType(typeA, typeB);
    }
    if ((0, definition_ts_1.isAbstractType)(typeB)) {
        return schema.isSubType(typeB, typeA);
    }
    return false;
}
//# sourceMappingURL=typeComparators.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.astFromValue = astFromValue;
const inspect_ts_1 = require("../jsutils/inspect.js");
const invariant_ts_1 = require("../jsutils/invariant.js");
const isIterableObject_ts_1 = require("../jsutils/isIterableObject.js");
const isObjectLike_ts_1 = require("../jsutils/isObjectLike.js");
const kinds_ts_1 = require("../language/kinds.js");
const definition_ts_1 = require("../type/definition.js");
const scalars_ts_1 = require("../type/scalars.js");
function astFromValue(value, type) {
    if ((0, definition_ts_1.isNonNullType)(type)) {
        const astValue = astFromValue(value, type.ofType);
        if (astValue?.kind === kinds_ts_1.Kind.NULL) {
            return null;
        }
        return astValue;
    }
    if (value === null) {
        return { kind: kinds_ts_1.Kind.NULL };
    }
    if (value === undefined) {
        return null;
    }
    if ((0, definition_ts_1.isListType)(type)) {
        const itemType = type.ofType;
        if ((0, isIterableObject_ts_1.isIterableObject)(value)) {
            const valuesNodes = [];
            for (const item of value) {
                const itemNode = astFromValue(item, itemType);
                if (itemNode != null) {
                    valuesNodes.push(itemNode);
                }
            }
            return { kind: kinds_ts_1.Kind.LIST, values: valuesNodes };
        }
        return astFromValue(value, itemType);
    }
    if ((0, definition_ts_1.isInputObjectType)(type)) {
        if (!(0, isObjectLike_ts_1.isObjectLike)(value)) {
            return null;
        }
        const fieldNodes = [];
        for (const field of Object.values(type.getFields())) {
            const fieldValue = astFromValue(value[field.name], field.type);
            if (fieldValue) {
                fieldNodes.push({
                    kind: kinds_ts_1.Kind.OBJECT_FIELD,
                    name: { kind: kinds_ts_1.Kind.NAME, value: field.name },
                    value: fieldValue,
                });
            }
        }
        return { kind: kinds_ts_1.Kind.OBJECT, fields: fieldNodes };
    }
    if ((0, definition_ts_1.isLeafType)(type)) {
        const coerced = type.coerceOutputValue(value);
        if (coerced == null) {
            return null;
        }
        if (typeof coerced === 'boolean') {
            return { kind: kinds_ts_1.Kind.BOOLEAN, value: coerced };
        }
        if (typeof coerced === 'number' && Number.isFinite(coerced)) {
            const stringNum = String(coerced);
            return integerStringRegExp.test(stringNum)
                ? { kind: kinds_ts_1.Kind.INT, value: stringNum }
                : { kind: kinds_ts_1.Kind.FLOAT, value: stringNum };
        }
        if (typeof coerced === 'bigint') {
            return { kind: kinds_ts_1.Kind.INT, value: String(coerced) };
        }
        if (typeof coerced === 'string') {
            if ((0, definition_ts_1.isEnumType)(type)) {
                return { kind: kinds_ts_1.Kind.ENUM, value: coerced };
            }
            if (type === scalars_ts_1.GraphQLID && integerStringRegExp.test(coerced)) {
                return { kind: kinds_ts_1.Kind.INT, value: coerced };
            }
            return {
                kind: kinds_ts_1.Kind.STRING,
                value: coerced,
            };
        }
        throw new TypeError(`Cannot convert value to AST: ${(0, inspect_ts_1.inspect)(coerced)}.`);
    }
    (0, invariant_ts_1.invariant)(false, 'Unexpected input type: ' + (0, inspect_ts_1.inspect)(type));
}
const integerStringRegExp = /^-?(?:0|[1-9][0-9]*)$/;
//# sourceMappingURL=astFromValue.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.valueToLiteral = valueToLiteral;
exports.defaultScalarValueToLiteral = defaultScalarValueToLiteral;
const inspect_ts_1 = require("../jsutils/inspect.js");
const isIterableObject_ts_1 = require("../jsutils/isIterableObject.js");
const isObjectLike_ts_1 = require("../jsutils/isObjectLike.js");
const kinds_ts_1 = require("../language/kinds.js");
const definition_ts_1 = require("../type/definition.js");
function valueToLiteral(value, type) {
    if ((0, definition_ts_1.isNonNullType)(type)) {
        if (value == null) {
            return;
        }
        return valueToLiteral(value, type.ofType);
    }
    if (value == null) {
        return { kind: kinds_ts_1.Kind.NULL };
    }
    if ((0, definition_ts_1.isListType)(type)) {
        if (!(0, isIterableObject_ts_1.isIterableObject)(value)) {
            return valueToLiteral(value, type.ofType);
        }
        const values = [];
        for (const itemValue of value) {
            const itemNode = valueToLiteral(itemValue, type.ofType);
            if (!itemNode) {
                return;
            }
            values.push(itemNode);
        }
        return { kind: kinds_ts_1.Kind.LIST, values };
    }
    if ((0, definition_ts_1.isInputObjectType)(type)) {
        if (!(0, isObjectLike_ts_1.isObjectLike)(value)) {
            return;
        }
        const fields = [];
        const fieldDefs = type.getFields();
        const hasUndefinedField = Object.keys(value).some((name) => value[name] !== undefined && !Object.hasOwn(fieldDefs, name));
        if (hasUndefinedField) {
            return;
        }
        for (const field of Object.values(type.getFields())) {
            const fieldValue = value[field.name];
            if (fieldValue === undefined) {
                if ((0, definition_ts_1.isRequiredInputField)(field)) {
                    return;
                }
            }
            else {
                const fieldNode = valueToLiteral(value[field.name], field.type);
                if (!fieldNode) {
                    return;
                }
                fields.push({
                    kind: kinds_ts_1.Kind.OBJECT_FIELD,
                    name: { kind: kinds_ts_1.Kind.NAME, value: field.name },
                    value: fieldNode,
                });
            }
        }
        return { kind: kinds_ts_1.Kind.OBJECT, fields };
    }
    const leafType = (0, definition_ts_1.assertLeafType)(type);
    if (leafType.valueToLiteral) {
        try {
            return leafType.valueToLiteral(value);
        }
        catch (_error) {
            return;
        }
    }
    return defaultScalarValueToLiteral(value);
}
function defaultScalarValueToLiteral(value) {
    if (value == null) {
        return { kind: kinds_ts_1.Kind.NULL };
    }
    switch (typeof value) {
        case 'boolean':
            return { kind: kinds_ts_1.Kind.BOOLEAN, value };
        case 'string':
            return { kind: kinds_ts_1.Kind.STRING, value, block: false };
        case 'bigint':
            return { kind: kinds_ts_1.Kind.INT, value: value.toString() };
        case 'number': {
            if (!Number.isFinite(value)) {
                return { kind: kinds_ts_1.Kind.NULL };
            }
            const stringValue = String(value);
            return /^-?(?:0|[1-9][0-9]*)$/.test(stringValue)
                ? { kind: kinds_ts_1.Kind.INT, value: stringValue }
                : { kind: kinds_ts_1.Kind.FLOAT, value: stringValue };
        }
        case 'object': {
            if ((0, isIterableObject_ts_1.isIterableObject)(value)) {
                return {
                    kind: kinds_ts_1.Kind.LIST,
                    values: Array.from(value, defaultScalarValueToLiteral),
                };
            }
            const objValue = value;
            const fields = [];
            for (const fieldName of Object.keys(objValue)) {
                const fieldValue = objValue[fieldName];
                if (fieldValue !== undefined) {
                    fields.push({
                        kind: kinds_ts_1.Kind.OBJECT_FIELD,
                        name: { kind: kinds_ts_1.Kind.NAME, value: fieldName },
                        value: defaultScalarValueToLiteral(fieldValue),
                    });
                }
            }
            return { kind: kinds_ts_1.Kind.OBJECT, fields };
        }
    }
    throw new TypeError(`Cannot convert value to AST: ${(0, inspect_ts_1.inspect)(value)}.`);
}
//# sourceMappingURL=valueToLiteral.js.map
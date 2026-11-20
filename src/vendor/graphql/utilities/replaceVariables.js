"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceVariables = replaceVariables;
const kinds_ts_1 = require("../language/kinds.js");
const valueToLiteral_ts_1 = require("./valueToLiteral.js");
function replaceVariables(valueNode, variableValues, fragmentVariableValues) {
    switch (valueNode.kind) {
        case kinds_ts_1.Kind.VARIABLE: {
            const varName = valueNode.name.value;
            const fragmentVariableValueSource = fragmentVariableValues?.sources[varName];
            if (fragmentVariableValueSource) {
                const value = fragmentVariableValueSource.value;
                if (value === undefined) {
                    const defaultValue = fragmentVariableValueSource.signature.default;
                    if (defaultValue !== undefined) {
                        return defaultValue.literal;
                    }
                    return { kind: kinds_ts_1.Kind.NULL };
                }
                return replaceVariables(value, variableValues, fragmentVariableValueSource.fragmentVariableValues);
            }
            const variableValueSource = variableValues?.sources[varName];
            if (variableValueSource == null) {
                return { kind: kinds_ts_1.Kind.NULL };
            }
            if (variableValueSource.value === undefined) {
                const defaultValue = variableValueSource.signature.default;
                if (defaultValue !== undefined) {
                    return defaultValue.literal;
                }
            }
            return (0, valueToLiteral_ts_1.valueToLiteral)(variableValueSource.value, variableValueSource.signature.type);
        }
        case kinds_ts_1.Kind.OBJECT: {
            const newFields = [];
            for (const field of valueNode.fields) {
                if (field.value.kind === kinds_ts_1.Kind.VARIABLE) {
                    const scopedVariableSource = fragmentVariableValues?.sources[field.value.name.value] ??
                        variableValues?.sources[field.value.name.value];
                    if (scopedVariableSource?.value === undefined &&
                        scopedVariableSource?.signature.default === undefined) {
                        continue;
                    }
                }
                const newFieldNodeValue = replaceVariables(field.value, variableValues, fragmentVariableValues);
                newFields.push({
                    ...field,
                    value: newFieldNodeValue,
                });
            }
            return {
                ...valueNode,
                fields: newFields,
            };
        }
        case kinds_ts_1.Kind.LIST: {
            const newValues = [];
            for (const value of valueNode.values) {
                const newItemNodeValue = replaceVariables(value, variableValues, fragmentVariableValues);
                newValues.push(newItemNodeValue);
            }
            return {
                ...valueNode,
                values: newValues,
            };
        }
        default: {
            return valueNode;
        }
    }
}
//# sourceMappingURL=replaceVariables.js.map
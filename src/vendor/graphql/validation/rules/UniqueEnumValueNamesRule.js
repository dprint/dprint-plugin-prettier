"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueEnumValueNamesRule = UniqueEnumValueNamesRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
const definition_ts_1 = require("../../type/definition.js");
function UniqueEnumValueNamesRule(context) {
    const schema = context.getSchema();
    const existingTypeMap = schema ? schema.getTypeMap() : Object.create(null);
    const knownValueNames = new Map();
    return {
        EnumTypeDefinition: checkValueUniqueness,
        EnumTypeExtension: checkValueUniqueness,
    };
    function checkValueUniqueness(node) {
        const typeName = node.name.value;
        let valueNames = knownValueNames.get(typeName);
        if (valueNames == null) {
            valueNames = new Map();
            knownValueNames.set(typeName, valueNames);
        }
        const valueNodes = node.values ?? [];
        for (const valueDef of valueNodes) {
            const valueName = valueDef.name.value;
            const existingType = existingTypeMap[typeName];
            if ((0, definition_ts_1.isEnumType)(existingType) && existingType.getValue(valueName)) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Enum value "${typeName}.${valueName}" already exists in the schema. It cannot also be defined in this type extension.`, { nodes: valueDef.name }));
                continue;
            }
            const knownValueName = valueNames.get(valueName);
            if (knownValueName != null) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Enum value "${typeName}.${valueName}" can only be defined once.`, { nodes: [knownValueName, valueDef.name] }));
            }
            else {
                valueNames.set(valueName, valueDef.name);
            }
        }
        return false;
    }
}
//# sourceMappingURL=UniqueEnumValueNamesRule.js.map
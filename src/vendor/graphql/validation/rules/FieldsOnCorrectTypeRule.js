"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FieldsOnCorrectTypeRule = FieldsOnCorrectTypeRule;
const didYouMean_ts_1 = require("../../jsutils/didYouMean.js");
const naturalCompare_ts_1 = require("../../jsutils/naturalCompare.js");
const suggestionList_ts_1 = require("../../jsutils/suggestionList.js");
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
const definition_ts_1 = require("../../type/definition.js");
function FieldsOnCorrectTypeRule(context) {
    return {
        Field(node) {
            const type = context.getParentType();
            if (type) {
                const fieldDef = context.getFieldDef();
                if (!fieldDef) {
                    const schema = context.getSchema();
                    const fieldName = node.name.value;
                    let suggestion = (0, didYouMean_ts_1.didYouMean)('to use an inline fragment on', context.hideSuggestions
                        ? []
                        : getSuggestedTypeNames(schema, type, fieldName));
                    if (suggestion === '') {
                        suggestion = (0, didYouMean_ts_1.didYouMean)(context.hideSuggestions
                            ? []
                            : getSuggestedFieldNames(type, fieldName));
                    }
                    context.reportError(new GraphQLError_ts_1.GraphQLError(`Cannot query field "${fieldName}" on type "${type}".` +
                        suggestion, { nodes: node }));
                }
            }
        },
    };
}
function getSuggestedTypeNames(schema, type, fieldName) {
    if (!(0, definition_ts_1.isAbstractType)(type)) {
        return [];
    }
    const suggestedTypes = new Set();
    const usageCount = Object.create(null);
    for (const possibleType of schema.getPossibleTypes(type)) {
        if (possibleType.getFields()[fieldName] == null) {
            continue;
        }
        suggestedTypes.add(possibleType);
        usageCount[possibleType.name] = 1;
        for (const possibleInterface of possibleType.getInterfaces()) {
            if (possibleInterface.getFields()[fieldName] == null) {
                continue;
            }
            suggestedTypes.add(possibleInterface);
            usageCount[possibleInterface.name] =
                (usageCount[possibleInterface.name] ?? 0) + 1;
        }
    }
    return [...suggestedTypes]
        .sort((typeA, typeB) => {
        const usageCountDiff = usageCount[typeB.name] - usageCount[typeA.name];
        if (usageCountDiff !== 0) {
            return usageCountDiff;
        }
        if ((0, definition_ts_1.isInterfaceType)(typeA) && schema.isSubType(typeA, typeB)) {
            return -1;
        }
        if ((0, definition_ts_1.isInterfaceType)(typeB) && schema.isSubType(typeB, typeA)) {
            return 1;
        }
        return (0, naturalCompare_ts_1.naturalCompare)(typeA.name, typeB.name);
    })
        .map((x) => x.name);
}
function getSuggestedFieldNames(type, fieldName) {
    if ((0, definition_ts_1.isObjectType)(type) || (0, definition_ts_1.isInterfaceType)(type)) {
        const possibleFieldNames = Object.keys(type.getFields());
        return (0, suggestionList_ts_1.suggestionList)(fieldName, possibleFieldNames);
    }
    return [];
}
//# sourceMappingURL=FieldsOnCorrectTypeRule.js.map
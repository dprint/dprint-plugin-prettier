"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueOperationTypesRule = UniqueOperationTypesRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function UniqueOperationTypesRule(context) {
    const schema = context.getSchema();
    const definedOperationTypes = new Map();
    const existingOperationTypes = schema
        ? {
            query: schema.getQueryType(),
            mutation: schema.getMutationType(),
            subscription: schema.getSubscriptionType(),
        }
        : {};
    return {
        SchemaDefinition: checkOperationTypes,
        SchemaExtension: checkOperationTypes,
    };
    function checkOperationTypes(node) {
        const operationTypesNodes = node.operationTypes ?? [];
        for (const operationType of operationTypesNodes) {
            const operation = operationType.operation;
            const alreadyDefinedOperationType = definedOperationTypes.get(operation);
            if (existingOperationTypes[operation]) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Type for ${operation} already defined in the schema. It cannot be redefined.`, { nodes: operationType }));
            }
            else if (alreadyDefinedOperationType) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`There can be only one ${operation} type in schema.`, { nodes: [alreadyDefinedOperationType, operationType] }));
            }
            else {
                definedOperationTypes.set(operation, operationType);
            }
        }
        return false;
    }
}
//# sourceMappingURL=UniqueOperationTypesRule.js.map
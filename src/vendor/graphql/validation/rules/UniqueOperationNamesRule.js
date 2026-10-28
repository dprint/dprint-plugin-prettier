"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueOperationNamesRule = UniqueOperationNamesRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function UniqueOperationNamesRule(context) {
    const knownOperationNames = new Map();
    return {
        OperationDefinition(node) {
            const operationName = node.name;
            if (operationName != null) {
                const knownOperationName = knownOperationNames.get(operationName.value);
                if (knownOperationName != null) {
                    context.reportError(new GraphQLError_ts_1.GraphQLError(`There can be only one operation named "${operationName.value}".`, { nodes: [knownOperationName, operationName] }));
                }
                else {
                    knownOperationNames.set(operationName.value, operationName);
                }
            }
            return false;
        },
        FragmentDefinition: () => false,
    };
}
//# sourceMappingURL=UniqueOperationNamesRule.js.map
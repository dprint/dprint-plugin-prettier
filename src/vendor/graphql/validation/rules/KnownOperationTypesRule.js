"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownOperationTypesRule = KnownOperationTypesRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function KnownOperationTypesRule(context) {
    const schema = context.getSchema();
    return {
        OperationDefinition(node) {
            const operation = node.operation;
            if (!schema.getRootType(operation)) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`The ${operation} operation is not supported by the schema.`, { nodes: node }));
            }
        },
    };
}
//# sourceMappingURL=KnownOperationTypesRule.js.map
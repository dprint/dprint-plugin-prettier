"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoneAnonymousOperationRule = LoneAnonymousOperationRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
const kinds_ts_1 = require("../../language/kinds.js");
function LoneAnonymousOperationRule(context) {
    let operationCount = 0;
    return {
        Document(node) {
            operationCount = node.definitions.filter((definition) => definition.kind === kinds_ts_1.Kind.OPERATION_DEFINITION).length;
        },
        OperationDefinition(node) {
            if (!node.name && operationCount > 1) {
                context.reportError(new GraphQLError_ts_1.GraphQLError('This anonymous operation must be the only defined operation.', { nodes: node }));
            }
        },
    };
}
//# sourceMappingURL=LoneAnonymousOperationRule.js.map
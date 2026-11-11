"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoneSchemaDefinitionRule = LoneSchemaDefinitionRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function LoneSchemaDefinitionRule(context) {
    const oldSchema = context.getSchema();
    const alreadyDefined = oldSchema?.astNode ??
        oldSchema?.getQueryType() ??
        oldSchema?.getMutationType() ??
        oldSchema?.getSubscriptionType();
    let schemaDefinitionsCount = 0;
    return {
        SchemaDefinition(node) {
            if (alreadyDefined) {
                context.reportError(new GraphQLError_ts_1.GraphQLError('Cannot define a new schema within a schema extension.', { nodes: node }));
                return;
            }
            if (schemaDefinitionsCount > 0) {
                context.reportError(new GraphQLError_ts_1.GraphQLError('Must provide only one schema definition.', {
                    nodes: node,
                }));
            }
            ++schemaDefinitionsCount;
        },
    };
}
//# sourceMappingURL=LoneSchemaDefinitionRule.js.map
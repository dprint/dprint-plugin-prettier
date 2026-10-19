"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoSchemaIntrospectionCustomRule = NoSchemaIntrospectionCustomRule;
const GraphQLError_ts_1 = require("../../../error/GraphQLError.js");
const definition_ts_1 = require("../../../type/definition.js");
const introspection_ts_1 = require("../../../type/introspection.js");
function NoSchemaIntrospectionCustomRule(context) {
    return {
        Field(node) {
            const type = (0, definition_ts_1.getNamedType)(context.getType());
            if (type && (0, introspection_ts_1.isIntrospectionType)(type)) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`GraphQL introspection has been disabled, but the requested query contained the field "${node.name.value}".`, { nodes: node }));
            }
        },
    };
}
//# sourceMappingURL=NoSchemaIntrospectionCustomRule.js.map
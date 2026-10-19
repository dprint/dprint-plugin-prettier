"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutableDefinitionsRule = ExecutableDefinitionsRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
const kinds_ts_1 = require("../../language/kinds.js");
const predicates_ts_1 = require("../../language/predicates.js");
function ExecutableDefinitionsRule(context) {
    return {
        Document(node) {
            for (const definition of node.definitions) {
                if (!(0, predicates_ts_1.isExecutableDefinitionNode)(definition)) {
                    const defName = definition.kind === kinds_ts_1.Kind.SCHEMA_DEFINITION ||
                        definition.kind === kinds_ts_1.Kind.SCHEMA_EXTENSION
                        ? 'schema'
                        : '"' + definition.name.value + '"';
                    context.reportError(new GraphQLError_ts_1.GraphQLError(`The ${defName} definition is not executable.`, {
                        nodes: definition,
                    }));
                }
            }
            return false;
        },
    };
}
//# sourceMappingURL=ExecutableDefinitionsRule.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VariablesAreInputTypesRule = VariablesAreInputTypesRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
const printer_ts_1 = require("../../language/printer.js");
const definition_ts_1 = require("../../type/definition.js");
const typeFromAST_ts_1 = require("../../utilities/typeFromAST.js");
function VariablesAreInputTypesRule(context) {
    return {
        VariableDefinition(node) {
            const type = (0, typeFromAST_ts_1.typeFromAST)(context.getSchema(), node.type);
            if (type !== undefined && !(0, definition_ts_1.isInputType)(type)) {
                const variableName = node.variable.name.value;
                const typeName = (0, printer_ts_1.print)(node.type);
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Variable "$${variableName}" cannot be non-input type "${typeName}".`, { nodes: node.type }));
            }
        },
    };
}
//# sourceMappingURL=VariablesAreInputTypesRule.js.map
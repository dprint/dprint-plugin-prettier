"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FragmentsOnCompositeTypesRule = FragmentsOnCompositeTypesRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
const printer_ts_1 = require("../../language/printer.js");
const definition_ts_1 = require("../../type/definition.js");
const typeFromAST_ts_1 = require("../../utilities/typeFromAST.js");
function FragmentsOnCompositeTypesRule(context) {
    return {
        InlineFragment(node) {
            const typeCondition = node.typeCondition;
            if (typeCondition) {
                const type = (0, typeFromAST_ts_1.typeFromAST)(context.getSchema(), typeCondition);
                if (type && !(0, definition_ts_1.isCompositeType)(type)) {
                    const typeStr = (0, printer_ts_1.print)(typeCondition);
                    context.reportError(new GraphQLError_ts_1.GraphQLError(`Fragment cannot condition on non composite type "${typeStr}".`, { nodes: typeCondition }));
                }
            }
        },
        FragmentDefinition(node) {
            const type = (0, typeFromAST_ts_1.typeFromAST)(context.getSchema(), node.typeCondition);
            if (type && !(0, definition_ts_1.isCompositeType)(type)) {
                const typeStr = (0, printer_ts_1.print)(node.typeCondition);
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Fragment "${node.name.value}" cannot condition on non composite type "${typeStr}".`, { nodes: node.typeCondition }));
            }
        },
    };
}
//# sourceMappingURL=FragmentsOnCompositeTypesRule.js.map
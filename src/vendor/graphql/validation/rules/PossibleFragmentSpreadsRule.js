"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PossibleFragmentSpreadsRule = PossibleFragmentSpreadsRule;
const inspect_ts_1 = require("../../jsutils/inspect.js");
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
const definition_ts_1 = require("../../type/definition.js");
const typeComparators_ts_1 = require("../../utilities/typeComparators.js");
const typeFromAST_ts_1 = require("../../utilities/typeFromAST.js");
function PossibleFragmentSpreadsRule(context) {
    return {
        InlineFragment(node) {
            const fragType = context.getType();
            const parentType = context.getParentType();
            if ((0, definition_ts_1.isCompositeType)(fragType) &&
                (0, definition_ts_1.isCompositeType)(parentType) &&
                !(0, typeComparators_ts_1.doTypesOverlap)(context.getSchema(), fragType, parentType)) {
                const parentTypeStr = (0, inspect_ts_1.inspect)(parentType);
                const fragTypeStr = (0, inspect_ts_1.inspect)(fragType);
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Fragment cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, { nodes: node }));
            }
        },
        FragmentSpread(node) {
            const fragName = node.name.value;
            const fragType = getFragmentType(context, fragName);
            const parentType = context.getParentType();
            if (fragType &&
                parentType &&
                !(0, typeComparators_ts_1.doTypesOverlap)(context.getSchema(), fragType, parentType)) {
                const parentTypeStr = (0, inspect_ts_1.inspect)(parentType);
                const fragTypeStr = (0, inspect_ts_1.inspect)(fragType);
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Fragment "${fragName}" cannot be spread here as objects of type "${parentTypeStr}" can never be of type "${fragTypeStr}".`, { nodes: node }));
            }
        },
    };
}
function getFragmentType(context, name) {
    const frag = context.getFragment(name);
    if (frag) {
        const type = (0, typeFromAST_ts_1.typeFromAST)(context.getSchema(), frag.typeCondition);
        if ((0, definition_ts_1.isCompositeType)(type)) {
            return type;
        }
    }
}
//# sourceMappingURL=PossibleFragmentSpreadsRule.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamDirectiveOnListFieldRule = StreamDirectiveOnListFieldRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
const definition_ts_1 = require("../../type/definition.js");
const directives_ts_1 = require("../../type/directives.js");
function StreamDirectiveOnListFieldRule(context) {
    return {
        Directive(node) {
            const fieldDef = context.getFieldDef();
            const parentType = context.getParentType();
            if (fieldDef &&
                parentType &&
                node.name.value === directives_ts_1.GraphQLStreamDirective.name &&
                !((0, definition_ts_1.isListType)(fieldDef.type) ||
                    ((0, definition_ts_1.isWrappingType)(fieldDef.type) && (0, definition_ts_1.isListType)(fieldDef.type.ofType)))) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Directive "@stream" cannot be used on non-list field "${parentType}.${fieldDef.name}".`, { nodes: node }));
            }
        },
    };
}
//# sourceMappingURL=StreamDirectiveOnListFieldRule.js.map
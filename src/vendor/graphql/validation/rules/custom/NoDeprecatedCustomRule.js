"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoDeprecatedCustomRule = NoDeprecatedCustomRule;
const GraphQLError_ts_1 = require("../../../error/GraphQLError.js");
const definition_ts_1 = require("../../../type/definition.js");
function NoDeprecatedCustomRule(context) {
    return {
        Field(node) {
            const fieldDef = context.getFieldDef();
            const deprecationReason = fieldDef?.deprecationReason;
            if (fieldDef && deprecationReason != null) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`The field ${fieldDef} is deprecated. ${deprecationReason}`, { nodes: node }));
            }
        },
        Argument(node) {
            const argDef = context.getArgument();
            const deprecationReason = argDef?.deprecationReason;
            if (argDef && deprecationReason != null) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`The argument "${argDef}" is deprecated. ${deprecationReason}`, { nodes: node }));
            }
        },
        ObjectField(node) {
            const inputObjectDef = (0, definition_ts_1.getNamedType)(context.getParentInputType());
            if ((0, definition_ts_1.isInputObjectType)(inputObjectDef)) {
                const inputFieldDef = inputObjectDef.getFields()[node.name.value];
                const deprecationReason = inputFieldDef?.deprecationReason;
                if (deprecationReason != null) {
                    context.reportError(new GraphQLError_ts_1.GraphQLError(`The input field ${inputFieldDef} is deprecated. ${deprecationReason}`, { nodes: node }));
                }
            }
        },
        EnumValue(node) {
            const enumValueDef = context.getEnumValue();
            const deprecationReason = enumValueDef?.deprecationReason;
            if (enumValueDef && deprecationReason != null) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`The enum value "${enumValueDef}" is deprecated. ${deprecationReason}`, { nodes: node }));
            }
        },
    };
}
//# sourceMappingURL=NoDeprecatedCustomRule.js.map
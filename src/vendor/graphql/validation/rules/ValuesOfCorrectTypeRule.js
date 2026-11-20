"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValuesOfCorrectTypeRule = ValuesOfCorrectTypeRule;
const validateInputValue_ts_1 = require("../../utilities/validateInputValue.js");
function ValuesOfCorrectTypeRule(context) {
    return {
        NullValue: (node) => isValidValueNode(context, node, context.getInputType()),
        ListValue: (node) => isValidValueNode(context, node, context.getParentInputType()),
        ObjectValue: (node) => isValidValueNode(context, node, context.getInputType()),
        EnumValue: (node) => isValidValueNode(context, node, context.getInputType()),
        IntValue: (node) => isValidValueNode(context, node, context.getInputType()),
        FloatValue: (node) => isValidValueNode(context, node, context.getInputType()),
        StringValue: (node) => isValidValueNode(context, node, context.getInputType()),
        BooleanValue: (node) => isValidValueNode(context, node, context.getInputType()),
    };
}
function isValidValueNode(context, node, inputType) {
    if (inputType) {
        (0, validateInputValue_ts_1.validateInputLiteral)(node, inputType, (error) => {
            context.reportError(error);
        }, undefined, undefined, context.hideSuggestions);
    }
    return false;
}
//# sourceMappingURL=ValuesOfCorrectTypeRule.js.map
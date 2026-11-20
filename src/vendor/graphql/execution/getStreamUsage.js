"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreamUsage = getStreamUsage;
const invariant_ts_1 = require("../jsutils/invariant.js");
const ast_ts_1 = require("../language/ast.js");
const directives_ts_1 = require("../type/directives.js");
const values_ts_1 = require("./values.js");
function getStreamUsage(validatedExecutionArgs, fieldDetailsList) {
    const { operation, variableValues } = validatedExecutionArgs;
    const stream = (0, values_ts_1.getDirectiveValues)(directives_ts_1.GraphQLStreamDirective, fieldDetailsList[0].node, variableValues, fieldDetailsList[0].fragmentVariableValues);
    if (!stream) {
        return;
    }
    if (stream.if === false) {
        return;
    }
    if (!(typeof stream.initialCount === 'number'))
        (0, invariant_ts_1.invariant)(false, 'initialCount must be a number');
    if (!(stream.initialCount >= 0))
        (0, invariant_ts_1.invariant)(false, 'initialCount must be a positive integer');
    if (!(operation.operation !== ast_ts_1.OperationTypeNode.SUBSCRIPTION))
        (0, invariant_ts_1.invariant)(false, '`@stream` directive not supported on subscription operations. Disable `@stream` by setting the `if` argument to `false`.');
    const streamedFieldDetailsList = fieldDetailsList.map((fieldDetails) => ({
        node: fieldDetails.node,
        deferUsage: undefined,
        fragmentVariableValues: fieldDetails.fragmentVariableValues,
    }));
    return {
        initialCount: stream.initialCount,
        label: typeof stream.label === 'string' ? stream.label : undefined,
        fieldDetailsList: streamedFieldDetailsList,
    };
}
//# sourceMappingURL=getStreamUsage.js.map
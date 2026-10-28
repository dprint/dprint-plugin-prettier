"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueArgumentNamesRule = UniqueArgumentNamesRule;
const groupBy_ts_1 = require("../../jsutils/groupBy.js");
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function UniqueArgumentNamesRule(context) {
    return {
        Field: checkArgUniqueness,
        Directive: checkArgUniqueness,
    };
    function checkArgUniqueness(parentNode) {
        const argumentNodes = parentNode.arguments ?? [];
        const seenArgs = (0, groupBy_ts_1.groupBy)(argumentNodes, (arg) => arg.name.value);
        for (const [argName, argNodes] of seenArgs) {
            if (argNodes.length > 1) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`There can be only one argument named "${argName}".`, { nodes: argNodes.map((node) => node.name) }));
            }
        }
    }
}
//# sourceMappingURL=UniqueArgumentNamesRule.js.map
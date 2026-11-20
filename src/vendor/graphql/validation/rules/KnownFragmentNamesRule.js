"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnownFragmentNamesRule = KnownFragmentNamesRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function KnownFragmentNamesRule(context) {
    return {
        FragmentSpread(node) {
            const fragmentName = node.name.value;
            const fragment = context.getFragment(fragmentName);
            if (!fragment) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Unknown fragment "${fragmentName}".`, {
                    nodes: node.name,
                }));
            }
        },
    };
}
//# sourceMappingURL=KnownFragmentNamesRule.js.map
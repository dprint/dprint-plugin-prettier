"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueFragmentNamesRule = UniqueFragmentNamesRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function UniqueFragmentNamesRule(context) {
    const knownFragmentNames = new Map();
    return {
        OperationDefinition: () => false,
        FragmentDefinition(node) {
            const fragmentName = node.name.value;
            const knownFragmentName = knownFragmentNames.get(fragmentName);
            if (knownFragmentName != null) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`There can be only one fragment named "${fragmentName}".`, { nodes: [knownFragmentName, node.name] }));
            }
            else {
                knownFragmentNames.set(fragmentName, node.name);
            }
            return false;
        },
    };
}
//# sourceMappingURL=UniqueFragmentNamesRule.js.map
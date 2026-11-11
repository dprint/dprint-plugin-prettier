"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NoUnusedFragmentsRule = NoUnusedFragmentsRule;
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function NoUnusedFragmentsRule(context) {
    const fragmentNameUsed = new Set();
    const fragmentDefs = [];
    return {
        OperationDefinition(operation) {
            for (const fragment of context.getRecursivelyReferencedFragments(operation)) {
                fragmentNameUsed.add(fragment.name.value);
            }
            return false;
        },
        FragmentDefinition(node) {
            fragmentDefs.push(node);
            return false;
        },
        Document: {
            leave() {
                for (const fragmentDef of fragmentDefs) {
                    const fragName = fragmentDef.name.value;
                    if (!fragmentNameUsed.has(fragName)) {
                        context.reportError(new GraphQLError_ts_1.GraphQLError(`Fragment "${fragName}" is never used.`, {
                            nodes: fragmentDef,
                        }));
                    }
                }
            },
        },
    };
}
//# sourceMappingURL=NoUnusedFragmentsRule.js.map
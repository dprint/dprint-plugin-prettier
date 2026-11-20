"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueInputFieldNamesRule = UniqueInputFieldNamesRule;
const invariant_ts_1 = require("../../jsutils/invariant.js");
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function UniqueInputFieldNamesRule(context) {
    const knownNameStack = [];
    let knownNames = new Map();
    return {
        ObjectValue: {
            enter() {
                knownNameStack.push(knownNames);
                knownNames = new Map();
            },
            leave() {
                const prevKnownNames = knownNameStack.pop();
                if (!(prevKnownNames != null))
                    (0, invariant_ts_1.invariant)(false);
                knownNames = prevKnownNames;
            },
        },
        ObjectField(node) {
            const fieldName = node.name.value;
            const knownName = knownNames.get(fieldName);
            if (knownName != null) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`There can be only one input field named "${fieldName}".`, { nodes: [knownName, node.name] }));
            }
            else {
                knownNames.set(fieldName, node.name);
            }
        },
    };
}
//# sourceMappingURL=UniqueInputFieldNamesRule.js.map
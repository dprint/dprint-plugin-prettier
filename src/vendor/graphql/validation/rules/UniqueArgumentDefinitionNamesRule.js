"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UniqueArgumentDefinitionNamesRule = UniqueArgumentDefinitionNamesRule;
const groupBy_ts_1 = require("../../jsutils/groupBy.js");
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
function UniqueArgumentDefinitionNamesRule(context) {
    return {
        DirectiveDefinition(directiveNode) {
            const argumentNodes = directiveNode.arguments ?? [];
            return checkArgUniqueness(`@${directiveNode.name.value}`, argumentNodes);
        },
        InterfaceTypeDefinition: checkArgUniquenessPerField,
        InterfaceTypeExtension: checkArgUniquenessPerField,
        ObjectTypeDefinition: checkArgUniquenessPerField,
        ObjectTypeExtension: checkArgUniquenessPerField,
    };
    function checkArgUniquenessPerField(typeNode) {
        const typeName = typeNode.name.value;
        const fieldNodes = typeNode.fields ?? [];
        for (const fieldDef of fieldNodes) {
            const fieldName = fieldDef.name.value;
            const argumentNodes = fieldDef.arguments ?? [];
            checkArgUniqueness(`${typeName}.${fieldName}`, argumentNodes);
        }
        return false;
    }
    function checkArgUniqueness(parentName, argumentNodes) {
        const seenArgs = (0, groupBy_ts_1.groupBy)(argumentNodes, (arg) => arg.name.value);
        for (const [argName, argNodes] of seenArgs) {
            if (argNodes.length > 1) {
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Argument "${parentName}(${argName}:)" can only be defined once.`, { nodes: argNodes.map((node) => node.name) }));
            }
        }
        return false;
    }
}
//# sourceMappingURL=UniqueArgumentDefinitionNamesRule.js.map
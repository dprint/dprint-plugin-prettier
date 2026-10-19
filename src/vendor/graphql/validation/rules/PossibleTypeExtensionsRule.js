"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PossibleTypeExtensionsRule = PossibleTypeExtensionsRule;
const didYouMean_ts_1 = require("../../jsutils/didYouMean.js");
const inspect_ts_1 = require("../../jsutils/inspect.js");
const invariant_ts_1 = require("../../jsutils/invariant.js");
const suggestionList_ts_1 = require("../../jsutils/suggestionList.js");
const GraphQLError_ts_1 = require("../../error/GraphQLError.js");
const kinds_ts_1 = require("../../language/kinds.js");
const predicates_ts_1 = require("../../language/predicates.js");
const definition_ts_1 = require("../../type/definition.js");
function PossibleTypeExtensionsRule(context) {
    const schema = context.getSchema();
    const definedTypes = new Map();
    for (const def of context.getDocument().definitions) {
        if ((0, predicates_ts_1.isTypeDefinitionNode)(def)) {
            definedTypes.set(def.name.value, def);
        }
    }
    return {
        ScalarTypeExtension: checkExtension,
        ObjectTypeExtension: checkExtension,
        InterfaceTypeExtension: checkExtension,
        UnionTypeExtension: checkExtension,
        EnumTypeExtension: checkExtension,
        InputObjectTypeExtension: checkExtension,
    };
    function checkExtension(node) {
        const typeName = node.name.value;
        const defNode = definedTypes.get(typeName);
        const existingType = schema?.getType(typeName);
        let expectedKind;
        if (defNode != null) {
            expectedKind = defKindToExtKind[defNode.kind];
        }
        else if (existingType) {
            expectedKind = typeToExtKind(existingType);
        }
        if (expectedKind != null) {
            if (expectedKind !== node.kind) {
                const kindStr = extensionKindToTypeName(node.kind);
                context.reportError(new GraphQLError_ts_1.GraphQLError(`Cannot extend non-${kindStr} type "${typeName}".`, {
                    nodes: defNode ? [defNode, node] : node,
                }));
            }
        }
        else {
            const allTypeNames = [
                ...definedTypes.keys(),
                ...Object.keys(schema?.getTypeMap() ?? {}),
            ];
            context.reportError(new GraphQLError_ts_1.GraphQLError(`Cannot extend type "${typeName}" because it is not defined.` +
                (0, didYouMean_ts_1.didYouMean)((0, suggestionList_ts_1.suggestionList)(typeName, allTypeNames)), { nodes: node.name }));
        }
    }
}
const defKindToExtKind = {
    [kinds_ts_1.Kind.SCALAR_TYPE_DEFINITION]: kinds_ts_1.Kind.SCALAR_TYPE_EXTENSION,
    [kinds_ts_1.Kind.OBJECT_TYPE_DEFINITION]: kinds_ts_1.Kind.OBJECT_TYPE_EXTENSION,
    [kinds_ts_1.Kind.INTERFACE_TYPE_DEFINITION]: kinds_ts_1.Kind.INTERFACE_TYPE_EXTENSION,
    [kinds_ts_1.Kind.UNION_TYPE_DEFINITION]: kinds_ts_1.Kind.UNION_TYPE_EXTENSION,
    [kinds_ts_1.Kind.ENUM_TYPE_DEFINITION]: kinds_ts_1.Kind.ENUM_TYPE_EXTENSION,
    [kinds_ts_1.Kind.INPUT_OBJECT_TYPE_DEFINITION]: kinds_ts_1.Kind.INPUT_OBJECT_TYPE_EXTENSION,
};
function typeToExtKind(type) {
    if ((0, definition_ts_1.isScalarType)(type)) {
        return kinds_ts_1.Kind.SCALAR_TYPE_EXTENSION;
    }
    if ((0, definition_ts_1.isObjectType)(type)) {
        return kinds_ts_1.Kind.OBJECT_TYPE_EXTENSION;
    }
    if ((0, definition_ts_1.isInterfaceType)(type)) {
        return kinds_ts_1.Kind.INTERFACE_TYPE_EXTENSION;
    }
    if ((0, definition_ts_1.isUnionType)(type)) {
        return kinds_ts_1.Kind.UNION_TYPE_EXTENSION;
    }
    if ((0, definition_ts_1.isEnumType)(type)) {
        return kinds_ts_1.Kind.ENUM_TYPE_EXTENSION;
    }
    if ((0, definition_ts_1.isInputObjectType)(type)) {
        return kinds_ts_1.Kind.INPUT_OBJECT_TYPE_EXTENSION;
    }
    (0, invariant_ts_1.invariant)(false, 'Unexpected type: ' + (0, inspect_ts_1.inspect)(type));
}
function extensionKindToTypeName(kind) {
    switch (kind) {
        case kinds_ts_1.Kind.SCALAR_TYPE_EXTENSION:
            return 'scalar';
        case kinds_ts_1.Kind.OBJECT_TYPE_EXTENSION:
            return 'object';
        case kinds_ts_1.Kind.INTERFACE_TYPE_EXTENSION:
            return 'interface';
        case kinds_ts_1.Kind.UNION_TYPE_EXTENSION:
            return 'union';
        case kinds_ts_1.Kind.ENUM_TYPE_EXTENSION:
            return 'enum';
        case kinds_ts_1.Kind.INPUT_OBJECT_TYPE_EXTENSION:
            return 'input object';
        default:
            (0, invariant_ts_1.invariant)(false, 'Unexpected kind: ' + (0, inspect_ts_1.inspect)(kind));
    }
}
//# sourceMappingURL=PossibleTypeExtensionsRule.js.map
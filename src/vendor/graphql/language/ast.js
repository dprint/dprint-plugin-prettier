"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationTypeNode = exports.QueryDocumentKeys = exports.Token = exports.Location = void 0;
exports.isNode = isNode;
class Location {
    constructor(/** @type {Token} */ startToken, /** @type {Token} */ endToken, /** @type {import("./source.mjs").Source} */ source) {
        /** @type {number} */ this.start = startToken.start;
        /** @type {number} */ this.end = endToken.end;
        /** @type {Token} */ this.startToken = startToken;
        /** @type {Token} */ this.endToken = endToken;
        /** @type {import("./source.mjs").Source} */ this.source = source;
    }
    get [Symbol.toStringTag]() {
        return 'Location';
    }
    toJSON() {
        return { start: this.start, end: this.end };
    }
}
exports.Location = Location;
class Token {
    constructor(/** @type {string} */ kind, /** @type {number} */ start, /** @type {number} */ end, /** @type {number} */ line, /** @type {number} */ column, /** @type {string | undefined} */ value) {
        /** @type {string} */ this.kind = kind;
        /** @type {number} */ this.start = start;
        this.end = end;
        /** @type {number} */ this.line = line;
        this.column = column;
        /** @type {string | undefined} */ this.value = value;
        /** @type {Token | null} */ this.prev = null;
        /** @type {Token | null} */ this.next = null;
    }
    get [Symbol.toStringTag]() {
        return 'Token';
    }
    toJSON() {
        return {
            kind: this.kind,
            value: this.value,
            line: this.line,
            column: this.column,
        };
    }
}
exports.Token = Token;
exports.QueryDocumentKeys = {
    Name: [],
    Document: ['definitions'],
    OperationDefinition: [
        'description',
        'name',
        'variableDefinitions',
        'directives',
        'selectionSet',
    ],
    VariableDefinition: [
        'description',
        'variable',
        'type',
        'defaultValue',
        'directives',
    ],
    Variable: ['name'],
    SelectionSet: ['selections'],
    Field: ['alias', 'name', 'arguments', 'directives', 'selectionSet'],
    Argument: ['name', 'value'],
    FragmentArgument: ['name', 'value'],
    FragmentSpread: [
        'name',
        'arguments',
        'directives',
    ],
    InlineFragment: ['typeCondition', 'directives', 'selectionSet'],
    FragmentDefinition: [
        'description',
        'name',
        'variableDefinitions',
        'typeCondition',
        'directives',
        'selectionSet',
    ],
    IntValue: [],
    FloatValue: [],
    StringValue: [],
    BooleanValue: [],
    NullValue: [],
    EnumValue: [],
    ListValue: ['values'],
    ObjectValue: ['fields'],
    ObjectField: ['name', 'value'],
    Directive: ['name', 'arguments'],
    NamedType: ['name'],
    ListType: ['type'],
    NonNullType: ['type'],
    SchemaDefinition: ['description', 'directives', 'operationTypes'],
    OperationTypeDefinition: ['type'],
    ScalarTypeDefinition: ['description', 'name', 'directives'],
    ObjectTypeDefinition: [
        'description',
        'name',
        'interfaces',
        'directives',
        'fields',
    ],
    FieldDefinition: ['description', 'name', 'arguments', 'type', 'directives'],
    InputValueDefinition: [
        'description',
        'name',
        'type',
        'defaultValue',
        'directives',
    ],
    InterfaceTypeDefinition: [
        'description',
        'name',
        'interfaces',
        'directives',
        'fields',
    ],
    UnionTypeDefinition: ['description', 'name', 'directives', 'types'],
    EnumTypeDefinition: ['description', 'name', 'directives', 'values'],
    EnumValueDefinition: ['description', 'name', 'directives'],
    InputObjectTypeDefinition: ['description', 'name', 'directives', 'fields'],
    DirectiveDefinition: [
        'description',
        'name',
        'arguments',
        'directives',
        'locations',
    ],
    SchemaExtension: ['directives', 'operationTypes'],
    DirectiveExtension: ['name', 'directives'],
    ScalarTypeExtension: ['name', 'directives'],
    ObjectTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
    InterfaceTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
    UnionTypeExtension: ['name', 'directives', 'types'],
    EnumTypeExtension: ['name', 'directives', 'values'],
    InputObjectTypeExtension: ['name', 'directives', 'fields'],
    TypeCoordinate: ['name'],
    MemberCoordinate: ['name', 'memberName'],
    ArgumentCoordinate: ['name', 'fieldName', 'argumentName'],
    DirectiveCoordinate: ['name'],
    DirectiveArgumentCoordinate: ['name', 'argumentName'],
};
const kindValues = new Set(Object.keys(exports.QueryDocumentKeys));
function isNode(maybeNode) {
    const maybeKind = maybeNode?.kind;
    return typeof maybeKind === 'string' && kindValues.has(maybeKind);
}
exports.OperationTypeNode = {
    QUERY: 'query',
    MUTATION: 'mutation',
    SUBSCRIPTION: 'subscription',
};
//# sourceMappingURL=ast.js.map
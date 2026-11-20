"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildClientSchema = buildClientSchema;
const devAssert_ts_1 = require("../jsutils/devAssert.js");
const inspect_ts_1 = require("../jsutils/inspect.js");
const isObjectLike_ts_1 = require("../jsutils/isObjectLike.js");
const keyValMap_ts_1 = require("../jsutils/keyValMap.js");
const parser_ts_1 = require("../language/parser.js");
const definition_ts_1 = require("../type/definition.js");
const directives_ts_1 = require("../type/directives.js");
const introspection_ts_1 = require("../type/introspection.js");
const scalars_ts_1 = require("../type/scalars.js");
const schema_ts_1 = require("../type/schema.js");
function buildClientSchema(introspection, options) {
    if (!((0, isObjectLike_ts_1.isObjectLike)(introspection) && (0, isObjectLike_ts_1.isObjectLike)(introspection.__schema)))
        (0, devAssert_ts_1.devAssert)(false, `Invalid or incomplete introspection result. Ensure that you are passing "data" property of introspection response and no "errors" was returned alongside: ${(0, inspect_ts_1.inspect)(introspection)}.`);
    const schemaIntrospection = introspection.__schema;
    const typeMap = new Map(schemaIntrospection.types.map((typeIntrospection) => [
        typeIntrospection.name,
        buildType(typeIntrospection),
    ]));
    for (const stdType of [...scalars_ts_1.specifiedScalarTypes, ...introspection_ts_1.introspectionTypes]) {
        if (typeMap.has(stdType.name)) {
            typeMap.set(stdType.name, stdType);
        }
    }
    const queryType = schemaIntrospection.queryType != null
        ? getObjectType(schemaIntrospection.queryType)
        : null;
    const mutationType = schemaIntrospection.mutationType != null
        ? getObjectType(schemaIntrospection.mutationType)
        : null;
    const subscriptionType = schemaIntrospection.subscriptionType != null
        ? getObjectType(schemaIntrospection.subscriptionType)
        : null;
    const directives = schemaIntrospection.directives != null
        ? schemaIntrospection.directives.map(buildDirective)
        : [];
    return new schema_ts_1.GraphQLSchema({
        description: schemaIntrospection.description,
        query: queryType,
        mutation: mutationType,
        subscription: subscriptionType,
        types: [...typeMap.values()],
        directives,
        assumeValid: options?.assumeValid,
    });
    function getType(typeRef) {
        if (typeRef.kind === introspection_ts_1.TypeKind.LIST) {
            const itemRef = typeRef.ofType;
            if (itemRef == null) {
                throw new Error('Decorated type deeper than introspection query.');
            }
            return new definition_ts_1.GraphQLList(getType(itemRef));
        }
        if (typeRef.kind === introspection_ts_1.TypeKind.NON_NULL) {
            const nullableRef = typeRef.ofType;
            if (nullableRef == null) {
                throw new Error('Decorated type deeper than introspection query.');
            }
            const nullableType = getType(nullableRef);
            return new definition_ts_1.GraphQLNonNull((0, definition_ts_1.assertNullableType)(nullableType));
        }
        return getNamedType(typeRef);
    }
    function getNamedType(typeRef) {
        const typeName = typeRef.name;
        if (!typeName) {
            throw new Error(`Unknown type reference: ${(0, inspect_ts_1.inspect)(typeRef)}.`);
        }
        const type = typeMap.get(typeName);
        if (type == null) {
            throw new Error(`Invalid or incomplete schema, unknown type: ${typeName}. Ensure that a full introspection query is used in order to build a client schema.`);
        }
        return type;
    }
    function getObjectType(typeRef) {
        return (0, definition_ts_1.assertObjectType)(getNamedType(typeRef));
    }
    function getInterfaceType(typeRef) {
        return (0, definition_ts_1.assertInterfaceType)(getNamedType(typeRef));
    }
    function buildType(type) {
        switch (type.kind) {
            case introspection_ts_1.TypeKind.SCALAR:
                return buildScalarDef(type);
            case introspection_ts_1.TypeKind.OBJECT:
                return buildObjectDef(type);
            case introspection_ts_1.TypeKind.INTERFACE:
                return buildInterfaceDef(type);
            case introspection_ts_1.TypeKind.UNION:
                return buildUnionDef(type);
            case introspection_ts_1.TypeKind.ENUM:
                return buildEnumDef(type);
            case introspection_ts_1.TypeKind.INPUT_OBJECT:
                return buildInputObjectDef(type);
            default:
                throw new Error(`Invalid or incomplete introspection result. Ensure that a full introspection query is used in order to build a client schema: ${(0, inspect_ts_1.inspect)(type)}.`);
        }
    }
    function buildScalarDef(scalarIntrospection) {
        return new definition_ts_1.GraphQLScalarType({
            name: scalarIntrospection.name,
            description: scalarIntrospection.description,
            specifiedByURL: scalarIntrospection.specifiedByURL,
        });
    }
    function buildImplementationsList(implementingIntrospection) {
        if (implementingIntrospection.interfaces === null &&
            implementingIntrospection.kind === introspection_ts_1.TypeKind.INTERFACE) {
            return [];
        }
        if (implementingIntrospection.interfaces == null) {
            const implementingIntrospectionStr = (0, inspect_ts_1.inspect)(implementingIntrospection);
            throw new Error(`Introspection result missing interfaces: ${implementingIntrospectionStr}.`);
        }
        return implementingIntrospection.interfaces.map(getInterfaceType);
    }
    function buildObjectDef(objectIntrospection) {
        return new definition_ts_1.GraphQLObjectType({
            name: objectIntrospection.name,
            description: objectIntrospection.description,
            interfaces: () => buildImplementationsList(objectIntrospection),
            fields: () => buildFieldDefMap(objectIntrospection),
        });
    }
    function buildInterfaceDef(interfaceIntrospection) {
        return new definition_ts_1.GraphQLInterfaceType({
            name: interfaceIntrospection.name,
            description: interfaceIntrospection.description,
            interfaces: () => buildImplementationsList(interfaceIntrospection),
            fields: () => buildFieldDefMap(interfaceIntrospection),
        });
    }
    function buildUnionDef(unionIntrospection) {
        if (unionIntrospection.possibleTypes == null) {
            const unionIntrospectionStr = (0, inspect_ts_1.inspect)(unionIntrospection);
            throw new Error(`Introspection result missing possibleTypes: ${unionIntrospectionStr}.`);
        }
        return new definition_ts_1.GraphQLUnionType({
            name: unionIntrospection.name,
            description: unionIntrospection.description,
            types: () => unionIntrospection.possibleTypes.map(getObjectType),
        });
    }
    function buildEnumDef(enumIntrospection) {
        if (enumIntrospection.enumValues == null) {
            const enumIntrospectionStr = (0, inspect_ts_1.inspect)(enumIntrospection);
            throw new Error(`Introspection result missing enumValues: ${enumIntrospectionStr}.`);
        }
        return new definition_ts_1.GraphQLEnumType({
            name: enumIntrospection.name,
            description: enumIntrospection.description,
            values: (0, keyValMap_ts_1.keyValMap)(enumIntrospection.enumValues, (valueIntrospection) => valueIntrospection.name, (valueIntrospection) => ({
                description: valueIntrospection.description,
                deprecationReason: valueIntrospection.deprecationReason,
            })),
        });
    }
    function buildInputObjectDef(inputObjectIntrospection) {
        if (inputObjectIntrospection.inputFields == null) {
            const inputObjectIntrospectionStr = (0, inspect_ts_1.inspect)(inputObjectIntrospection);
            throw new Error(`Introspection result missing inputFields: ${inputObjectIntrospectionStr}.`);
        }
        return new definition_ts_1.GraphQLInputObjectType({
            name: inputObjectIntrospection.name,
            description: inputObjectIntrospection.description,
            fields: () => buildInputValueDefMap(inputObjectIntrospection.inputFields),
            isOneOf: inputObjectIntrospection.isOneOf,
        });
    }
    function buildFieldDefMap(typeIntrospection) {
        if (typeIntrospection.fields == null) {
            throw new Error(`Introspection result missing fields: ${(0, inspect_ts_1.inspect)(typeIntrospection)}.`);
        }
        return (0, keyValMap_ts_1.keyValMap)(typeIntrospection.fields, (fieldIntrospection) => fieldIntrospection.name, buildField);
    }
    function buildField(fieldIntrospection) {
        const type = getType(fieldIntrospection.type);
        if (!(0, definition_ts_1.isOutputType)(type)) {
            const typeStr = (0, inspect_ts_1.inspect)(type);
            throw new Error(`Introspection must provide output type for fields, but received: ${typeStr}.`);
        }
        if (fieldIntrospection.args == null) {
            const fieldIntrospectionStr = (0, inspect_ts_1.inspect)(fieldIntrospection);
            throw new Error(`Introspection result missing field args: ${fieldIntrospectionStr}.`);
        }
        return {
            description: fieldIntrospection.description,
            deprecationReason: fieldIntrospection.deprecationReason,
            type,
            args: buildInputValueDefMap(fieldIntrospection.args),
        };
    }
    function buildInputValueDefMap(inputValueIntrospections) {
        return (0, keyValMap_ts_1.keyValMap)(inputValueIntrospections, (inputValue) => inputValue.name, buildInputValue);
    }
    function buildInputValue(inputValueIntrospection) {
        const type = getType(inputValueIntrospection.type);
        if (!(0, definition_ts_1.isInputType)(type)) {
            const typeStr = (0, inspect_ts_1.inspect)(type);
            throw new Error(`Introspection must provide input type for arguments, but received: ${typeStr}.`);
        }
        return {
            description: inputValueIntrospection.description,
            type,
            default: inputValueIntrospection.defaultValue != null
                ? { literal: (0, parser_ts_1.parseConstValue)(inputValueIntrospection.defaultValue) }
                : undefined,
            deprecationReason: inputValueIntrospection.deprecationReason,
        };
    }
    function buildDirective(directiveIntrospection) {
        if (directiveIntrospection.args == null) {
            const directiveIntrospectionStr = (0, inspect_ts_1.inspect)(directiveIntrospection);
            throw new Error(`Introspection result missing directive args: ${directiveIntrospectionStr}.`);
        }
        if (directiveIntrospection.locations == null) {
            const directiveIntrospectionStr = (0, inspect_ts_1.inspect)(directiveIntrospection);
            throw new Error(`Introspection result missing directive locations: ${directiveIntrospectionStr}.`);
        }
        return new directives_ts_1.GraphQLDirective({
            name: directiveIntrospection.name,
            description: directiveIntrospection.description,
            isRepeatable: directiveIntrospection.isRepeatable,
            deprecationReason: directiveIntrospection.deprecationReason,
            locations: directiveIntrospection.locations.slice(),
            args: buildInputValueDefMap(directiveIntrospection.args),
        });
    }
}
//# sourceMappingURL=buildClientSchema.js.map
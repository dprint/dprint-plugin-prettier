"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GraphQLSchema = void 0;
exports.isSchema = isSchema;
exports.assertSchema = assertSchema;
const inspect_ts_1 = require("../jsutils/inspect.js");
const instanceOf_ts_1 = require("../jsutils/instanceOf.js");
const toObjMap_ts_1 = require("../jsutils/toObjMap.js");
const ast_ts_1 = require("../language/ast.js");
const definition_ts_1 = require("./definition.js");
const directives_ts_1 = require("./directives.js");
const introspection_ts_1 = require("./introspection.js");
function isSchema(schema) {
    return (0, instanceOf_ts_1.instanceOf)(schema, schemaSymbol, GraphQLSchema);
}
function assertSchema(schema) {
    if (!isSchema(schema)) {
        throw new Error(`Expected ${(0, inspect_ts_1.inspect)(schema)} to be a GraphQL schema.`);
    }
    return schema;
}
const schemaSymbol = Symbol('Schema');
class GraphQLSchema {
    constructor(config) {
        this.__kind = schemaSymbol;
        this.assumeValid = config.assumeValid ?? false;
        this.__validationErrors = config.assumeValid === true ? [] : undefined;
        this.description = config.description;
        this.extensions = (0, toObjMap_ts_1.toObjMapWithSymbols)(config.extensions);
        this.astNode = config.astNode;
        this.extensionASTNodes = config.extensionASTNodes ?? [];
        this._queryType = config.query;
        this._mutationType = config.mutation;
        this._subscriptionType = config.subscription;
        this._directives = config.directives ?? directives_ts_1.specifiedDirectives;
        const allReferencedTypes = new Set(config.types);
        if (config.types != null) {
            for (const type of config.types) {
                allReferencedTypes.delete(type);
                collectReferencedTypes(type, allReferencedTypes);
            }
        }
        if (this._queryType != null) {
            collectReferencedTypes(this._queryType, allReferencedTypes);
        }
        if (this._mutationType != null) {
            collectReferencedTypes(this._mutationType, allReferencedTypes);
        }
        if (this._subscriptionType != null) {
            collectReferencedTypes(this._subscriptionType, allReferencedTypes);
        }
        for (const directive of this._directives) {
            if ((0, directives_ts_1.isDirective)(directive)) {
                for (const arg of directive.args) {
                    collectReferencedTypes(arg.type, allReferencedTypes);
                }
            }
        }
        collectReferencedTypes(introspection_ts_1.__Schema, allReferencedTypes);
        this._typeMap = Object.create(null);
        this._subTypeMap = new Map();
        this._implementationsMap = Object.create(null);
        for (const namedType of allReferencedTypes) {
            if (namedType == null) {
                continue;
            }
            const typeName = namedType.name;
            if (this._typeMap[typeName] !== undefined) {
                throw new Error(`Schema must contain uniquely named types but contains multiple types named "${typeName}".`);
            }
            this._typeMap[typeName] = namedType;
            if ((0, definition_ts_1.isInterfaceType)(namedType)) {
                for (const iface of namedType.getInterfaces()) {
                    if ((0, definition_ts_1.isInterfaceType)(iface)) {
                        let implementations = this._implementationsMap[iface.name];
                        implementations ??= this._implementationsMap[iface.name] = {
                            objects: [],
                            interfaces: [],
                        };
                        implementations.interfaces.push(namedType);
                    }
                }
            }
            else if ((0, definition_ts_1.isObjectType)(namedType)) {
                for (const iface of namedType.getInterfaces()) {
                    if ((0, definition_ts_1.isInterfaceType)(iface)) {
                        let implementations = this._implementationsMap[iface.name];
                        implementations ??= this._implementationsMap[iface.name] = {
                            objects: [],
                            interfaces: [],
                        };
                        implementations.objects.push(namedType);
                    }
                }
            }
        }
    }
    get [Symbol.toStringTag]() {
        return 'GraphQLSchema';
    }
    getQueryType() {
        return this._queryType;
    }
    getMutationType() {
        return this._mutationType;
    }
    getSubscriptionType() {
        return this._subscriptionType;
    }
    getRootType(operation) {
        switch (operation) {
            case ast_ts_1.OperationTypeNode.QUERY:
                return this.getQueryType();
            case ast_ts_1.OperationTypeNode.MUTATION:
                return this.getMutationType();
            case ast_ts_1.OperationTypeNode.SUBSCRIPTION:
                return this.getSubscriptionType();
        }
    }
    getTypeMap() {
        return this._typeMap;
    }
    getType(name) {
        return this.getTypeMap()[name];
    }
    getPossibleTypes(abstractType) {
        return (0, definition_ts_1.isUnionType)(abstractType)
            ? abstractType.getTypes()
            : this.getImplementations(abstractType).objects;
    }
    getImplementations(interfaceType) {
        const implementations = this._implementationsMap[interfaceType.name];
        return implementations ?? { objects: [], interfaces: [] };
    }
    isSubType(abstractType, maybeSubType) {
        let set = this._subTypeMap.get(abstractType);
        if (set === undefined) {
            if ((0, definition_ts_1.isUnionType)(abstractType)) {
                set = new Set(abstractType.getTypes());
            }
            else {
                const implementations = this.getImplementations(abstractType);
                set = new Set([
                    ...implementations.objects,
                    ...implementations.interfaces,
                ]);
            }
            this._subTypeMap.set(abstractType, set);
        }
        return set.has(maybeSubType);
    }
    getDirectives() {
        return this._directives;
    }
    getDirective(name) {
        return this.getDirectives().find((directive) => directive.name === name);
    }
    getField(parentType, fieldName) {
        switch (fieldName) {
            case introspection_ts_1.SchemaMetaFieldDef.name:
                return this.getQueryType() === parentType
                    ? introspection_ts_1.SchemaMetaFieldDef
                    : undefined;
            case introspection_ts_1.TypeMetaFieldDef.name:
                return this.getQueryType() === parentType
                    ? introspection_ts_1.TypeMetaFieldDef
                    : undefined;
            case introspection_ts_1.TypeNameMetaFieldDef.name:
                return introspection_ts_1.TypeNameMetaFieldDef;
        }
        if ('getFields' in parentType) {
            return parentType.getFields()[fieldName];
        }
        return undefined;
    }
    toConfig() {
        return {
            description: this.description,
            query: this.getQueryType(),
            mutation: this.getMutationType(),
            subscription: this.getSubscriptionType(),
            types: Object.values(this.getTypeMap()),
            directives: this.getDirectives(),
            extensions: this.extensions,
            astNode: this.astNode,
            extensionASTNodes: this.extensionASTNodes,
            assumeValid: this.assumeValid,
        };
    }
}
exports.GraphQLSchema = GraphQLSchema;
function collectReferencedTypes(type, typeSet) {
    const namedType = (0, definition_ts_1.getNamedType)(type);
    if (!typeSet.has(namedType)) {
        typeSet.add(namedType);
        if ((0, definition_ts_1.isUnionType)(namedType)) {
            for (const memberType of namedType.getTypes()) {
                collectReferencedTypes(memberType, typeSet);
            }
        }
        else if ((0, definition_ts_1.isObjectType)(namedType) || (0, definition_ts_1.isInterfaceType)(namedType)) {
            for (const interfaceType of namedType.getInterfaces()) {
                collectReferencedTypes(interfaceType, typeSet);
            }
            for (const field of Object.values(namedType.getFields())) {
                collectReferencedTypes(field.type, typeSet);
                for (const arg of field.args) {
                    collectReferencedTypes(arg.type, typeSet);
                }
            }
        }
        else if ((0, definition_ts_1.isInputObjectType)(namedType)) {
            for (const field of Object.values(namedType.getFields())) {
                collectReferencedTypes(field.type, typeSet);
            }
        }
    }
    return typeSet;
}
//# sourceMappingURL=schema.js.map
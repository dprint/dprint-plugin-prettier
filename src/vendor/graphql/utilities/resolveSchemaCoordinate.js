"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSchemaCoordinate = resolveSchemaCoordinate;
exports.resolveASTSchemaCoordinate = resolveASTSchemaCoordinate;
const inspect_ts_1 = require("../jsutils/inspect.js");
const kinds_ts_1 = require("../language/kinds.js");
const parser_ts_1 = require("../language/parser.js");
const definition_ts_1 = require("../type/definition.js");
function resolveSchemaCoordinate(schema, schemaCoordinate) {
    return resolveASTSchemaCoordinate(schema, (0, parser_ts_1.parseSchemaCoordinate)(schemaCoordinate));
}
function resolveTypeCoordinate(schema, schemaCoordinate) {
    const typeName = schemaCoordinate.name.value;
    const type = schema.getType(typeName);
    if (type == null) {
        return;
    }
    return { kind: 'NamedType', type };
}
function resolveMemberCoordinate(schema, schemaCoordinate) {
    const typeName = schemaCoordinate.name.value;
    const type = schema.getType(typeName);
    if (!type) {
        throw new Error(`Expected ${(0, inspect_ts_1.inspect)(typeName)} to be defined as a type in the schema.`);
    }
    if (!(0, definition_ts_1.isEnumType)(type) &&
        !(0, definition_ts_1.isInputObjectType)(type) &&
        !(0, definition_ts_1.isObjectType)(type) &&
        !(0, definition_ts_1.isInterfaceType)(type)) {
        throw new Error(`Expected ${(0, inspect_ts_1.inspect)(typeName)} to be an Enum, Input Object, Object or Interface type.`);
    }
    if ((0, definition_ts_1.isEnumType)(type)) {
        const enumValueName = schemaCoordinate.memberName.value;
        const enumValue = type.getValue(enumValueName);
        if (enumValue == null) {
            return;
        }
        return { kind: 'EnumValue', type, enumValue };
    }
    if ((0, definition_ts_1.isInputObjectType)(type)) {
        const inputFieldName = schemaCoordinate.memberName.value;
        const inputField = type.getFields()[inputFieldName];
        if (inputField == null) {
            return;
        }
        return { kind: 'InputField', type, inputField };
    }
    const fieldName = schemaCoordinate.memberName.value;
    const field = schema.getField(type, fieldName);
    if (field == null) {
        return;
    }
    return { kind: 'Field', type, field };
}
function resolveArgumentCoordinate(schema, schemaCoordinate) {
    const typeName = schemaCoordinate.name.value;
    const type = schema.getType(typeName);
    if (type == null) {
        throw new Error(`Expected ${(0, inspect_ts_1.inspect)(typeName)} to be defined as a type in the schema.`);
    }
    if (!(0, definition_ts_1.isObjectType)(type) && !(0, definition_ts_1.isInterfaceType)(type)) {
        throw new Error(`Expected ${(0, inspect_ts_1.inspect)(typeName)} to be an object type or interface type.`);
    }
    const fieldName = schemaCoordinate.fieldName.value;
    const field = schema.getField(type, fieldName);
    if (field == null) {
        throw new Error(`Expected ${(0, inspect_ts_1.inspect)(fieldName)} to exist as a field of type ${(0, inspect_ts_1.inspect)(typeName)} in the schema.`);
    }
    const fieldArgumentName = schemaCoordinate.argumentName.value;
    const fieldArgument = field.args.find((arg) => arg.name === fieldArgumentName);
    if (fieldArgument == null) {
        return;
    }
    return { kind: 'FieldArgument', type, field, fieldArgument };
}
function resolveDirectiveCoordinate(schema, schemaCoordinate) {
    const directiveName = schemaCoordinate.name.value;
    const directive = schema.getDirective(directiveName);
    if (!directive) {
        return;
    }
    return { kind: 'Directive', directive };
}
function resolveDirectiveArgumentCoordinate(schema, schemaCoordinate) {
    const directiveName = schemaCoordinate.name.value;
    const directive = schema.getDirective(directiveName);
    if (!directive) {
        throw new Error(`Expected ${(0, inspect_ts_1.inspect)(directiveName)} to be defined as a directive in the schema.`);
    }
    const { argumentName: { value: directiveArgumentName }, } = schemaCoordinate;
    const directiveArgument = directive.args.find((arg) => arg.name === directiveArgumentName);
    if (!directiveArgument) {
        return;
    }
    return { kind: 'DirectiveArgument', directive, directiveArgument };
}
function resolveASTSchemaCoordinate(schema, schemaCoordinate) {
    switch (schemaCoordinate.kind) {
        case kinds_ts_1.Kind.TYPE_COORDINATE:
            return resolveTypeCoordinate(schema, schemaCoordinate);
        case kinds_ts_1.Kind.MEMBER_COORDINATE:
            return resolveMemberCoordinate(schema, schemaCoordinate);
        case kinds_ts_1.Kind.ARGUMENT_COORDINATE:
            return resolveArgumentCoordinate(schema, schemaCoordinate);
        case kinds_ts_1.Kind.DIRECTIVE_COORDINATE:
            return resolveDirectiveCoordinate(schema, schemaCoordinate);
        case kinds_ts_1.Kind.DIRECTIVE_ARGUMENT_COORDINATE:
            return resolveDirectiveArgumentCoordinate(schema, schemaCoordinate);
    }
}
//# sourceMappingURL=resolveSchemaCoordinate.js.map
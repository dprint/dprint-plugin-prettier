"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printSchema = printSchema;
exports.printIntrospectionSchema = printIntrospectionSchema;
exports.printType = printType;
exports.printDirective = printDirective;
const inspect_ts_1 = require("../jsutils/inspect.js");
const invariant_ts_1 = require("../jsutils/invariant.js");
const blockString_ts_1 = require("../language/blockString.js");
const kinds_ts_1 = require("../language/kinds.js");
const printer_ts_1 = require("../language/printer.js");
const definition_ts_1 = require("../type/definition.js");
const directives_ts_1 = require("../type/directives.js");
const introspection_ts_1 = require("../type/introspection.js");
const scalars_ts_1 = require("../type/scalars.js");
const getDefaultValueAST_ts_1 = require("./getDefaultValueAST.js");
function printSchema(schema) {
    return printFilteredSchema(schema, (n) => !(0, directives_ts_1.isSpecifiedDirective)(n), isDefinedType);
}
function printIntrospectionSchema(schema) {
    return printFilteredSchema(schema, directives_ts_1.isSpecifiedDirective, introspection_ts_1.isIntrospectionType);
}
function isDefinedType(type) {
    return !(0, scalars_ts_1.isSpecifiedScalarType)(type) && !(0, introspection_ts_1.isIntrospectionType)(type);
}
function printFilteredSchema(schema, directiveFilter, typeFilter) {
    const directives = schema.getDirectives().filter(directiveFilter);
    const types = Object.values(schema.getTypeMap()).filter(typeFilter);
    return [
        printSchemaDefinition(schema),
        ...directives.map((directive) => printDirective(directive)),
        ...types.map((type) => printType(type)),
    ]
        .filter(Boolean)
        .join('\n\n');
}
function printSchemaDefinition(schema) {
    const queryType = schema.getQueryType();
    const mutationType = schema.getMutationType();
    const subscriptionType = schema.getSubscriptionType();
    if (!queryType && !mutationType && !subscriptionType) {
        return;
    }
    if (schema.description != null || !hasDefaultRootOperationTypes(schema)) {
        return (printDescription(schema) +
            'schema {\n' +
            (queryType ? `  query: ${queryType}\n` : '') +
            (mutationType ? `  mutation: ${mutationType}\n` : '') +
            (subscriptionType ? `  subscription: ${subscriptionType}\n` : '') +
            '}');
    }
}
function hasDefaultRootOperationTypes(schema) {
    return (schema.getQueryType() == schema.getType('Query') &&
        schema.getMutationType() == schema.getType('Mutation') &&
        schema.getSubscriptionType() == schema.getType('Subscription'));
}
function printType(type) {
    if ((0, definition_ts_1.isScalarType)(type)) {
        return printScalar(type);
    }
    if ((0, definition_ts_1.isObjectType)(type)) {
        return printObject(type);
    }
    if ((0, definition_ts_1.isInterfaceType)(type)) {
        return printInterface(type);
    }
    if ((0, definition_ts_1.isUnionType)(type)) {
        return printUnion(type);
    }
    if ((0, definition_ts_1.isEnumType)(type)) {
        return printEnum(type);
    }
    if ((0, definition_ts_1.isInputObjectType)(type)) {
        return printInputObject(type);
    }
    (0, invariant_ts_1.invariant)(false, 'Unexpected type: ' + (0, inspect_ts_1.inspect)(type));
}
function printScalar(type) {
    return printDescription(type) + `scalar ${type}` + printSpecifiedByURL(type);
}
function printImplementedInterfaces(type) {
    const interfaces = type.getInterfaces();
    return interfaces.length
        ? ' implements ' + interfaces.map((i) => i.name).join(' & ')
        : '';
}
function printObject(type) {
    return (printDescription(type) +
        `type ${type}` +
        printImplementedInterfaces(type) +
        printFields(type));
}
function printInterface(type) {
    return (printDescription(type) +
        `interface ${type}` +
        printImplementedInterfaces(type) +
        printFields(type));
}
function printUnion(type) {
    const types = type.getTypes();
    const possibleTypes = types.length ? ' = ' + types.join(' | ') : '';
    return printDescription(type) + `union ${type.name}` + possibleTypes;
}
function printEnum(type) {
    const values = type
        .getValues()
        .map((value, i) => printDescription(value, '  ', !i) +
        '  ' +
        value.name +
        printDeprecated(value.deprecationReason));
    return printDescription(type) + `enum ${type}` + printBlock(values);
}
function printInputObject(type) {
    const fields = Object.values(type.getFields()).map((f, i) => printDescription(f, '  ', !i) + '  ' + printInputValue(f));
    return (printDescription(type) +
        `input ${type}` +
        (type.isOneOf ? ' @oneOf' : '') +
        printBlock(fields));
}
function printFields(type) {
    const fields = Object.values(type.getFields()).map((f, i) => printDescription(f, '  ', !i) +
        '  ' +
        f.name +
        printArgs(f.args, '  ') +
        ': ' +
        String(f.type) +
        printDeprecated(f.deprecationReason));
    return printBlock(fields);
}
function printBlock(items) {
    return items.length !== 0 ? ' {\n' + items.join('\n') + '\n}' : '';
}
function printArgs(args, indentation = '') {
    if (args.length === 0) {
        return '';
    }
    if (args.every((arg) => arg.description == null)) {
        return '(' + args.map(printInputValue).join(', ') + ')';
    }
    return ('(\n' +
        args
            .map((arg, i) => printDescription(arg, '  ' + indentation, !i) +
            '  ' +
            indentation +
            printInputValue(arg))
            .join('\n') +
        '\n' +
        indentation +
        ')');
}
function printInputValue(argOrInputField) {
    let argDecl = argOrInputField.name + ': ' + String(argOrInputField.type);
    const defaultValueAST = (0, getDefaultValueAST_ts_1.getDefaultValueAST)(argOrInputField);
    if (defaultValueAST) {
        argDecl += ` = ${(0, printer_ts_1.print)(defaultValueAST)}`;
    }
    return argDecl + printDeprecated(argOrInputField.deprecationReason);
}
function printDirective(directive) {
    return (printDescription(directive) +
        `directive ${directive}` +
        printArgs(directive.args) +
        printDeprecated(directive.deprecationReason) +
        (directive.isRepeatable ? ' repeatable' : '') +
        ' on ' +
        directive.locations.join(' | '));
}
function printDeprecated(reason) {
    if (reason == null) {
        return '';
    }
    if (reason !== directives_ts_1.DEFAULT_DEPRECATION_REASON) {
        const astValue = (0, printer_ts_1.print)({ kind: kinds_ts_1.Kind.STRING, value: reason });
        return ` @deprecated(reason: ${astValue})`;
    }
    return ' @deprecated';
}
function printSpecifiedByURL(scalar) {
    if (scalar.specifiedByURL == null) {
        return '';
    }
    const astValue = (0, printer_ts_1.print)({
        kind: kinds_ts_1.Kind.STRING,
        value: scalar.specifiedByURL,
    });
    return ` @specifiedBy(url: ${astValue})`;
}
function printDescription(def, indentation = '', firstInBlock = true) {
    const { description } = def;
    if (description == null) {
        return '';
    }
    const blockString = (0, printer_ts_1.print)({
        kind: kinds_ts_1.Kind.STRING,
        value: description,
        block: (0, blockString_ts_1.isPrintableAsBlockString)(description),
    });
    const prefix = indentation && !firstInBlock ? '\n' + indentation : indentation;
    return prefix + blockString.replaceAll('\n', '\n' + indentation) + '\n';
}
//# sourceMappingURL=printSchema.js.map
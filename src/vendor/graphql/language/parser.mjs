// @nts-check
import { syntaxError } from "../error/syntaxError.mjs";
import { parseChannel, shouldTrace } from "../diagnostics.mjs";
import { Location, OperationTypeNode } from "./ast.mjs";
import { DirectiveLocation } from "./directiveLocation.mjs";
import { Kind } from "./kinds.mjs";
import { isPunctuatorTokenKind, Lexer } from "./lexer.mjs";
import { SchemaCoordinateLexer } from "./schemaCoordinateLexer.mjs";
import { isSource, Source } from "./source.mjs";
import { TokenKind } from "./tokenKind.mjs";
/** @returns {import("graphql-ast-types").GraphqlAstNode} */ export function parse(/** @type {string | undefined} */ source, /** @type {import("graphql-ast-types").GraphqlParseOptions | undefined} */ options) {
    return shouldTrace(parseChannel)
        ? parseChannel.traceSync(() => parseImpl(source, options), { source })
        : parseImpl(source, options);
}
function parseImpl(/** @type {string} */ source, /** @type {import("graphql-ast-types").GraphqlParseOptions | undefined} */ options) {
    const parser = new Parser(source, options);
    const document = parser.parseDocument();
    Object.defineProperty(document, 'tokenCount', {
        enumerable: false,
        value: parser.tokenCount,
    });
    return document;
}
/** @returns {import("graphql-ast-types").GraphqlAstNode} */ export function parseValue(source, options) {
    const parser = new Parser(source, options);
    parser.expectToken(TokenKind.SOF);
    const value = parser.parseValueLiteral(false);
    parser.expectToken(TokenKind.EOF);
    return value;
}
/** @returns {import("graphql-ast-types").GraphqlAstNode} */ export function parseConstValue(source, options) {
    const parser = new Parser(source, options);
    parser.expectToken(TokenKind.SOF);
    const value = parser.parseConstValueLiteral();
    parser.expectToken(TokenKind.EOF);
    return value;
}
/** @returns {import("graphql-ast-types").GraphqlAstNode} */ export function parseType(source, options) {
    const parser = new Parser(source, options);
    parser.expectToken(TokenKind.SOF);
    const type = parser.parseTypeReference();
    parser.expectToken(TokenKind.EOF);
    return type;
}
/** @returns {import("graphql-ast-types").GraphqlAstNode} */ export function parseSchemaCoordinate(source) {
    const sourceObj = isSource(source) ? source : new Source(source);
    const lexer = new SchemaCoordinateLexer(sourceObj);
    const parser = new Parser(source, { lexer });
    parser.expectToken(TokenKind.SOF);
    const coordinate = parser.parseSchemaCoordinate();
    parser.expectToken(TokenKind.EOF);
    return coordinate;
}
export class Parser {
    constructor(/** @type {string} */ source, /** @type {import("graphql-ast-types").GraphqlParseOptions} */ options = {}) {
        const { lexer, ..._options } = options;
        if (lexer) {
            this._lexer = lexer;
        }
        else {
            const sourceObj = isSource(source) ? source : new Source(source);
            /** @type {Lexer} */ this._lexer = new Lexer(sourceObj);
        }
        /** @type {import("graphql-ast-types").GraphqlParseOptions} */ this._options = _options;
        /** @type {number} */ this._tokenCounter = 0;
    }
    /** @returns {number} */ get tokenCount() {
        return this._tokenCounter;
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseName() {
        /** @type {import("./ast.mjs").Token} */ const token = this.expectToken(TokenKind.NAME);
        return this.node(token, {
            kind: Kind.NAME,
            value: token.value,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseDocument() {
        return this.node(this._lexer.token, {
            kind: Kind.DOCUMENT,
            definitions: this.many(TokenKind.SOF, this.parseDefinition, TokenKind.EOF),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseDefinition() {
        if (this.peek(TokenKind.BRACE_L)) {
            return this.parseOperationDefinition();
        }
        /** @type {boolean} */ const hasDescription = this.peekDescription();
        /** @type {import("./ast.mjs").Token} */ const keywordToken = hasDescription
            ? this._lexer.lookahead()
            : this._lexer.token;
        if (hasDescription && keywordToken.kind === TokenKind.BRACE_L) {
            throw syntaxError(this._lexer.source, this._lexer.token.start, 'Unexpected description, descriptions are not supported on shorthand queries.');
        }
        if (keywordToken.kind === TokenKind.NAME) {
            switch (keywordToken.value) {
                case 'schema':
                    return this.parseSchemaDefinition();
                case 'scalar':
                    return this.parseScalarTypeDefinition();
                case 'type':
                    return this.parseObjectTypeDefinition();
                case 'interface':
                    return this.parseInterfaceTypeDefinition();
                case 'union':
                    return this.parseUnionTypeDefinition();
                case 'enum':
                    return this.parseEnumTypeDefinition();
                case 'input':
                    return this.parseInputObjectTypeDefinition();
                case 'directive':
                    return this.parseDirectiveDefinition();
            }
            switch (keywordToken.value) {
                case 'query':
                case 'mutation':
                case 'subscription':
                    return this.parseOperationDefinition();
                case 'fragment':
                    return this.parseFragmentDefinition();
            }
            if (hasDescription) {
                throw syntaxError(this._lexer.source, this._lexer.token.start, 'Unexpected description, only GraphQL definitions support descriptions.');
            }
            switch (keywordToken.value) {
                case 'extend':
                    return this.parseTypeSystemExtension();
            }
        }
        throw this.unexpected(keywordToken);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseOperationDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        if (this.peek(TokenKind.BRACE_L)) {
            return this.node(start, {
                kind: Kind.OPERATION_DEFINITION,
                operation: OperationTypeNode.QUERY,
                description: undefined,
                name: undefined,
                variableDefinitions: undefined,
                directives: undefined,
                selectionSet: this.parseSelectionSet(),
            });
        }
        const description = this.parseDescription();
        /** @type {string} */ const operation = this.parseOperationType();
        /** @type {import("graphql-ast-types").GraphqlAstNode | undefined} */ let name;
        if (this.peek(TokenKind.NAME)) {
            name = this.parseName();
        }
        return this.node(start, {
            kind: Kind.OPERATION_DEFINITION,
            operation,
            description,
            name,
            variableDefinitions: this.parseVariableDefinitions(),
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
        });
    }
    /** @returns {string} */ parseOperationType() {
        /** @type {import("./ast.mjs").Token} */ const operationToken = this.expectToken(TokenKind.NAME);
        switch (operationToken.value) {
            case 'query':
                return OperationTypeNode.QUERY;
            case 'mutation':
                return OperationTypeNode.MUTATION;
            case 'subscription':
                return OperationTypeNode.SUBSCRIPTION;
        }
        throw this.unexpected(operationToken);
    }
    /** @returns {any[] | undefined} */ parseVariableDefinitions() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseVariableDefinition, TokenKind.PAREN_R);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseVariableDefinition() {
        return this.node(this._lexer.token, {
            kind: Kind.VARIABLE_DEFINITION,
            description: this.parseDescription(),
            variable: this.parseVariable(),
            type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
            defaultValue: this.expectOptionalToken(TokenKind.EQUALS)
                ? this.parseConstValueLiteral()
                : undefined,
            directives: this.parseConstDirectives(),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseVariable() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectToken(TokenKind.DOLLAR);
        return this.node(start, {
            kind: Kind.VARIABLE,
            name: this.parseName(),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseSelectionSet() {
        return this.node(this._lexer.token, {
            kind: Kind.SELECTION_SET,
            selections: this.many(TokenKind.BRACE_L, this.parseSelection, TokenKind.BRACE_R),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseSelection() {
        return this.peek(TokenKind.SPREAD)
            ? this.parseFragment()
            : this.parseField();
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseField() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const nameOrAlias = this.parseName();
        /** @type {import("graphql-ast-types").GraphqlAstNode | undefined} */ let alias;
        /** @type {import("graphql-ast-types").GraphqlAstNode | undefined} */ let name;
        if (this.expectOptionalToken(TokenKind.COLON)) {
            alias = nameOrAlias;
            name = this.parseName();
        }
        else {
            name = nameOrAlias;
        }
        return this.node(start, {
            kind: Kind.FIELD,
            alias,
            name,
            arguments: this.parseArguments(false),
            directives: this.parseDirectives(false),
            selectionSet: this.peek(TokenKind.BRACE_L)
                ? this.parseSelectionSet()
                : undefined,
        });
    }
    /** @returns {any[] | undefined} */ parseArguments(/** @type {boolean} */ isConst) {
        const item = isConst ? this.parseConstArgument : this.parseArgument;
        return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
    }
    /** @returns {any[] | undefined} */ parseFragmentArguments() {
        const item = this.parseFragmentArgument;
        return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
    }
    parseArgument(isConst = false) {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return this.node(start, {
            kind: Kind.ARGUMENT,
            name,
            value: this.parseValueLiteral(isConst),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseConstArgument() {
        return this.parseArgument(true);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseFragmentArgument() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return this.node(start, {
            kind: Kind.FRAGMENT_ARGUMENT,
            name,
            value: this.parseValueLiteral(false),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseFragment() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectToken(TokenKind.SPREAD);
        /** @type {boolean} */ const hasTypeCondition = this.expectOptionalKeyword('on');
        if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
            const name = this.parseFragmentName();
            if (this.peek(TokenKind.PAREN_L) &&
                this._options.experimentalFragmentArguments) {
                return this.node(start, {
                    kind: Kind.FRAGMENT_SPREAD,
                    name,
                    arguments: this.parseFragmentArguments(),
                    directives: this.parseDirectives(false),
                });
            }
            return this.node(start, {
                kind: Kind.FRAGMENT_SPREAD,
                name,
                directives: this.parseDirectives(false),
            });
        }
        return this.node(start, {
            kind: Kind.INLINE_FRAGMENT,
            typeCondition: hasTypeCondition ? this.parseNamedType() : undefined,
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseFragmentDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('fragment');
        if (this._options.experimentalFragmentArguments === true) {
            return this.node(start, {
                kind: Kind.FRAGMENT_DEFINITION,
                description,
                name: this.parseFragmentName(),
                variableDefinitions: this.parseVariableDefinitions(),
                typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
                directives: this.parseDirectives(false),
                selectionSet: this.parseSelectionSet(),
            });
        }
        return this.node(start, {
            kind: Kind.FRAGMENT_DEFINITION,
            description,
            name: this.parseFragmentName(),
            typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseFragmentName() {
        if (this._lexer.token.value === 'on') {
            throw this.unexpected();
        }
        return this.parseName();
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseValueLiteral(/** @type {boolean} */ isConst) {
        /** @type {import("./ast.mjs").Token} */ const token = this._lexer.token;
        switch (token.kind) {
            case TokenKind.BRACKET_L:
                return this.parseList(isConst);
            case TokenKind.BRACE_L:
                return this.parseObject(isConst);
            case TokenKind.INT:
                this.advanceLexer();
                return this.node(token, {
                    kind: Kind.INT,
                    value: token.value,
                });
            case TokenKind.FLOAT:
                this.advanceLexer();
                return this.node(token, {
                    kind: Kind.FLOAT,
                    value: token.value,
                });
            case TokenKind.STRING:
            case TokenKind.BLOCK_STRING:
                return this.parseStringLiteral();
            case TokenKind.NAME:
                this.advanceLexer();
                switch (token.value) {
                    case 'true':
                        return this.node(token, {
                            kind: Kind.BOOLEAN,
                            value: true,
                        });
                    case 'false':
                        return this.node(token, {
                            kind: Kind.BOOLEAN,
                            value: false,
                        });
                    case 'null':
                        return this.node(token, { kind: Kind.NULL });
                    default:
                        return this.node(token, {
                            kind: Kind.ENUM,
                            value: token.value,
                        });
                }
            case TokenKind.DOLLAR:
                if (isConst) {
                    this.expectToken(TokenKind.DOLLAR);
                    if (this._lexer.token.kind === TokenKind.NAME) {
                        const varName = this._lexer.token.value;
                        throw syntaxError(this._lexer.source, token.start, `Unexpected variable "$${varName}" in constant value.`);
                    }
                    else {
                        throw this.unexpected(token);
                    }
                }
                return this.parseVariable();
            default:
                throw this.unexpected();
        }
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseConstValueLiteral() {
        return this.parseValueLiteral(true);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseStringLiteral() {
        /** @type {import("./ast.mjs").Token} */ const token = this._lexer.token;
        this.advanceLexer();
        return this.node(token, {
            kind: Kind.STRING,
            value: token.value,
            block: token.kind === TokenKind.BLOCK_STRING,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseList(/** @type {boolean} */ isConst) {
        const item = () => this.parseValueLiteral(isConst);
        return this.node(this._lexer.token, {
            kind: Kind.LIST,
            values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseObject(/** @type {boolean} */ isConst) {
        const item = () => this.parseObjectField(isConst);
        return this.node(this._lexer.token, {
            kind: Kind.OBJECT,
            fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseObjectField(/** @type {boolean} */ isConst) {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return this.node(start, {
            kind: Kind.OBJECT_FIELD,
            name,
            value: this.parseValueLiteral(isConst),
        });
    }
    /** @returns {any[] | undefined} */ parseDirectives(/** @type {boolean} */ isConst) {
        const directives = [];
        while (this.peek(TokenKind.AT)) {
            directives.push(this.parseDirective(isConst));
        }
        if (directives.length) {
            return directives;
        }
        return undefined;
    }
    /** @returns {any[] | undefined} */ parseConstDirectives() {
        return this.parseDirectives(true);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseDirective(/** @type {boolean} */ isConst) {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectToken(TokenKind.AT);
        return this.node(start, {
            kind: Kind.DIRECTIVE,
            name: this.parseName(),
            arguments: this.parseArguments(isConst),
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseTypeReference() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        /** @type {import("graphql-ast-types").GraphqlAstNode | undefined} */ let type;
        if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
            const innerType = this.parseTypeReference();
            this.expectToken(TokenKind.BRACKET_R);
            type = this.node(start, {
                kind: Kind.LIST_TYPE,
                type: innerType,
            });
        }
        else {
            type = this.parseNamedType();
        }
        if (this.expectOptionalToken(TokenKind.BANG)) {
            return this.node(start, {
                kind: Kind.NON_NULL_TYPE,
                type,
            });
        }
        return type;
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseNamedType() {
        return this.node(this._lexer.token, {
            kind: Kind.NAMED_TYPE,
            name: this.parseName(),
        });
    }
    /** @returns {boolean} */ peekDescription() {
        return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
    }
    /** @returns {undefined | import("graphql-ast-types").GraphqlAstNode} */ parseDescription() {
        if (this.peekDescription()) {
            return this.parseStringLiteral();
        }
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseSchemaDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('schema');
        const directives = this.parseConstDirectives();
        const operationTypes = this.many(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
        return this.node(start, {
            kind: Kind.SCHEMA_DEFINITION,
            description,
            directives,
            operationTypes,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseOperationTypeDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        /** @type {string} */ const operation = this.parseOperationType();
        this.expectToken(TokenKind.COLON);
        const type = this.parseNamedType();
        return this.node(start, {
            kind: Kind.OPERATION_TYPE_DEFINITION,
            operation,
            type,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseScalarTypeDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('scalar');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        return this.node(start, {
            kind: Kind.SCALAR_TYPE_DEFINITION,
            description,
            name,
            directives,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseObjectTypeDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('type');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseConstDirectives();
        const fields = this.parseFieldsDefinition();
        return this.node(start, {
            kind: Kind.OBJECT_TYPE_DEFINITION,
            description,
            name,
            interfaces,
            directives,
            fields,
        });
    }
    /** @returns {any[] | undefined} */ parseImplementsInterfaces() {
        return this.expectOptionalKeyword('implements')
            ? this.delimitedMany(TokenKind.AMP, this.parseNamedType)
            : undefined;
    }
    /** @returns {any[] | undefined} */ parseFieldsDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseFieldDefinition, TokenKind.BRACE_R);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseFieldDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        const args = this.parseArgumentDefs();
        this.expectToken(TokenKind.COLON);
        const type = this.parseTypeReference();
        const directives = this.parseConstDirectives();
        return this.node(start, {
            kind: Kind.FIELD_DEFINITION,
            description,
            name,
            arguments: args,
            type,
            directives,
        });
    }
    /** @returns {any[] | undefined} */ parseArgumentDefs() {
        return this.optionalMany(TokenKind.PAREN_L, this.parseInputValueDef, TokenKind.PAREN_R);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseInputValueDef() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        const type = this.parseTypeReference();
        /** @type {import("graphql-ast-types").GraphqlAstNode | undefined} */ let defaultValue;
        if (this.expectOptionalToken(TokenKind.EQUALS)) {
            defaultValue = this.parseConstValueLiteral();
        }
        const directives = this.parseConstDirectives();
        return this.node(start, {
            kind: Kind.INPUT_VALUE_DEFINITION,
            description,
            name,
            type,
            defaultValue,
            directives,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseInterfaceTypeDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('interface');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseConstDirectives();
        const fields = this.parseFieldsDefinition();
        return this.node(start, {
            kind: Kind.INTERFACE_TYPE_DEFINITION,
            description,
            name,
            interfaces,
            directives,
            fields,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseUnionTypeDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('union');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const types = this.parseUnionMemberTypes();
        return this.node(start, {
            kind: Kind.UNION_TYPE_DEFINITION,
            description,
            name,
            directives,
            types,
        });
    }
    /** @returns {any[] | undefined} */ parseUnionMemberTypes() {
        return this.expectOptionalToken(TokenKind.EQUALS)
            ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType)
            : undefined;
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseEnumTypeDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('enum');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const values = this.parseEnumValuesDefinition();
        return this.node(start, {
            kind: Kind.ENUM_TYPE_DEFINITION,
            description,
            name,
            directives,
            values,
        });
    }
    /** @returns {any[] | undefined} */ parseEnumValuesDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseEnumValueDefinition, TokenKind.BRACE_R);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseEnumValueDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseEnumValueName();
        const directives = this.parseConstDirectives();
        return this.node(start, {
            kind: Kind.ENUM_VALUE_DEFINITION,
            description,
            name,
            directives,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseEnumValueName() {
        if (this._lexer.token.value === 'true' ||
            this._lexer.token.value === 'false' ||
            this._lexer.token.value === 'null') {
            throw syntaxError(this._lexer.source, this._lexer.token.start, `${getTokenDesc(this._lexer.token)} is reserved and cannot be used for an enum value.`);
        }
        return this.parseName();
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseInputObjectTypeDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('input');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const fields = this.parseInputFieldsDefinition();
        return this.node(start, {
            kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
            description,
            name,
            directives,
            fields,
        });
    }
    /** @returns {any[] | undefined} */ parseInputFieldsDefinition() {
        return this.optionalMany(TokenKind.BRACE_L, this.parseInputValueDef, TokenKind.BRACE_R);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseTypeSystemExtension() {
        /** @type {import("./ast.mjs").Token} */ const keywordToken = this._lexer.lookahead();
        if (keywordToken.kind === TokenKind.NAME) {
            switch (keywordToken.value) {
                case 'schema':
                    return this.parseSchemaExtension();
                case 'scalar':
                    return this.parseScalarTypeExtension();
                case 'type':
                    return this.parseObjectTypeExtension();
                case 'interface':
                    return this.parseInterfaceTypeExtension();
                case 'union':
                    return this.parseUnionTypeExtension();
                case 'enum':
                    return this.parseEnumTypeExtension();
                case 'input':
                    return this.parseInputObjectTypeExtension();
                case 'directive':
                    return this.parseDirectiveExtension();
            }
        }
        throw this.unexpected(keywordToken);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseSchemaExtension() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('schema');
        const directives = this.parseConstDirectives();
        const operationTypes = this.optionalMany(TokenKind.BRACE_L, this.parseOperationTypeDefinition, TokenKind.BRACE_R);
        if (directives === undefined && operationTypes === undefined) {
            throw this.unexpected();
        }
        return this.node(start, {
            kind: Kind.SCHEMA_EXTENSION,
            directives,
            operationTypes,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseScalarTypeExtension() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('scalar');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        if (directives === undefined) {
            throw this.unexpected();
        }
        return this.node(start, {
            kind: Kind.SCALAR_TYPE_EXTENSION,
            name,
            directives,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseObjectTypeExtension() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('type');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseConstDirectives();
        const fields = this.parseFieldsDefinition();
        if (interfaces === undefined &&
            directives === undefined &&
            fields === undefined) {
            throw this.unexpected();
        }
        return this.node(start, {
            kind: Kind.OBJECT_TYPE_EXTENSION,
            name,
            interfaces,
            directives,
            fields,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseInterfaceTypeExtension() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('interface');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseConstDirectives();
        const fields = this.parseFieldsDefinition();
        if (interfaces === undefined &&
            directives === undefined &&
            fields === undefined) {
            throw this.unexpected();
        }
        return this.node(start, {
            kind: Kind.INTERFACE_TYPE_EXTENSION,
            name,
            interfaces,
            directives,
            fields,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseUnionTypeExtension() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('union');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const types = this.parseUnionMemberTypes();
        if (directives === undefined && types === undefined) {
            throw this.unexpected();
        }
        return this.node(start, {
            kind: Kind.UNION_TYPE_EXTENSION,
            name,
            directives,
            types,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseEnumTypeExtension() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('enum');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const values = this.parseEnumValuesDefinition();
        if (directives === undefined && values === undefined) {
            throw this.unexpected();
        }
        return this.node(start, {
            kind: Kind.ENUM_TYPE_EXTENSION,
            name,
            directives,
            values,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseInputObjectTypeExtension() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('input');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const fields = this.parseInputFieldsDefinition();
        if (directives === undefined && fields === undefined) {
            throw this.unexpected();
        }
        return this.node(start, {
            kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
            name,
            directives,
            fields,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseDirectiveExtension() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('directive');
        this.expectToken(TokenKind.AT);
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        if (directives === undefined) {
            throw this.unexpected();
        }
        return this.node(start, {
            kind: Kind.DIRECTIVE_EXTENSION,
            name,
            directives,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseDirectiveDefinition() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('directive');
        this.expectToken(TokenKind.AT);
        const name = this.parseName();
        const args = this.parseArgumentDefs();
        const directives = this.parseConstDirectives();
        /** @type {boolean} */ const repeatable = this.expectOptionalKeyword('repeatable');
        this.expectKeyword('on');
        const locations = this.parseDirectiveLocations();
        return this.node(start, {
            kind: Kind.DIRECTIVE_DEFINITION,
            description,
            name,
            arguments: args,
            directives,
            repeatable,
            locations,
        });
    }
    /** @returns {any[]} */ parseDirectiveLocations() {
        return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseDirectiveLocation() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const name = this.parseName();
        if (Object.hasOwn(DirectiveLocation, name.value)) {
            return name;
        }
        throw this.unexpected(start);
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ parseSchemaCoordinate() {
        /** @type {import("./ast.mjs").Token} */ const start = this._lexer.token;
        const ofDirective = this.expectOptionalToken(TokenKind.AT);
        const name = this.parseName();
        /** @type {import("graphql-ast-types").GraphqlAstNode | undefined} */ let memberName;
        if (!ofDirective && this.expectOptionalToken(TokenKind.DOT)) {
            memberName = this.parseName();
        }
        /** @type {import("graphql-ast-types").GraphqlAstNode | undefined} */ let argumentName;
        if ((ofDirective || memberName) &&
            this.expectOptionalToken(TokenKind.PAREN_L)) {
            argumentName = this.parseName();
            this.expectToken(TokenKind.COLON);
            this.expectToken(TokenKind.PAREN_R);
        }
        if (ofDirective) {
            if (argumentName) {
                return this.node(start, {
                    kind: Kind.DIRECTIVE_ARGUMENT_COORDINATE,
                    name,
                    argumentName,
                });
            }
            return this.node(start, {
                kind: Kind.DIRECTIVE_COORDINATE,
                name,
            });
        }
        else if (memberName) {
            if (argumentName) {
                return this.node(start, {
                    kind: Kind.ARGUMENT_COORDINATE,
                    name,
                    fieldName: memberName,
                    argumentName,
                });
            }
            return this.node(start, {
                kind: Kind.MEMBER_COORDINATE,
                name,
                memberName,
            });
        }
        return this.node(start, {
            kind: Kind.TYPE_COORDINATE,
            name,
        });
    }
    /** @returns {import("graphql-ast-types").GraphqlAstNode} */ node(/** @type {import("./ast.mjs").Token | undefined} */ startToken, /** @type {import("graphql-ast-types").GraphqlAstNode} */ node) {
        if (this._options.noLocation !== true) {
            node.loc = new Location(startToken, this._lexer.lastToken, this._lexer.source);
        }
        return node;
    }
    /** @returns {boolean} */ peek(/** @type {string | undefined} */ kind) {
        return this._lexer.token.kind === kind;
    }
    /** @returns {import("./ast.mjs").Token} */ expectToken(/** @type {string} */ kind) {
        /** @type {import("./ast.mjs").Token} */ const token = this._lexer.token;
        if (token.kind === kind) {
            this.advanceLexer();
            return token;
        }
        throw syntaxError(this._lexer.source, token.start, `Expected ${getTokenKindDesc(kind)}, found ${getTokenDesc(token)}.`);
    }
    /** @returns {boolean} */ expectOptionalToken(/** @type {string} */ kind) {
        /** @type {import("./ast.mjs").Token} */ const token = this._lexer.token;
        if (token.kind === kind) {
            this.advanceLexer();
            return true;
        }
        return false;
    }
    expectKeyword(/** @type {string} */ value) {
        /** @type {import("./ast.mjs").Token} */ const token = this._lexer.token;
        if (token.kind === TokenKind.NAME && token.value === value) {
            this.advanceLexer();
        }
        else {
            throw syntaxError(this._lexer.source, token.start, `Expected "${value}", found ${getTokenDesc(token)}.`);
        }
    }
    /** @returns {boolean} */ expectOptionalKeyword(/** @type {string} */ value) {
        /** @type {import("./ast.mjs").Token} */ const token = this._lexer.token;
        if (token.kind === TokenKind.NAME && token.value === value) {
            this.advanceLexer();
            return true;
        }
        return false;
    }
    /** @returns {import("../error/GraphQLError.mjs").GraphQLError} */ unexpected(/** @type {import("./ast.mjs").Token | undefined} */ atToken) {
        const token = atToken ?? this._lexer.token;
        return syntaxError(this._lexer.source, token.start, `Unexpected ${getTokenDesc(token)}.`);
    }
    /** @returns {any[]} */ any(/** @type {string} */ openKind, /** @type {(this: Parser) => any} */ parseFn, /** @type {string} */ closeKind) {
        this.expectToken(openKind);
        const nodes = [];
        while (!this.expectOptionalToken(closeKind)) {
            nodes.push(parseFn.call(this));
        }
        return nodes;
    }
    /** @returns {any[] | undefined} */ optionalMany(/** @type {string} */ openKind, /** @type {(this: Parser) => any} */ parseFn, /** @type {string} */ closeKind) {
        if (this.expectOptionalToken(openKind)) {
            const nodes = [];
            do {
                nodes.push(parseFn.call(this));
            } while (!this.expectOptionalToken(closeKind));
            return nodes;
        }
        return undefined;
    }
    /** @returns {any[]} */ many(/** @type {string} */ openKind, /** @type {(this: Parser) => any} */ parseFn, /** @type {string} */ closeKind) {
        this.expectToken(openKind);
        const nodes = [];
        do {
            nodes.push(parseFn.call(this));
        } while (!this.expectOptionalToken(closeKind));
        return nodes;
    }
    /** @returns {any[]} */ delimitedMany(/** @type {string} */ delimiterKind, /** @type {(this: Parser) => any} */ parseFn) {
        this.expectOptionalToken(delimiterKind);
        const nodes = [];
        do {
            nodes.push(parseFn.call(this));
        } while (this.expectOptionalToken(delimiterKind));
        return nodes;
    }
    advanceLexer() {
        const { maxTokens } = this._options;
        /** @type {import("./ast.mjs").Token} */ const token = this._lexer.advance();
        if (token.kind !== TokenKind.EOF) {
            ++this._tokenCounter;
            if (maxTokens !== undefined && this._tokenCounter > maxTokens) {
                throw syntaxError(this._lexer.source, token.start, `Document contains more than ${maxTokens} tokens. Parsing aborted.`);
            }
        }
    }
}
/** @returns {string} */ function getTokenDesc(/** @type {import("./ast.mjs").Token} */ token) {
    const value = token.value;
    return getTokenKindDesc(token.kind) + (value != null ? ` "${value}"` : '');
}
/** @returns {string} */ function getTokenKindDesc(/** @type {string} */ kind) {
    return isPunctuatorTokenKind(kind) ? `"${kind}"` : kind;
}
//# sourceMappingURL=parser.js.map
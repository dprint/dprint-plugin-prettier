"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.specifiedDirectives = exports.GraphQLDisableErrorPropagationDirective = exports.GraphQLOneOfDirective = exports.GraphQLSpecifiedByDirective = exports.GraphQLDeprecatedDirective = exports.DEFAULT_DEPRECATION_REASON = exports.GraphQLStreamDirective = exports.GraphQLDeferDirective = exports.GraphQLSkipDirective = exports.GraphQLIncludeDirective = exports.GraphQLDirective = void 0;
exports.isDirective = isDirective;
exports.assertDirective = assertDirective;
exports.isSpecifiedDirective = isSpecifiedDirective;
const devAssert_ts_1 = require("../jsutils/devAssert.js");
const inspect_ts_1 = require("../jsutils/inspect.js");
const instanceOf_ts_1 = require("../jsutils/instanceOf.js");
const isObjectLike_ts_1 = require("../jsutils/isObjectLike.js");
const keyValMap_ts_1 = require("../jsutils/keyValMap.js");
const toObjMap_ts_1 = require("../jsutils/toObjMap.js");
const directiveLocation_ts_1 = require("../language/directiveLocation.js");
const assertName_ts_1 = require("./assertName.js");
const definition_ts_1 = require("./definition.js");
const scalars_ts_1 = require("./scalars.js");
const directiveSymbol = Symbol('Directive');
function isDirective(directive) {
    return (0, instanceOf_ts_1.instanceOf)(directive, directiveSymbol, GraphQLDirective);
}
function assertDirective(directive) {
    if (!isDirective(directive)) {
        throw new Error(`Expected ${(0, inspect_ts_1.inspect)(directive)} to be a GraphQL directive.`);
    }
    return directive;
}
class GraphQLDirective {
    constructor(config) {
        this.__kind = directiveSymbol;
        this.name = (0, assertName_ts_1.assertName)(config.name);
        this.description = config.description;
        this.locations = config.locations;
        this.isRepeatable = config.isRepeatable ?? false;
        this.deprecationReason = config.deprecationReason;
        this.extensions = (0, toObjMap_ts_1.toObjMapWithSymbols)(config.extensions);
        this.astNode = config.astNode;
        this.extensionASTNodes = config.extensionASTNodes ?? [];
        if (!(Array.isArray(config.locations)))
            (0, devAssert_ts_1.devAssert)(false, `@${this.name} locations must be an Array.`);
        const args = config.args ?? {};
        if (!((0, isObjectLike_ts_1.isObjectLike)(args) && !Array.isArray(args)))
            (0, devAssert_ts_1.devAssert)(false, `@${this.name} args must be an object with argument names as keys.`);
        this.args = Object.entries(args).map(([argName, argConfig]) => new definition_ts_1.GraphQLArgument(this, argName, argConfig));
    }
    get [Symbol.toStringTag]() {
        return 'GraphQLDirective';
    }
    toConfig() {
        return {
            name: this.name,
            description: this.description,
            locations: this.locations,
            args: (0, keyValMap_ts_1.keyValMap)(this.args, (arg) => arg.name, (arg) => arg.toConfig()),
            isRepeatable: this.isRepeatable,
            deprecationReason: this.deprecationReason,
            extensions: this.extensions,
            astNode: this.astNode,
            extensionASTNodes: this.extensionASTNodes,
        };
    }
    toString() {
        return '@' + this.name;
    }
    toJSON() {
        return this.toString();
    }
}
exports.GraphQLDirective = GraphQLDirective;
exports.GraphQLIncludeDirective = new GraphQLDirective({
    name: 'include',
    description: 'Directs the executor to include this field or fragment only when the `if` argument is true.',
    locations: [
        directiveLocation_ts_1.DirectiveLocation.FIELD,
        directiveLocation_ts_1.DirectiveLocation.FRAGMENT_SPREAD,
        directiveLocation_ts_1.DirectiveLocation.INLINE_FRAGMENT,
    ],
    args: {
        if: {
            type: new definition_ts_1.GraphQLNonNull(scalars_ts_1.GraphQLBoolean),
            description: 'Included when true.',
        },
    },
});
exports.GraphQLSkipDirective = new GraphQLDirective({
    name: 'skip',
    description: 'Directs the executor to skip this field or fragment when the `if` argument is true.',
    locations: [
        directiveLocation_ts_1.DirectiveLocation.FIELD,
        directiveLocation_ts_1.DirectiveLocation.FRAGMENT_SPREAD,
        directiveLocation_ts_1.DirectiveLocation.INLINE_FRAGMENT,
    ],
    args: {
        if: {
            type: new definition_ts_1.GraphQLNonNull(scalars_ts_1.GraphQLBoolean),
            description: 'Skipped when true.',
        },
    },
});
exports.GraphQLDeferDirective = new GraphQLDirective({
    name: 'defer',
    description: 'Directs the executor to defer this fragment when the `if` argument is true or undefined.',
    locations: [
        directiveLocation_ts_1.DirectiveLocation.FRAGMENT_SPREAD,
        directiveLocation_ts_1.DirectiveLocation.INLINE_FRAGMENT,
    ],
    args: {
        if: {
            type: new definition_ts_1.GraphQLNonNull(scalars_ts_1.GraphQLBoolean),
            description: 'Deferred when true or undefined.',
            default: { value: true },
        },
        label: {
            type: scalars_ts_1.GraphQLString,
            description: 'Unique name',
        },
    },
});
exports.GraphQLStreamDirective = new GraphQLDirective({
    name: 'stream',
    description: 'Directs the executor to stream plural fields when the `if` argument is true or undefined.',
    locations: [directiveLocation_ts_1.DirectiveLocation.FIELD],
    args: {
        initialCount: {
            default: { value: 0 },
            type: new definition_ts_1.GraphQLNonNull(scalars_ts_1.GraphQLInt),
            description: 'Number of items to return immediately',
        },
        if: {
            type: new definition_ts_1.GraphQLNonNull(scalars_ts_1.GraphQLBoolean),
            description: 'Stream when true or undefined.',
            default: { value: true },
        },
        label: {
            type: scalars_ts_1.GraphQLString,
            description: 'Unique name',
        },
    },
});
exports.DEFAULT_DEPRECATION_REASON = 'No longer supported';
exports.GraphQLDeprecatedDirective = new GraphQLDirective({
    name: 'deprecated',
    description: 'Marks an element of a GraphQL schema as no longer supported.',
    locations: [
        directiveLocation_ts_1.DirectiveLocation.FIELD_DEFINITION,
        directiveLocation_ts_1.DirectiveLocation.ARGUMENT_DEFINITION,
        directiveLocation_ts_1.DirectiveLocation.INPUT_FIELD_DEFINITION,
        directiveLocation_ts_1.DirectiveLocation.ENUM_VALUE,
        directiveLocation_ts_1.DirectiveLocation.DIRECTIVE_DEFINITION,
    ],
    args: {
        reason: {
            type: new definition_ts_1.GraphQLNonNull(scalars_ts_1.GraphQLString),
            description: 'Explains why this element was deprecated, usually also including a suggestion for how to access supported similar data. Formatted using the Markdown syntax, as specified by [CommonMark](https://commonmark.org/).',
            default: { value: exports.DEFAULT_DEPRECATION_REASON },
        },
    },
});
exports.GraphQLSpecifiedByDirective = new GraphQLDirective({
    name: 'specifiedBy',
    description: 'Exposes a URL that specifies the behavior of this scalar.',
    locations: [directiveLocation_ts_1.DirectiveLocation.SCALAR],
    args: {
        url: {
            type: new definition_ts_1.GraphQLNonNull(scalars_ts_1.GraphQLString),
            description: 'The URL that specifies the behavior of this scalar.',
        },
    },
});
exports.GraphQLOneOfDirective = new GraphQLDirective({
    name: 'oneOf',
    description: 'Indicates exactly one field must be supplied and this field must not be `null`.',
    locations: [directiveLocation_ts_1.DirectiveLocation.INPUT_OBJECT],
    args: {},
});
exports.GraphQLDisableErrorPropagationDirective = new GraphQLDirective({
    name: 'experimental_disableErrorPropagation',
    description: 'Disables error propagation.',
    locations: [
        directiveLocation_ts_1.DirectiveLocation.QUERY,
        directiveLocation_ts_1.DirectiveLocation.MUTATION,
        directiveLocation_ts_1.DirectiveLocation.SUBSCRIPTION,
    ],
});
exports.specifiedDirectives = Object.freeze([
    exports.GraphQLIncludeDirective,
    exports.GraphQLSkipDirective,
    exports.GraphQLDeprecatedDirective,
    exports.GraphQLSpecifiedByDirective,
    exports.GraphQLOneOfDirective,
]);
function isSpecifiedDirective(directive) {
    return exports.specifiedDirectives.some(({ name }) => name === directive.name);
}
//# sourceMappingURL=directives.js.map
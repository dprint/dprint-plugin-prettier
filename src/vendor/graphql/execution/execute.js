"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFieldResolver = exports.defaultTypeResolver = void 0;
exports.execute = execute;
exports.experimentalExecuteIncrementally = experimentalExecuteIncrementally;
exports.executeIgnoringIncremental = executeIgnoringIncremental;
exports.executeRootSelectionSet = executeRootSelectionSet;
exports.experimentalExecuteRootSelectionSet = experimentalExecuteRootSelectionSet;
exports.executeRootSelectionSetIgnoringIncremental = executeRootSelectionSetIgnoringIncremental;
exports.executeSync = executeSync;
exports.executeSubscriptionEvent = executeSubscriptionEvent;
exports.subscribe = subscribe;
exports.createSourceEventStream = createSourceEventStream;
exports.validateExecutionArgs = validateExecutionArgs;
exports.validateSubscriptionArgs = validateSubscriptionArgs;
exports.mapSourceToResponseEvent = mapSourceToResponseEvent;
const inspect_ts_1 = require("../jsutils/inspect.js");
const isAsyncIterable_ts_1 = require("../jsutils/isAsyncIterable.js");
const isObjectLike_ts_1 = require("../jsutils/isObjectLike.js");
const isPromise_ts_1 = require("../jsutils/isPromise.js");
const Path_ts_1 = require("../jsutils/Path.js");
const ensureGraphQLError_ts_1 = require("../error/ensureGraphQLError.js");
const GraphQLError_ts_1 = require("../error/GraphQLError.js");
const locatedError_ts_1 = require("../error/locatedError.js");
const kinds_ts_1 = require("../language/kinds.js");
const predicates_ts_1 = require("../language/predicates.js");
const directives_ts_1 = require("../type/directives.js");
const index_ts_1 = require("../type/index.js");
const getOperationAST_ts_1 = require("../utilities/getOperationAST.js");
const diagnostics_ts_1 = require("../diagnostics.js");
const buildResolveInfo_ts_1 = require("./buildResolveInfo.js");
const cancellablePromise_ts_1 = require("./cancellablePromise.js");
const collectFields_ts_1 = require("./collectFields.js");
const createSharedExecutionContext_ts_1 = require("./createSharedExecutionContext.js");
const Executor_ts_1 = require("./Executor.js");
const ExecutorThrowingOnIncremental_ts_1 = require("./ExecutorThrowingOnIncremental.js");
const getVariableSignature_ts_1 = require("./getVariableSignature.js");
const IncrementalExecutor_ts_1 = require("./incremental/IncrementalExecutor.js");
const mapAsyncIterable_ts_1 = require("./mapAsyncIterable.js");
const values_ts_1 = require("./values.js");
const UNEXPECTED_EXPERIMENTAL_DIRECTIVES = 'The provided schema unexpectedly contains experimental directives (@defer or @stream). These directives may only be utilized if experimental execution features are explicitly enabled.';
function execute(args) {
    if (!(0, diagnostics_ts_1.shouldTrace)(diagnostics_ts_1.executeChannel)) {
        return executeImpl(args);
    }
    return (0, diagnostics_ts_1.traceMixed)(diagnostics_ts_1.executeChannel, buildOperationContextFromArgs(args), () => executeImpl(args));
}
function buildOperationContextFromArgs(args) {
    let operation;
    const resolveOperation = () => {
        if (operation === undefined) {
            operation = (0, getOperationAST_ts_1.getOperationAST)(args.document, args.operationName);
        }
        return operation;
    };
    return {
        schema: args.schema,
        document: args.document,
        rawVariableValues: args.variableValues,
        get operationName() {
            return args.operationName ?? resolveOperation()?.name?.value;
        },
        get operationType() {
            return resolveOperation()?.operation;
        },
    };
}
function executeImpl(args) {
    if (args.schema.getDirective('defer') || args.schema.getDirective('stream')) {
        throw new Error(UNEXPECTED_EXPERIMENTAL_DIRECTIVES);
    }
    const validatedExecutionArgs = validateExecutionArgs(args);
    if (!('schema' in validatedExecutionArgs)) {
        return { errors: validatedExecutionArgs };
    }
    return executeRootSelectionSet(validatedExecutionArgs);
}
function experimentalExecuteIncrementally(args) {
    if (!(0, diagnostics_ts_1.shouldTrace)(diagnostics_ts_1.executeChannel)) {
        return experimentalExecuteIncrementallyImpl(args);
    }
    return (0, diagnostics_ts_1.traceMixed)(diagnostics_ts_1.executeChannel, buildOperationContextFromArgs(args), () => experimentalExecuteIncrementallyImpl(args));
}
function experimentalExecuteIncrementallyImpl(args) {
    const validatedExecutionArgs = validateExecutionArgs(args);
    if (!('schema' in validatedExecutionArgs)) {
        return { errors: validatedExecutionArgs };
    }
    return experimentalExecuteRootSelectionSet(validatedExecutionArgs);
}
function executeIgnoringIncremental(args) {
    if (!(0, diagnostics_ts_1.shouldTrace)(diagnostics_ts_1.executeChannel)) {
        return executeIgnoringIncrementalImpl(args);
    }
    return (0, diagnostics_ts_1.traceMixed)(diagnostics_ts_1.executeChannel, buildOperationContextFromArgs(args), () => executeIgnoringIncrementalImpl(args));
}
function executeIgnoringIncrementalImpl(args) {
    const validatedExecutionArgs = validateExecutionArgs(args);
    if (!('schema' in validatedExecutionArgs)) {
        return { errors: validatedExecutionArgs };
    }
    return executeRootSelectionSetIgnoringIncremental(validatedExecutionArgs);
}
function executeRootSelectionSet(validatedExecutionArgs) {
    return new ExecutorThrowingOnIncremental_ts_1.ExecutorThrowingOnIncremental(validatedExecutionArgs).executeRootSelectionSet();
}
function experimentalExecuteRootSelectionSet(validatedExecutionArgs) {
    return new IncrementalExecutor_ts_1.IncrementalExecutor(validatedExecutionArgs).executeRootSelectionSet();
}
function executeRootSelectionSetIgnoringIncremental(validatedExecutionArgs) {
    return new Executor_ts_1.Executor(validatedExecutionArgs).executeRootSelectionSet();
}
function executeSync(args) {
    const result = experimentalExecuteIncrementally(args);
    if ((0, isPromise_ts_1.isPromise)(result) || 'initialResult' in result) {
        throw new Error('GraphQL execution failed to complete synchronously.');
    }
    return result;
}
function executeSubscriptionEvent(validatedExecutionArgs) {
    return new ExecutorThrowingOnIncremental_ts_1.ExecutorThrowingOnIncremental(validatedExecutionArgs).executeRootSelectionSet(false);
}
function subscribe(args) {
    if (!(0, diagnostics_ts_1.shouldTrace)(diagnostics_ts_1.subscribeChannel)) {
        return subscribeImpl(args);
    }
    return (0, diagnostics_ts_1.traceMixed)(diagnostics_ts_1.subscribeChannel, buildOperationContextFromArgs(args), () => subscribeImpl(args));
}
function subscribeImpl(args) {
    const validatedExecutionArgs = validateSubscriptionArgs(args);
    if (!('schema' in validatedExecutionArgs)) {
        return { errors: validatedExecutionArgs };
    }
    const resultOrStream = createSourceEventStream(validatedExecutionArgs);
    if ((0, isPromise_ts_1.isPromise)(resultOrStream)) {
        return resultOrStream.then((resolvedResultOrStream) => (0, isAsyncIterable_ts_1.isAsyncIterable)(resolvedResultOrStream)
            ? mapSourceToResponseEvent(validatedExecutionArgs, resolvedResultOrStream)
            : resolvedResultOrStream);
    }
    return (0, isAsyncIterable_ts_1.isAsyncIterable)(resultOrStream)
        ? mapSourceToResponseEvent(validatedExecutionArgs, resultOrStream)
        : resultOrStream;
}
function createSourceEventStream(validatedExecutionArgs) {
    if (!('operation' in validatedExecutionArgs)) {
        throw new GraphQLError_ts_1.GraphQLError('Passing ExecutionArgs to createSourceEventStream() was removed in graphql-js@17.0.0; call validateSubscriptionArgs() first and pass the result instead, or use subscribe() for the full subscription pipeline.');
    }
    try {
        const eventStream = executeSubscription(validatedExecutionArgs);
        if ((0, isPromise_ts_1.isPromise)(eventStream)) {
            return eventStream.then(undefined, (error) => ({
                errors: [(0, ensureGraphQLError_ts_1.ensureGraphQLError)(error)],
            }));
        }
        return eventStream;
    }
    catch (error) {
        return { errors: [(0, ensureGraphQLError_ts_1.ensureGraphQLError)(error)] };
    }
}
function validateExecutionArgs(args) {
    const { schema, document, rootValue, contextValue, variableValues: rawVariableValues, operationName, fieldResolver, typeResolver, subscribeFieldResolver, abortSignal: externalAbortSignal, enableEarlyExecution, hooks, options, } = args;
    (0, index_ts_1.assertValidSchema)(schema);
    let operation;
    const fragmentDefinitions = Object.create(null);
    const fragments = Object.create(null);
    const fragmentVariableSignatureErrors = [];
    for (const definition of document.definitions) {
        switch (definition.kind) {
            case kinds_ts_1.Kind.OPERATION_DEFINITION:
                if (operationName == null) {
                    if (operation !== undefined) {
                        return [
                            new GraphQLError_ts_1.GraphQLError('Must provide operation name if query contains multiple operations.'),
                        ];
                    }
                    operation = definition;
                }
                else if (definition.name?.value === operationName) {
                    operation = definition;
                }
                break;
            case kinds_ts_1.Kind.FRAGMENT_DEFINITION: {
                fragmentDefinitions[definition.name.value] = definition;
                let variableSignatures;
                if (definition.variableDefinitions) {
                    const signatures = Object.create(null);
                    for (const varDef of definition.variableDefinitions) {
                        const signature = (0, getVariableSignature_ts_1.getVariableSignature)(schema, varDef);
                        if (signature instanceof GraphQLError_ts_1.GraphQLError) {
                            fragmentVariableSignatureErrors.push(signature);
                            continue;
                        }
                        signatures[signature.name] = signature;
                    }
                    variableSignatures = signatures;
                }
                fragments[definition.name.value] = { definition, variableSignatures };
                break;
            }
            default:
        }
    }
    if (!operation) {
        if (operationName != null) {
            return [new GraphQLError_ts_1.GraphQLError(`Unknown operation named "${operationName}".`)];
        }
        return [new GraphQLError_ts_1.GraphQLError('Must provide an operation.')];
    }
    if (fragmentVariableSignatureErrors.length > 0) {
        return fragmentVariableSignatureErrors;
    }
    const variableDefinitions = operation.variableDefinitions ?? [];
    const hideSuggestions = args.hideSuggestions ?? false;
    const coercionInput = rawVariableValues ?? {};
    const coercionOptions = {
        maxErrors: options?.maxCoercionErrors ?? 50,
        hideSuggestions,
    };
    const coercionChannel = diagnostics_ts_1.executeVariableCoercionChannel;
    const variableValuesOrErrors = (0, diagnostics_ts_1.shouldTrace)(coercionChannel)
        ? (0, diagnostics_ts_1.traceMixed)(coercionChannel, {
            schema,
            document,
            operation,
            rawVariableValues,
            operationName: operation.name?.value,
            operationType: operation.operation,
        }, () => (0, values_ts_1.getVariableValues)(schema, variableDefinitions, coercionInput, coercionOptions))
        : (0, values_ts_1.getVariableValues)(schema, variableDefinitions, coercionInput, coercionOptions);
    if (variableValuesOrErrors.errors) {
        return variableValuesOrErrors.errors;
    }
    const errorPropagation = !operation.directives?.find((directive) => directive.name.value === directives_ts_1.GraphQLDisableErrorPropagationDirective.name);
    return {
        schema,
        document,
        fragmentDefinitions,
        fragments,
        rootValue,
        contextValue,
        operation,
        variableValues: variableValuesOrErrors.variableValues,
        fieldResolver: fieldResolver ?? exports.defaultFieldResolver,
        typeResolver: typeResolver ?? exports.defaultTypeResolver,
        subscribeFieldResolver: subscribeFieldResolver ?? exports.defaultFieldResolver,
        hideSuggestions,
        errorPropagation,
        externalAbortSignal: externalAbortSignal ?? undefined,
        enableEarlyExecution: enableEarlyExecution === true,
        hooks: hooks ?? undefined,
        rawVariableValues,
    };
}
function validateSubscriptionArgs(args) {
    const validatedExecutionArgs = validateExecutionArgs(args);
    if (!('schema' in validatedExecutionArgs)) {
        return validatedExecutionArgs;
    }
    assertSubscriptionExecutionArgs(validatedExecutionArgs);
    return validatedExecutionArgs;
}
function assertSubscriptionExecutionArgs(validatedExecutionArgs) {
    if (!(0, predicates_ts_1.isSubscriptionOperationDefinitionNode)(validatedExecutionArgs.operation)) {
        throw new GraphQLError_ts_1.GraphQLError('Expected subscription operation.');
    }
}
const defaultTypeResolver = function (value, contextValue, info, abstractType) {
    if ((0, isObjectLike_ts_1.isObjectLike)(value) && typeof value.__typename === 'string') {
        return value.__typename;
    }
    const possibleTypes = info.schema.getPossibleTypes(abstractType);
    const promisedIsTypeOfResults = [];
    try {
        for (let i = 0; i < possibleTypes.length; i++) {
            const type = possibleTypes[i];
            if (type.isTypeOf) {
                const isTypeOfResult = type.isTypeOf(value, contextValue, info);
                if ((0, isPromise_ts_1.isPromiseLike)(isTypeOfResult)) {
                    promisedIsTypeOfResults[i] = isTypeOfResult;
                }
                else if (isTypeOfResult) {
                    if (promisedIsTypeOfResults.length) {
                        info.getAsyncHelpers().track(promisedIsTypeOfResults);
                    }
                    return type.name;
                }
            }
        }
    }
    catch (error) {
        if (promisedIsTypeOfResults.length) {
            info.getAsyncHelpers().track(promisedIsTypeOfResults);
        }
        throw error;
    }
    if (promisedIsTypeOfResults.length) {
        return info
            .getAsyncHelpers()
            .promiseAll(promisedIsTypeOfResults)
            .then((isTypeOfResults) => {
            for (let i = 0; i < isTypeOfResults.length; i++) {
                if (isTypeOfResults[i]) {
                    return possibleTypes[i].name;
                }
            }
        });
    }
};
exports.defaultTypeResolver = defaultTypeResolver;
const defaultFieldResolver = function (source, args, contextValue, info) {
    if ((0, isObjectLike_ts_1.isObjectLike)(source) || typeof source === 'function') {
        const property = source[info.fieldName];
        if (typeof property === 'function') {
            return source[info.fieldName](args, contextValue, info);
        }
        return property;
    }
};
exports.defaultFieldResolver = defaultFieldResolver;
function mapSourceToResponseEvent(validatedExecutionArgs, sourceEventStream, rootSelectionSetExecutor = executeSubscriptionEvent) {
    function mapFn(payload) {
        const perEventExecutionArgs = {
            ...validatedExecutionArgs,
            rootValue: payload,
        };
        return rootSelectionSetExecutor(perEventExecutionArgs);
    }
    const externalAbortSignal = validatedExecutionArgs.externalAbortSignal;
    if (externalAbortSignal) {
        const generator = (0, mapAsyncIterable_ts_1.mapAsyncIterable)(sourceEventStream, mapFn);
        return {
            ...generator,
            next: () => (0, cancellablePromise_ts_1.cancellablePromise)(generator.next(), externalAbortSignal),
        };
    }
    return (0, mapAsyncIterable_ts_1.mapAsyncIterable)(sourceEventStream, mapFn);
}
function executeSubscription(validatedExecutionArgs) {
    const { schema, fragments, rootValue, contextValue, operation, variableValues, hideSuggestions, externalAbortSignal, } = validatedExecutionArgs;
    const rootType = schema.getSubscriptionType();
    if (rootType == null) {
        throw new GraphQLError_ts_1.GraphQLError('Schema is not configured to execute subscription operation.', { nodes: operation });
    }
    const { groupedFieldSet } = (0, collectFields_ts_1.collectFields)(schema, fragments, variableValues, rootType, operation.selectionSet, hideSuggestions);
    const firstRootField = groupedFieldSet.entries().next().value;
    const [responseName, fieldDetailsList] = firstRootField;
    const firstFieldDetails = fieldDetailsList[0];
    const firstNode = firstFieldDetails.node;
    const fieldName = firstNode.name.value;
    const fieldDef = schema.getField(rootType, fieldName);
    const fieldNodes = fieldDetailsList.map((fieldDetails) => fieldDetails.node);
    if (!fieldDef) {
        throw new GraphQLError_ts_1.GraphQLError(`The subscription field "${fieldName}" is not defined.`, { nodes: fieldNodes });
    }
    const sharedExecutionContext = (0, createSharedExecutionContext_ts_1.createSharedExecutionContext)(externalAbortSignal);
    const path = (0, Path_ts_1.addPath)(undefined, responseName, rootType.name);
    const info = (0, buildResolveInfo_ts_1.buildResolveInfo)(validatedExecutionArgs, fieldDef, fieldNodes, rootType, path, sharedExecutionContext.getAbortSignal, sharedExecutionContext.getAsyncHelpers);
    try {
        const args = (0, values_ts_1.getArgumentValues)(fieldDef, firstNode, variableValues, firstFieldDetails.fragmentVariableValues, hideSuggestions);
        const resolveFn = fieldDef.subscribe ?? validatedExecutionArgs.subscribeFieldResolver;
        const result = resolveFn(rootValue, args, contextValue, info);
        if ((0, isPromise_ts_1.isPromiseLike)(result)) {
            const promisedResult = Promise.resolve(result);
            const promise = externalAbortSignal
                ? (0, cancellablePromise_ts_1.cancellablePromise)(promisedResult, externalAbortSignal)
                : promisedResult;
            return promise
                .then(assertEventStream)
                .then(undefined, (error) => {
                throw (0, locatedError_ts_1.locatedError)(error, toNodes(fieldDetailsList), (0, Path_ts_1.pathToArray)(path));
            });
        }
        return assertEventStream(result);
    }
    catch (error) {
        throw (0, locatedError_ts_1.locatedError)(error, fieldNodes, (0, Path_ts_1.pathToArray)(path));
    }
}
function assertEventStream(result) {
    if (result instanceof Error) {
        throw result;
    }
    if (!(0, isAsyncIterable_ts_1.isAsyncIterable)(result)) {
        throw new GraphQLError_ts_1.GraphQLError('Subscription field must return Async Iterable. ' +
            `Received: ${(0, inspect_ts_1.inspect)(result)}.`);
    }
    return result;
}
function toNodes(fieldDetailsList) {
    return fieldDetailsList.map((fieldDetails) => fieldDetails.node);
}
//# sourceMappingURL=execute.js.map
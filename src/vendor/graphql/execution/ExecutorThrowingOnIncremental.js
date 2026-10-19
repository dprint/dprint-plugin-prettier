"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutorThrowingOnIncremental = void 0;
const invariant_ts_1 = require("../jsutils/invariant.js");
const ast_ts_1 = require("../language/ast.js");
const Executor_ts_1 = require("./Executor.js");
const UNEXPECTED_MULTIPLE_PAYLOADS = 'Executing this GraphQL operation would unexpectedly produce multiple payloads (due to @defer or @stream directive)';
class ExecutorThrowingOnIncremental extends Executor_ts_1.Executor {
    executeCollectedRootFields(rootType, rootValue, originalGroupedFieldSet, serially, newDeferUsages) {
        if (newDeferUsages.length > 0) {
            if (!(this.validatedExecutionArgs.operation.operation !==
                ast_ts_1.OperationTypeNode.SUBSCRIPTION))
                (0, invariant_ts_1.invariant)(false, '`@defer` directive not supported on subscription operations. Disable `@defer` by setting the `if` argument to `false`.');
            const reason = new Error(UNEXPECTED_MULTIPLE_PAYLOADS);
            this.abort(reason);
            throw reason;
        }
        return this.executeRootGroupedFieldSet(rootType, rootValue, originalGroupedFieldSet, serially, undefined);
    }
    executeCollectedSubfields(parentType, sourceValue, path, originalGroupedFieldSet, newDeferUsages) {
        if (newDeferUsages.length > 0) {
            if (!(this.validatedExecutionArgs.operation.operation !==
                ast_ts_1.OperationTypeNode.SUBSCRIPTION))
                (0, invariant_ts_1.invariant)(false, '`@defer` directive not supported on subscription operations. Disable `@defer` by setting the `if` argument to `false`.');
            const reason = new Error(UNEXPECTED_MULTIPLE_PAYLOADS);
            this.abort(reason);
            throw reason;
        }
        return this.executeFields(parentType, sourceValue, path, originalGroupedFieldSet, undefined);
    }
    completeListValue(returnType, fieldDetailsList, info, path, result, positionContext) {
        const streamUsage = (0, Executor_ts_1.getStreamUsage)(this.validatedExecutionArgs, fieldDetailsList);
        if (streamUsage !== undefined) {
            if (!(this.validatedExecutionArgs.operation.operation !==
                ast_ts_1.OperationTypeNode.SUBSCRIPTION))
                (0, invariant_ts_1.invariant)(false, '`@stream` directive not supported on subscription operations. Disable `@stream` by setting the `if` argument to `false`.');
            const reason = new Error(UNEXPECTED_MULTIPLE_PAYLOADS);
            this.abort(reason);
            throw reason;
        }
        return super.completeListValue(returnType, fieldDetailsList, info, path, result, positionContext);
    }
}
exports.ExecutorThrowingOnIncremental = ExecutorThrowingOnIncremental;
//# sourceMappingURL=ExecutorThrowingOnIncremental.js.map
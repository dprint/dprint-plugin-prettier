"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacyExecuteIncrementally = legacyExecuteIncrementally;
exports.legacyExecuteRootSelectionSet = legacyExecuteRootSelectionSet;
const execute_ts_1 = require("../execute.js");
const BranchingIncrementalExecutor_ts_1 = require("./BranchingIncrementalExecutor.js");
function legacyExecuteIncrementally(args) {
    const validatedExecutionArgs = (0, execute_ts_1.validateExecutionArgs)(args);
    if (!('schema' in validatedExecutionArgs)) {
        return { errors: validatedExecutionArgs };
    }
    return legacyExecuteRootSelectionSet(validatedExecutionArgs);
}
function legacyExecuteRootSelectionSet(validatedExecutionArgs) {
    return new BranchingIncrementalExecutor_ts_1.BranchingIncrementalExecutor(validatedExecutionArgs).executeRootSelectionSet();
}
//# sourceMappingURL=legacyExecuteIncrementally.js.map
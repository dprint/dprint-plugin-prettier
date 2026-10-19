"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchingIncrementalExecutor = void 0;
const AccumulatorMap_ts_1 = require("../../jsutils/AccumulatorMap.js");
const getBySet_ts_1 = require("../../jsutils/getBySet.js");
const invariant_ts_1 = require("../../jsutils/invariant.js");
const isSameSet_ts_1 = require("../../jsutils/isSameSet.js");
const memoize1_ts_1 = require("../../jsutils/memoize1.js");
const memoize2_ts_1 = require("../../jsutils/memoize2.js");
const IncrementalExecutor_ts_1 = require("../incremental/IncrementalExecutor.js");
const BranchingIncrementalPublisher_ts_1 = require("./BranchingIncrementalPublisher.js");
const buildBranchingExecutionPlanFromInitial = (0, memoize1_ts_1.memoize1)((groupedFieldSet) => buildBranchingExecutionPlan(groupedFieldSet));
const buildBranchingExecutionPlanFromDeferred = (0, memoize2_ts_1.memoize2)((groupedFieldSet, deferUsageSet) => buildBranchingExecutionPlan(groupedFieldSet, deferUsageSet));
class BranchingIncrementalExecutor extends IncrementalExecutor_ts_1.IncrementalExecutor {
    getCreateSubExecutor() {
        const validatedExecutionArgs = this.validatedExecutionArgs;
        const sharedExecutionContext = this.sharedExecutionContext;
        return (deferUsageSet) => new BranchingIncrementalExecutor(validatedExecutionArgs, sharedExecutionContext, deferUsageSet);
    }
    buildResponse(data) {
        const work = this.getIncrementalWork();
        const { tasks, streams } = work;
        if (tasks?.length === 0 && streams?.length === 0) {
            return super.buildResponse(data);
        }
        const errors = this.collectedErrors.errors;
        if (!(data !== null))
            (0, invariant_ts_1.invariant)(false);
        const incrementalPublisher = new BranchingIncrementalPublisher_ts_1.BranchingIncrementalPublisher();
        return incrementalPublisher.buildResponse(data, errors, work, this.validatedExecutionArgs.externalAbortSignal, this.getFinishSharedExecution());
    }
    buildRootExecutionPlan(originalGroupedFieldSet) {
        return buildBranchingExecutionPlanFromInitial(originalGroupedFieldSet);
    }
    buildSubExecutionPlan(originalGroupedFieldSet) {
        return this.deferUsageSet === undefined
            ? buildBranchingExecutionPlanFromInitial(originalGroupedFieldSet)
            : buildBranchingExecutionPlanFromDeferred(originalGroupedFieldSet, this.deferUsageSet);
    }
}
exports.BranchingIncrementalExecutor = BranchingIncrementalExecutor;
function buildBranchingExecutionPlan(originalGroupedFieldSet, parentDeferUsages = new Set()) {
    const groupedFieldSet = new AccumulatorMap_ts_1.AccumulatorMap();
    const newGroupedFieldSets = new Map();
    for (const [responseKey, fieldGroup] of originalGroupedFieldSet) {
        for (const fieldDetails of fieldGroup) {
            const deferUsage = fieldDetails.deferUsage;
            const deferUsageSet = deferUsage === undefined
                ? new Set()
                : new Set([deferUsage]);
            if ((0, isSameSet_ts_1.isSameSet)(parentDeferUsages, deferUsageSet)) {
                groupedFieldSet.add(responseKey, fieldDetails);
            }
            else {
                let newGroupedFieldSet = (0, getBySet_ts_1.getBySet)(newGroupedFieldSets, deferUsageSet);
                if (newGroupedFieldSet === undefined) {
                    newGroupedFieldSet = new AccumulatorMap_ts_1.AccumulatorMap();
                    newGroupedFieldSets.set(deferUsageSet, newGroupedFieldSet);
                }
                newGroupedFieldSet.add(responseKey, fieldDetails);
            }
        }
    }
    return {
        groupedFieldSet,
        newGroupedFieldSets,
    };
}
//# sourceMappingURL=BranchingIncrementalExecutor.js.map
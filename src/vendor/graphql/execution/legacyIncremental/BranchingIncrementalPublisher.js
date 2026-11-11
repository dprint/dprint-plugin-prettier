"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchingIncrementalPublisher = void 0;
const Path_ts_1 = require("../../jsutils/Path.js");
const ensureGraphQLError_ts_1 = require("../../error/ensureGraphQLError.js");
const WorkQueue_ts_1 = require("../incremental/WorkQueue.js");
const mapAsyncIterable_ts_1 = require("../mapAsyncIterable.js");
const withConcurrentAbruptClose_ts_1 = require("../withConcurrentAbruptClose.js");
class BranchingIncrementalPublisher {
    constructor() {
        this._indices = new Map();
    }
    buildResponse(data, errors, work, abortSignal, onFinished) {
        const { initialStreams, events } = (0, WorkQueue_ts_1.createWorkQueue)(work);
        for (const stream of initialStreams) {
            this._indices.set(stream, stream.initialCount);
        }
        function abort() {
            subsequentResults.throw(abortSignal?.reason).catch(() => {
            });
        }
        if (abortSignal) {
            abortSignal.addEventListener('abort', abort);
        }
        const onWorkQueueFinished = () => {
            onFinished();
            abortSignal?.removeEventListener('abort', abort);
        };
        const initialResult = errors.length
            ? { errors, data, hasNext: true }
            : { data, hasNext: true };
        const subsequentResults = (0, withConcurrentAbruptClose_ts_1.withConcurrentAbruptClose)((0, mapAsyncIterable_ts_1.mapAsyncIterable)(events, (batch) => this._handleBatch(batch, onWorkQueueFinished)), () => onWorkQueueFinished());
        return {
            initialResult,
            subsequentResults,
        };
    }
    _handleBatch(batch, onWorkQueueFinished) {
        const context = {
            incremental: [],
            hasNext: true,
        };
        for (const event of batch) {
            this._handleWorkQueueEvent(event, context, onWorkQueueFinished);
        }
        const { incremental, hasNext } = context;
        const result = { hasNext };
        if (incremental.length > 0) {
            result.incremental = incremental;
        }
        return result;
    }
    _handleWorkQueueEvent(event, context, onWorkQueueFinished) {
        switch (event.kind) {
            case 'GROUP_VALUES': {
                const group = event.group;
                for (const value of event.values) {
                    context.incremental.push(buildIncrementalResult({
                        data: value.data,
                        path: (0, Path_ts_1.pathToArray)(group.path),
                    }, group.label, value.errors));
                }
                break;
            }
            case 'GROUP_SUCCESS': {
                break;
            }
            case 'GROUP_FAILURE': {
                const group = event.group;
                context.incremental.push(buildIncrementalResult({
                    data: null,
                    path: (0, Path_ts_1.pathToArray)(group.path),
                }, group.label, [(0, ensureGraphQLError_ts_1.ensureGraphQLError)(event.error)]));
                break;
            }
            case 'STREAM_VALUES': {
                const stream = event.stream;
                const { values } = event;
                const items = [];
                const errors = [];
                for (const value of values) {
                    items.push(value.item);
                    if (value.errors !== undefined) {
                        errors.push(...value.errors);
                    }
                }
                let index = this._indices.get(stream);
                if (index === undefined) {
                    index = stream.initialCount;
                    this._indices.set(stream, index);
                }
                this._indices.set(stream, index + items.length);
                context.incremental.push(buildIncrementalResult({
                    items,
                    path: (0, Path_ts_1.pathToArray)((0, Path_ts_1.addPath)(stream.path, index, undefined)),
                }, stream.label, errors.length > 0 ? errors : undefined));
                break;
            }
            case 'STREAM_SUCCESS': {
                this._indices.delete(event.stream);
                break;
            }
            case 'STREAM_FAILURE': {
                this._indices.delete(event.stream);
                const stream = event.stream;
                context.incremental.push(buildIncrementalResult({
                    items: null,
                    path: (0, Path_ts_1.pathToArray)(stream.path),
                }, stream.label, [(0, ensureGraphQLError_ts_1.ensureGraphQLError)(event.error)]));
                break;
            }
            case 'WORK_QUEUE_TERMINATION': {
                onWorkQueueFinished?.();
                context.hasNext = false;
                break;
            }
        }
    }
}
exports.BranchingIncrementalPublisher = BranchingIncrementalPublisher;
function buildIncrementalResult(originalIncrementalResult, label, errors) {
    const incrementalResult = originalIncrementalResult;
    if (errors !== undefined) {
        incrementalResult.errors = errors;
    }
    if (label !== undefined) {
        incrementalResult.label = label;
    }
    return incrementalResult;
}
//# sourceMappingURL=BranchingIncrementalPublisher.js.map
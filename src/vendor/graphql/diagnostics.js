"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveChannel = exports.subscribeChannel = exports.executeRootSelectionSetChannel = exports.executeVariableCoercionChannel = exports.executeChannel = exports.validateChannel = exports.parseChannel = void 0;
exports.shouldTrace = shouldTrace;
exports.traceMixed = traceMixed;
const isPromise_ts_1 = require("./jsutils/isPromise.js");
function resolveDiagnosticsChannel() {
    let dc;
    try {
        const processRef = globalThis.process;
        if (typeof processRef?.getBuiltinModule === 'function') {
            dc = processRef.getBuiltinModule('node:diagnostics_channel');
        }
    }
    catch {
    }
    return dc;
}
const dc = resolveDiagnosticsChannel();
exports.parseChannel = dc?.tracingChannel('graphql:parse');
exports.validateChannel = dc?.tracingChannel('graphql:validate');
exports.executeChannel = dc?.tracingChannel('graphql:execute');
exports.executeVariableCoercionChannel = dc?.tracingChannel('graphql:execute:variableCoercion');
exports.executeRootSelectionSetChannel = dc?.tracingChannel('graphql:execute:rootSelectionSet');
exports.subscribeChannel = dc?.tracingChannel('graphql:subscribe');
exports.resolveChannel = dc?.tracingChannel('graphql:resolve');
const SUB_CHANNEL_KEYS = ['start', 'end', 'asyncStart', 'asyncEnd', 'error'];
function shouldTrace(channel) {
    if (channel == null) {
        return false;
    }
    const aggregate = channel.hasSubscribers;
    if (aggregate !== undefined) {
        return aggregate;
    }
    for (const key of SUB_CHANNEL_KEYS) {
        if (channel[key].hasSubscribers) {
            return true;
        }
    }
    return false;
}
function traceMixed(channel, contextInput, fn) {
    const context = contextInput;
    return channel.start.runStores(context, () => {
        let result;
        try {
            result = fn();
        }
        catch (err) {
            context.error = err;
            channel.error.publish(context);
            channel.end.publish(context);
            throw err;
        }
        if (!(0, isPromise_ts_1.isPromiseLike)(result)) {
            context.result = result;
            channel.end.publish(context);
            return result;
        }
        channel.end.publish(context);
        return result.then((value) => {
            context.result = value;
            channel.asyncStart.publish(context);
            channel.asyncEnd.publish(context);
            return value;
        }, (err) => {
            context.error = err;
            channel.error.publish(context);
            channel.asyncStart.publish(context);
            channel.asyncEnd.publish(context);
            throw err;
        });
    });
}
//# sourceMappingURL=diagnostics.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSharedExecutionContext = createSharedExecutionContext;
const AsyncWorkTracker_ts_1 = require("./AsyncWorkTracker.js");
function createSharedExecutionContext(abortSignal) {
    const asyncWorkTracker = new AsyncWorkTracker_ts_1.AsyncWorkTracker();
    let resolveInfoHelpers;
    const promiseAll = (values) => asyncWorkTracker.promiseAllTrackOnReject(values);
    const getAsyncHelpers = () => (resolveInfoHelpers ??= {
        promiseAll,
        track: (maybePromises) => asyncWorkTracker.addValues(maybePromises),
    });
    return {
        asyncWorkTracker,
        getAbortSignal: () => abortSignal,
        getAsyncHelpers,
        promiseAll,
    };
}
//# sourceMappingURL=createSharedExecutionContext.js.map
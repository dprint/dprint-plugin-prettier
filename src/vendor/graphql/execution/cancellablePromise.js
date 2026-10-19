"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCancellation = withCancellation;
exports.cancellablePromise = cancellablePromise;
const promiseWithResolvers_ts_1 = require("../jsutils/promiseWithResolvers.js");
function withCancellation(originalPromise) {
    const { promise, resolve, reject } = (0, promiseWithResolvers_ts_1.promiseWithResolvers)();
    let settled = false;
    const settleResolve = (value) => {
        if (settled) {
            return;
        }
        settled = true;
        resolve(value);
    };
    const settleReject = (error) => {
        if (settled) {
            return;
        }
        settled = true;
        reject(error);
    };
    originalPromise.then(settleResolve, settleReject);
    return {
        promise,
        abort(reason) {
            settleReject(reason);
        },
    };
}
function cancellablePromise(promise, abortSignal) {
    const withAbort = withCancellation(promise);
    if (abortSignal.aborted) {
        withAbort.abort(abortSignal.reason);
        return withAbort.promise;
    }
    const onAbort = () => {
        abortSignal.removeEventListener('abort', onAbort);
        withAbort.abort(abortSignal.reason);
    };
    abortSignal.addEventListener('abort', onAbort);
    withAbort.promise.then(() => {
        abortSignal.removeEventListener('abort', onAbort);
    }, () => {
        abortSignal.removeEventListener('abort', onAbort);
    });
    return withAbort.promise;
}
//# sourceMappingURL=cancellablePromise.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncWorkTracker = void 0;
const isPromise_ts_1 = require("../jsutils/isPromise.js");
class AsyncWorkTracker {
    constructor() {
        this.pendingAsyncWork = new Set();
    }
    add(promiseLike) {
        const pendingAsyncWork = this.pendingAsyncWork;
        const promiseToSettle = promiseLike.then(() => {
            pendingAsyncWork.delete(promiseToSettle);
        }, () => {
            pendingAsyncWork.delete(promiseToSettle);
        });
        pendingAsyncWork.add(promiseToSettle);
    }
    addValues(values) {
        for (const value of values) {
            if ((0, isPromise_ts_1.isPromiseLike)(value)) {
                this.add(value);
            }
        }
    }
    wait() {
        if (this.pendingAsyncWork.size === 0) {
            return;
        }
        return this.waitForPendingAsyncWork();
    }
    promiseAllTrackOnReject(values) {
        const promise = Promise.all(values);
        promise.then(undefined, () => {
            this.addValues(values);
        });
        return promise;
    }
    async waitForPendingAsyncWork() {
        while (this.pendingAsyncWork.size > 0) {
            await Promise.allSettled(Array.from(this.pendingAsyncWork));
        }
    }
}
exports.AsyncWorkTracker = AsyncWorkTracker;
//# sourceMappingURL=AsyncWorkTracker.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promiseWithResolvers = promiseWithResolvers;
function promiseWithResolvers() {
    let resolve;
    let reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}
//# sourceMappingURL=promiseWithResolvers.js.map
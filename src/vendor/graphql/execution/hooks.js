"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAsyncWorkFinishedHook = runAsyncWorkFinishedHook;
function runHookSafely(hook, info) {
    try {
        hook?.(info);
    }
    catch {
    }
}
function runAsyncWorkFinishedHook(validatedExecutionArgs, sharedExecutionContext, asyncWorkFinishedHook) {
    const maybeWaitForAsyncWork = sharedExecutionContext.asyncWorkTracker.wait();
    if (maybeWaitForAsyncWork === undefined) {
        runHookSafely(asyncWorkFinishedHook, { validatedExecutionArgs });
        return;
    }
    maybeWaitForAsyncWork
        .then(() => {
        runHookSafely(asyncWorkFinishedHook, { validatedExecutionArgs });
    })
        .catch(() => undefined);
}
//# sourceMappingURL=hooks.js.map
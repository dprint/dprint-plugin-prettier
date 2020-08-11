export function startParentProcessChecker(parentPid: number) {
    doTimeout();

    function doTimeout() {
        setTimeout(() => {
            if (!isProcessRunning(parentPid)) {
                killCurrentProcessWithErrorMessage();
            }
            doTimeout();
        }, 30_000);
    }
}

function isProcessRunning(pid: number) {
    // https://nodejs.org/api/process.html#process_process_kill_pid_signal
    try {
        // providing 0 tests for the existence of a process without killing strangely
        process.kill(pid, 0);
        return true;
    } catch {
        return false;
    }
}

function killCurrentProcessWithErrorMessage() {
    try {
        console.error("[dprint-plugin-prettier]: Parent process lost. Exiting.");
    } finally {
        process.exit(1);
    }
}

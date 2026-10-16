// @nts-check
/** @type {boolean} */ const FINISH = true;
export function addOrigRange(/** @type {any[]} */ cst) {
    if (!cst.setOrigRanges()) {
        const fn = /** @returns {boolean | undefined} */ (obj) => {
            if (isRange(obj)) {
                obj.origStart = obj.start;
                obj.origEnd = obj.end;
                return FINISH;
            }
            if (isFlowChar(obj)) {
                obj.origOffset = obj.offset;
                return FINISH;
            }
        };
        cst.forEach(document => visit(document, fn));
    }
}
function visit(obj, fn) {
    if (!obj || typeof obj !== "object") {
        return;
    }
    if (fn(obj) === FINISH) {
        return;
    }
    for (const key of Object.keys(obj)) {
        if (key === "context" || key === "error") {
            continue;
        }
        const value = obj[key];
        if (Array.isArray(value)) {
            value.forEach(x => visit(x, fn));
        }
        else {
            visit(value, fn);
        }
    }
}
/** @returns {boolean} */ function isRange(obj) {
    return typeof obj.start === "number";
}
/** @returns {boolean} */ function isFlowChar(obj) {
    return typeof obj.offset === "number";
}

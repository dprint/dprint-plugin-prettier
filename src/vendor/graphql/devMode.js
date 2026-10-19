"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.enableDevMode = enableDevMode;
exports.isDevModeEnabled = isDevModeEnabled;
const instanceOf_ts_1 = require("./jsutils/instanceOf.js");
let devMode = false;
function enableDevMode() {
    devMode = true;
    (0, instanceOf_ts_1.enableDevInstanceOf)();
}
function isDevModeEnabled() {
    return devMode;
}
//# sourceMappingURL=devMode.js.map
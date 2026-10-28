import { enableDevInstanceOf } from "./jsutils/instanceOf.mjs";
let devMode = false;
export function enableDevMode() {
    devMode = true;
    enableDevInstanceOf();
}
/** @returns {boolean} */ export function isDevModeEnabled() {
    return devMode;
}
//# sourceMappingURL=devMode.js.map
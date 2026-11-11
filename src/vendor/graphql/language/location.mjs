// @nts-check
import { invariant } from "../jsutils/invariant.mjs";
/** @type {RegExp} */ const LineRegExp = /\r\n|[\n\r]/g;
export function getLocation(/** @type {import("./source.mjs").Source} */ source, /** @type {number} */ position) {
    /** @type {number} */ let lastLineStart = 0;
    /** @type {number} */ let line = 1;
    for (const match of source.body.matchAll(LineRegExp)) {
        if (!(typeof match.index === 'number'))
            invariant(false);
        if (match.index >= position) {
            break;
        }
        lastLineStart = match.index + match[0].length;
        line += 1;
    }
    return { line, column: position + 1 - lastLineStart };
}
//# sourceMappingURL=location.js.map
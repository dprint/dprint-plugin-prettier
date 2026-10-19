"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLocation = getLocation;
const invariant_ts_1 = require("../jsutils/invariant.js");
/** @type {RegExp} */ const LineRegExp = /\r\n|[\n\r]/g;
function getLocation(source, position) {
    /** @type {number} */ let lastLineStart = 0;
    let line = 1;
    for (const match of source.body.matchAll(LineRegExp)) {
        if (!(typeof match.index === 'number'))
            (0, invariant_ts_1.invariant)(false);
        if (match.index >= position) {
            break;
        }
        lastLineStart = match.index + match[0].length;
        line += 1;
    }
    return { line, column: position + 1 - lastLineStart };
}
//# sourceMappingURL=location.js.map
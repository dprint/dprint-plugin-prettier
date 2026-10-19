"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatAST = concatAST;
const kinds_ts_1 = require("../language/kinds.js");
function concatAST(documents) {
    const definitions = [];
    for (const doc of documents) {
        definitions.push(...doc.definitions);
    }
    return { kind: kinds_ts_1.Kind.DOCUMENT, definitions };
}
//# sourceMappingURL=concatAST.js.map
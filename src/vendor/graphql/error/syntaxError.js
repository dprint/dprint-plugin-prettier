"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syntaxError = syntaxError;
const GraphQLError_ts_1 = require("./GraphQLError.js");
function syntaxError(source, position, description) {
    return new GraphQLError_ts_1.GraphQLError(`Syntax Error: ${description}`, {
        source,
        positions: [position],
    });
}
//# sourceMappingURL=syntaxError.js.map
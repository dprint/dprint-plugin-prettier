"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locatedError = locatedError;
const toError_ts_1 = require("../jsutils/toError.js");
const GraphQLError_ts_1 = require("./GraphQLError.js");
function locatedError(rawOriginalError, nodes, path) {
    const originalError = (0, toError_ts_1.toError)(rawOriginalError);
    if (isLocatedGraphQLError(originalError)) {
        return originalError;
    }
    return new GraphQLError_ts_1.GraphQLError(originalError.message, {
        nodes: originalError.nodes ?? nodes,
        source: originalError.source,
        positions: originalError.positions,
        path,
        originalError,
    });
}
function isLocatedGraphQLError(error) {
    return Array.isArray(error.path);
}
//# sourceMappingURL=locatedError.js.map
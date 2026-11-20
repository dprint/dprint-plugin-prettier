"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureGraphQLError = ensureGraphQLError;
const toError_ts_1 = require("../jsutils/toError.js");
const GraphQLError_ts_1 = require("./GraphQLError.js");
function ensureGraphQLError(rawError) {
    if (rawError instanceof GraphQLError_ts_1.GraphQLError) {
        return rawError;
    }
    const originalError = (0, toError_ts_1.toError)(rawError);
    return new GraphQLError_ts_1.GraphQLError(originalError.message, { originalError });
}
//# sourceMappingURL=ensureGraphQLError.js.map
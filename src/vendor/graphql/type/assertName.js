"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertName = assertName;
exports.assertEnumValueName = assertEnumValueName;
const GraphQLError_ts_1 = require("../error/GraphQLError.js");
const characterClasses_ts_1 = require("../language/characterClasses.js");
function assertName(name) {
    if (name.length === 0) {
        throw new GraphQLError_ts_1.GraphQLError('Expected name to be a non-empty string.');
    }
    for (let i = 1; i < name.length; ++i) {
        if (!(0, characterClasses_ts_1.isNameContinue)(name.charCodeAt(i))) {
            throw new GraphQLError_ts_1.GraphQLError(`Names must only contain [_a-zA-Z0-9] but "${name}" does not.`);
        }
    }
    if (!(0, characterClasses_ts_1.isNameStart)(name.charCodeAt(0))) {
        throw new GraphQLError_ts_1.GraphQLError(`Names must start with [_a-zA-Z] but "${name}" does not.`);
    }
    return name;
}
function assertEnumValueName(name) {
    if (name === 'true' || name === 'false' || name === 'null') {
        throw new GraphQLError_ts_1.GraphQLError(`Enum values cannot be named: ${name}`);
    }
    return assertName(name);
}
//# sourceMappingURL=assertName.js.map
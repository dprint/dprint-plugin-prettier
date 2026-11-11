"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultHarness = void 0;
const parser_ts_1 = require("./language/parser.js");
const validate_ts_1 = require("./validation/validate.js");
const execute_ts_1 = require("./execution/execute.js");
exports.defaultHarness = {
    parse: parser_ts_1.parse,
    validate: validate_ts_1.validate,
    execute: execute_ts_1.execute,
    subscribe: execute_ts_1.subscribe,
};
//# sourceMappingURL=harness.js.map
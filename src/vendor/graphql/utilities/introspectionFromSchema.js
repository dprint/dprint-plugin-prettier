"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.introspectionFromSchema = introspectionFromSchema;
const invariant_ts_1 = require("../jsutils/invariant.js");
const parser_ts_1 = require("../language/parser.js");
const execute_ts_1 = require("../execution/execute.js");
const getIntrospectionQuery_ts_1 = require("./getIntrospectionQuery.js");
function introspectionFromSchema(schema, options) {
    const optionsWithDefaults = {
        specifiedByUrl: true,
        directiveIsRepeatable: true,
        schemaDescription: true,
        inputValueDeprecation: true,
        experimentalDirectiveDeprecation: true,
        oneOf: true,
        ...options,
    };
    const document = (0, parser_ts_1.parse)((0, getIntrospectionQuery_ts_1.getIntrospectionQuery)(optionsWithDefaults));
    const result = (0, execute_ts_1.executeSync)({ schema, document });
    if (!(result.errors == null && result.data != null))
        (0, invariant_ts_1.invariant)(false);
    return result.data;
}
//# sourceMappingURL=introspectionFromSchema.js.map
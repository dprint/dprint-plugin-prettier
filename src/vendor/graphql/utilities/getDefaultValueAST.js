"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultValueAST = getDefaultValueAST;
const invariant_ts_1 = require("../jsutils/invariant.js");
const astFromValue_ts_1 = require("./astFromValue.js");
const valueToLiteral_ts_1 = require("./valueToLiteral.js");
function getDefaultValueAST(argOrInputField) {
    const type = argOrInputField.type;
    const defaultInput = argOrInputField.default;
    if (defaultInput) {
        const literal = defaultInput.literal ?? (0, valueToLiteral_ts_1.valueToLiteral)(defaultInput.value, type);
        if (!(literal != null))
            (0, invariant_ts_1.invariant)(false, 'Invalid default value');
        return literal;
    }
    const defaultValue = argOrInputField.defaultValue;
    if (defaultValue !== undefined) {
        const valueAST = (0, astFromValue_ts_1.astFromValue)(defaultValue, type);
        if (!(valueAST != null))
            (0, invariant_ts_1.invariant)(false, 'Invalid default value');
        return valueAST;
    }
    return undefined;
}
//# sourceMappingURL=getDefaultValueAST.js.map
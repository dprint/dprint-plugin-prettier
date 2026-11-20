"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVariableSignature = getVariableSignature;
const GraphQLError_ts_1 = require("../error/GraphQLError.js");
const printer_ts_1 = require("../language/printer.js");
const definition_ts_1 = require("../type/definition.js");
const typeFromAST_ts_1 = require("../utilities/typeFromAST.js");
function getVariableSignature(schema, varDefNode) {
    const varName = varDefNode.variable.name.value;
    const varType = (0, typeFromAST_ts_1.typeFromAST)(schema, varDefNode.type);
    if (!(0, definition_ts_1.isInputType)(varType)) {
        const varTypeStr = (0, printer_ts_1.print)(varDefNode.type);
        return new GraphQLError_ts_1.GraphQLError(`Variable "$${varName}" expected value of type "${varTypeStr}" which cannot be used as an input type.`, { nodes: varDefNode.type });
    }
    const defaultValue = varDefNode.defaultValue;
    return {
        name: varName,
        type: varType,
        default: defaultValue && { literal: defaultValue },
    };
}
//# sourceMappingURL=getVariableSignature.js.map
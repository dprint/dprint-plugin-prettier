"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOperationAST = getOperationAST;
const kinds_ts_1 = require("../language/kinds.js");
function getOperationAST(documentAST, operationName) {
    let operation = null;
    for (const definition of documentAST.definitions) {
        if (definition.kind === kinds_ts_1.Kind.OPERATION_DEFINITION) {
            if (operationName == null) {
                if (operation) {
                    return null;
                }
                operation = definition;
            }
            else if (definition.name?.value === operationName) {
                return definition;
            }
        }
    }
    return operation;
}
//# sourceMappingURL=getOperationAST.js.map
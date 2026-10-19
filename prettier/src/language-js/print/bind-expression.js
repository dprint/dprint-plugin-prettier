import { group, indent, softline } from "../../document/index.js";

/** @import AstPath from "../../common/ast-path.js" */

function printBindExpression(path, options, print) {
  return [
    print("object"),
    group(indent([softline, printBindExpressionCallee(path, options, print)])),
  ];
}

/** @returns {any[]} */ function printBindExpressionCallee(/** @type {AstPath} */ path, options, /** @type {(a0?: any) => any} */ print) {
  return ["::", print("callee")];
}

export { printBindExpression, printBindExpressionCallee };

import { group, indent, softline } from "../../document/index.js";

/** @import AstPath from "../../common/ast-path.js" */

function printBindExpression(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  return [
    print("object"),
    group(indent([softline, printBindExpressionCallee(path, options, print)])),
  ];
}

/** @returns {any[]} */ function printBindExpressionCallee(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  return ["::", print("callee")];
}

export { printBindExpression, printBindExpressionCallee };

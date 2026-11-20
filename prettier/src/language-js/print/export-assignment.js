// @nts-check
/** @returns {import("../../document/index.js").Doc[]} */ function printExportAssignment(/** @type {import("../../common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  return [
    "export = ",
    print("expression"),
    path.node.expression.type === "DeclareFunction"
      ? ""
      : printSemicolon(options),
  ];
}

import { printSemicolon } from "./miscellaneous.js";
export { printExportAssignment };

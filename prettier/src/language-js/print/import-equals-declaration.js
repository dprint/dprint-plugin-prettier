// @nts-check
import { printSemicolon } from "./miscellaneous.js";
import { printImportKind } from "./module.js";

/** @returns {import("../../document/index.js").Doc[]} */ function printImportEqualsDeclaration(/** @type {import("../../common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  return [
    node.type === "ImportEqualsDeclaration" && node.isExport ? "export " : "",
    "import ",
    printImportKind(node, /* spaceBeforeKind */ false),
    print("id"),
    " = ",
    print("moduleReference"),
    printSemicolon(options),
  ];
}

export { printImportEqualsDeclaration };

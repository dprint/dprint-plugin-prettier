// @nts-check
import { printSemicolon } from "./miscellaneous.js";

/*
- `TSNamespaceExportDeclaration` (TypeScript)
- `NamespaceExportDeclaration` (Flow)
*/
/** @returns {import("../../document/index.js").Doc[]} */ function printNamespaceExportDeclaration(/** @type {import("../../common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  return ["export as namespace ", print("id"), printSemicolon(options)];
}

export { printNamespaceExportDeclaration };

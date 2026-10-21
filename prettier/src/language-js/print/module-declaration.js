import { group } from "../../document/index.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

/*
- `TSModuleDeclaration` (TypeScript)
*/
function printModuleDeclaration(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  return [
    printDeclareToken(path),
    node.kind === "global" ? "" : `${node.kind} `,
    print("id"),
    node.body ? [" ", group(print("body"))] : printSemicolon(options),
  ];
}

export { printModuleDeclaration };

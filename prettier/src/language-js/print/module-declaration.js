import { group } from "../../document/index.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

function printModuleDeclarationKind(node) {
  if (node.type === "DeclareModule") {
    return "module";
  }

  if (node.type === "DeclareNamespace") {
    return node.global ? "" : (node.keyword ?? "namespace");
  }

  if (node.type === "TSModuleDeclaration") {
    return node.kind === "global" ? "" : node.kind;
  }
}

/*
- `TSModuleDeclaration` (TypeScript)
- `DeclareModule` (Flow)
- `DeclareNamespace` (Flow)
*/
function printModuleDeclaration(/** @type {import("../../../../prettier/src/common/ast-path.js").default} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  const kind = printModuleDeclarationKind(node);

  return [
    printDeclareToken(path),
    kind ? `${kind} ` : "",
    print("id"),
    node.body ? [" ", group(print("body"))] : printSemicolon(options),
  ];
}

export { printModuleDeclaration };

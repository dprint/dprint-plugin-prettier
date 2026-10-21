import { printAssignment } from "./assignment.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
- `DeclareTypeAlias`(flow)
- `TypeAlias`(flow)
- `TSTypeAliasDeclaration`(TypeScript)
*/
/** @returns {any[]} */ function printTypeAlias(/** @type {AstPath} */ path, options, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print) {
  const { node } = path;
  const parts = [
    printDeclareToken(path),
    "type ",
    print("id"),
    print("typeParameters"),
  ];

  /** @type {string} */ const rightPropertyName =
    node.type === "TSTypeAliasDeclaration" ? "typeAnnotation" : "right";
  return [
    printAssignment(path, options, print, parts, " =", rightPropertyName),
    printSemicolon(options),
  ];
}

export { printTypeAlias };

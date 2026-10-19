import { printAssignment } from "./assignment.js";
import { printDeclareToken, printSemicolon } from "./miscellaneous.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
- `DeclareTypeAlias`(flow)
- `TypeAlias`(flow)
- `TSTypeAliasDeclaration`(TypeScript)
*/
/** @returns {any[]} */ function printTypeAlias(/** @type {AstPath} */ path, options, print) {
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

import { printOptionalToken } from "./miscellaneous.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
- `TSIndexedAccessType`(TypeScript)
- `IndexedAccessType`(flow)
- `OptionalIndexedAccessType`(flow)
*/
/** @returns {any[]} */ function printIndexedAccessType(/** @type {AstPath} */ path, options, /** @type {(a0?: any) => any} */ print) {
  return [
    print("objectType"),
    printOptionalToken(path),
    "[",
    print("indexType"),
    "]",
  ];
}

export { printIndexedAccessType };

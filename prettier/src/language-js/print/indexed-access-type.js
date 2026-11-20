import { printOptionalToken } from "./miscellaneous.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
- `TSIndexedAccessType`(TypeScript)
- `IndexedAccessType`(flow)
- `OptionalIndexedAccessType`(flow)
*/
/** @returns {any[]} */ function printIndexedAccessType(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  return [
    print("objectType"),
    printOptionalToken(path),
    "[",
    print("indexType"),
    "]",
  ];
}

export { printIndexedAccessType };

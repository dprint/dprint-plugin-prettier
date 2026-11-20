import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @import AstPath from "../../common/ast-path.js" */

// `TSJSDocNullableType`, `TSJSDocNonNullableType`
/** @returns {any[]} */ function printJSDocType(/** @type {AstPath} */ path, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrint} */ print, /** @type {string} */ token) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;
  return [
    node.postfix ? "" : token,
    printTypeAnnotationProperty(path, print),
    node.postfix ? token : "",
  ];
}

export { printJSDocType };

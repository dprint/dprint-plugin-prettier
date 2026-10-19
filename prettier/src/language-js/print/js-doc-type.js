import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @import AstPath from "../../common/ast-path.js" */

// `TSJSDocNullableType`, `TSJSDocNonNullableType`
/** @returns {any[]} */ function printJSDocType(/** @type {AstPath} */ path, print, /** @type {string} */ token) {
  const { node } = path;
  return [
    node.postfix ? "" : token,
    printTypeAnnotationProperty(path, print),
    node.postfix ? token : "",
  ];
}

export { printJSDocType };

/** @import AstPath from "../../common/ast-path.js" */

/*
- `TSInferType`(TypeScript)
- `InferTypeAnnotation`(flow)
*/
/** @returns {any[]} */ function printInferType(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
  return ["infer ", print("typeParameter")];
}

export { printInferType };

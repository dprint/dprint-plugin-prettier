/** @import AstPath from "../../common/ast-path.js" */

/*
- `TSInferType`(TypeScript)
- `InferTypeAnnotation`(flow)
*/
/** @returns {any[]} */ function printInferType(/** @type {AstPath} */ path, options, /** @type {(a0?: any) => any} */ print) {
  return ["infer ", print("typeParameter")];
}

export { printInferType };

// @nts-check
/*
- `TSTypeQuery` (TypeScript)
- `TypeofTypeAnnotation` (flow)
*/
/** @returns {any[]} */ function printTypeQuery(/** @type {import("../../common/ast-path.js").default & { node: import("../types/estree.js").Node }} */ { node }, /** @type {import("../print-options.js").JsPrint} */ print) {
  /** @type {string} */ const argumentPropertyName =
    node.type === "TSTypeQuery" ? "exprName" : "argument";
  return ["typeof ", print(argumentPropertyName), print("typeArguments")];
}

export { printTypeQuery };

// @nts-check
/*
- `TSTypeQuery` (TypeScript)
- `TypeofTypeAnnotation` (flow)
*/
/** @returns {any[]} */ function printTypeQuery(/** @type {import("../../common/ast-path.js").default} */ { node }, /** @type {(a0?: any) => any} */ print) {
  /** @type {string} */ const argumentPropertyName =
    node.type === "TSTypeQuery" ? "exprName" : "argument";
  return ["typeof ", print(argumentPropertyName), print("typeArguments")];
}

export { printTypeQuery };

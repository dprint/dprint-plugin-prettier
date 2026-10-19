/*
- `TSTypeQuery` (TypeScript)
- `TypeofTypeAnnotation` (flow)
*/
/** @returns {any[]} */ function printTypeQuery({ node }, /** @type {(a0?: any) => any} */ print) {
  /** @type {string} */ const argumentPropertyName =
    node.type === "TSTypeQuery" ? "exprName" : "argument";
  return ["typeof ", print(argumentPropertyName), print("typeArguments")];
}

export { printTypeQuery };

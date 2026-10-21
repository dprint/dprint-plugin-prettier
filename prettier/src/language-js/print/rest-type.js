/** @import AstPath from "../../common/ast-path.js" */

/*
- `TSRestType`(TypeScript)
- `TupleTypeSpreadElement`(flow)
*/
/** @returns {any[]} */ function printRestType(/** @type {AstPath} */ path, options, /** @type {(a0?: any) => any} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  return [
    "...",
    ...(node.type === "TupleTypeSpreadElement" && node.label
      ? [print("label"), ": "]
      : []),
    print("typeAnnotation"),
  ];
}

export { printRestType };

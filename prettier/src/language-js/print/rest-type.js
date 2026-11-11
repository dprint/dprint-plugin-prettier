/** @import AstPath from "../../common/ast-path.js" */

/*
- `TSRestType`(TypeScript)
- `TupleTypeSpreadElement`(flow)
*/
/** @returns {any[]} */ function printRestType(/** @type {AstPath} */ path, /** @type {import("../print-options.js").JsPrintOptions} */ options, /** @type {import("../print-options.js").JsPrint} */ print) {
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

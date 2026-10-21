/** @import AstPath from "../../common/ast-path.js" */

/*
- `TSNamedTupleMember`(TypeScript)
- `TupleTypeLabeledElement`(flow)
*/
/** @returns {any[]} */ function printNamedTupleMember(/** @type {AstPath} */ path, options, /** @type {(a0?: any) => any} */ print) {
  /** @type {{ node: import("../types/estree.js").Node }} */ const { node } = path;

  return [
    // `TupleTypeLabeledElement` only
    node.variance ? print("variance") : "",
    print("label"),
    node.optional ? "?" : "",
    ": ",
    print("elementType"),
  ];
}

export { printNamedTupleMember };

import { printTypeAnnotationProperty } from "./type-annotation.js";

/** @import AstPath from "../../common/ast-path.js" */

/*
- `TSTypePredicate` (TypeScript)
- `TypePredicate` (flow)
*/
/** @returns {any[]} */ function printTypePredicate(/** @type {AstPath} */ path, print) {
  const { node } = path;
  const prefix =
    node.type === "TSTypePredicate" && node.asserts
      ? "asserts "
      : node.type === "TypePredicate" && node.kind
        ? `${node.kind} `
        : "";
  return [
    prefix,
    print("parameterName"),
    node.typeAnnotation
      ? [" is ", printTypeAnnotationProperty(path, print)]
      : "",
  ];
}

export { printTypePredicate };

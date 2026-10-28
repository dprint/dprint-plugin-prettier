import { hasSameLocStart } from "../location/index.js";

// Hack to differentiate between the following two which have the same AST
// declare function f(a): void;
// var f: (a) => void;
/** @returns {boolean} */ function isTypeAnnotationAFunction(/** @type {import("../types/estree.js").Node} */ node) {
  return (
    (node.type === "TypeAnnotation" || node.type === "TSTypeAnnotation") &&
    node.typeAnnotation.type === "FunctionTypeAnnotation" &&
    !node.static &&
    !hasSameLocStart(node, node.typeAnnotation)
  );
}

export { isTypeAnnotationAFunction };

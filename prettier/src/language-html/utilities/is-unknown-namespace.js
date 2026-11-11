// @nts-check
/** @returns {boolean} */ function isUnknownNamespace(/** @type {import("../parse/ast.js").Node | import("../../../../src/vendor/angular-html-parser/dist/compiler/src/ml_parser/ast.mjs").Element} */ node) {
  return (
    node.kind === "element" &&
    !node.hasExplicitNamespace &&
    !["html", "svg"].includes(node.namespace)
  );
}

export default isUnknownNamespace;

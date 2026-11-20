// @nts-check
//#region src/ast-transform/transforms/transform-ast-with-source.ts
const visitASTWithSource = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").ASTWithSource} */ node, /** @type {import("../ast-transformer.js").AstTransformer} */ transformer) => transformer.transformChild(node.ast);
//#endregion
export { visitASTWithSource };

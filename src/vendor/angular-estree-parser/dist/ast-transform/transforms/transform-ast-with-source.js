// @nts-check
//#region src/ast-transform/transforms/transform-ast-with-source.ts
const visitASTWithSource = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").ASTWithSource} */ node, transformer) => transformer.transformChild(node.ast);
//#endregion
export { visitASTWithSource };

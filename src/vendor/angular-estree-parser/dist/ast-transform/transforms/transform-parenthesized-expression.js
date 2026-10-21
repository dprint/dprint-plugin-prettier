// @nts-check
//#region src/ast-transform/transforms/transform-parenthesized-expression.ts
const visitParenthesizedExpression = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").ParenthesizedExpression} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => transformer.transformChild(node.expression);
//#endregion
export { visitParenthesizedExpression };

// @nts-check
//#region src/ast-transform/transforms/transform-parenthesized-expression.ts
const visitParenthesizedExpression = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").ParenthesizedExpression} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => transformer.transformChild(node.expression);
//#endregion
export { visitParenthesizedExpression };

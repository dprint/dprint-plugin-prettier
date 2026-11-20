// @nts-check
//#region src/ast-transform/transforms/transform-empty-expression.ts
const visitEmptyExpr = /** @returns {import("../../source.js").NGNode} */ () => ({ type: "NGEmptyExpression" });
//#endregion
export { visitEmptyExpr };

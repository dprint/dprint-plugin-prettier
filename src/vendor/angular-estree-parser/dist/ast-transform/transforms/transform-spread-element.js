// @nts-check
//#region src/ast-transform/transforms/transform-spread-element.ts
const visitSpreadElement = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").SpreadElement} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "SpreadElement",
	argument: transformer.transformChild(node.expression)
});
//#endregion
export { visitSpreadElement };

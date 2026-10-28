// @nts-check
//#region src/ast-transform/transforms/transform-spread-element.ts
const visitSpreadElement = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").SpreadElement} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => ({
	type: "SpreadElement",
	argument: transformer.transformChild(node.expression)
});
//#endregion
export { visitSpreadElement };

// @nts-check
//#region src/ast-transform/transforms/transform-spread-element.ts
const visitSpreadElement = (/** @type {import("../../../../../../prettier/node_modules/@angular/compiler/fesm2022/compiler.mjs").SpreadElement} */ node, transformer) => ({
	type: "SpreadElement",
	argument: transformer.transformChild(node.expression)
});
//#endregion
export { visitSpreadElement };

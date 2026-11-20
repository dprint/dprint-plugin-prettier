// @nts-check
//#region src/ast-transform/transforms/transform-interpolation.ts
const visitInterpolation = /** @returns {import("../../source.js").NGNode} */ (/** @type {import("@angular/compiler").Interpolation} */ node, /** @type {import("../node-transformer.js").NodeTransformer} */ transformer) => {
	const { expressions } = node;
	/* c8 ignore next 3 @preserve */
	if (expressions.length !== 1) throw new Error("Unexpected 'Interpolation'");
	return transformer.transformChild(expressions[0]);
};
//#endregion
export { visitInterpolation };

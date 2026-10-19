//#region src/ast-transform/transforms/transform-interpolation.ts
const visitInterpolation = (node, transformer) => {
	const { expressions } = node;
	/* c8 ignore next 3 @preserve */
	if (expressions.length !== 1) throw new Error("Unexpected 'Interpolation'");
	return transformer.transformChild(expressions[0]);
};
//#endregion
export { visitInterpolation };

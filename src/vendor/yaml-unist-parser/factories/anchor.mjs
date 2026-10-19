// @nts-check
//#region src/factories/anchor.ts
function createAnchor(position, /** @type {string} */ value) {
	return {
		type: "anchor",
		position,
		value
	};
}
//#endregion
export { createAnchor };

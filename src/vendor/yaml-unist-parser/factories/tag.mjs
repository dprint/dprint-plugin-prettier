// @nts-check
//#region src/factories/tag.ts
function createTag(position, /** @type {string} */ value) {
	return {
		type: "tag",
		position,
		value
	};
}
//#endregion
export { createTag };

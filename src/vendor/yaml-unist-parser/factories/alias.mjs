// @nts-check
//#region src/factories/alias.ts
function createAlias(position, content, /** @type {string} */ value) {
	return {
		type: "alias",
		position,
		leadingComments: [],
		trailingComment: null,
		...content,
		value
	};
}
//#endregion
export { createAlias };

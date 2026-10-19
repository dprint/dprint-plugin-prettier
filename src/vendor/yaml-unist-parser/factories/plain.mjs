// @nts-check
//#region src/factories/plain.ts
function createPlain(position, content, /** @type {string} */ value) {
	return {
		type: "plain",
		position,
		leadingComments: [],
		trailingComment: null,
		...content,
		value
	};
}
//#endregion
export { createPlain };

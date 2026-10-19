// @nts-check
//#region src/factories/sequence.ts
function createSequence(position, content, /** @type {any[]} */ children) {
	return {
		type: "sequence",
		position,
		leadingComments: [],
		endComments: [],
		...content,
		children
	};
}
//#endregion
export { createSequence };

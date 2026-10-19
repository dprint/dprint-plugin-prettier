// @nts-check
//#region src/factories/mapping.ts
function createMapping(position, content, /** @type {any[]} */ children) {
	return {
		type: "mapping",
		position,
		leadingComments: [],
		...content,
		children
	};
}
//#endregion
export { createMapping };

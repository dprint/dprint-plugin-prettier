// @nts-check
//#region src/factories/directive.ts
function createDirective(position, /** @type {string} */ name, /** @type {any[]} */ parameters) {
	return {
		type: "directive",
		position,
		leadingComments: [],
		trailingComment: null,
		name,
		parameters
	};
}
//#endregion
export { createDirective };

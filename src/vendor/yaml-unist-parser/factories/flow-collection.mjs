// @nts-check
//#region src/factories/flow-collection.ts
function createFlowCollection(position, content, /** @type {any[]} */ children) {
	return {
		type: "flowCollection",
		position,
		leadingComments: [],
		trailingComment: null,
		endComments: [],
		...content,
		children
	};
}
//#endregion
export { createFlowCollection };

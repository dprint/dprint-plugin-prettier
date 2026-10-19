// @nts-check
//#region src/factories/document-head.ts
function createDocumentHead(position, /** @type {any[]} */ children, /** @type {any[]} */ endComments, trailingComment) {
	return {
		type: "documentHead",
		position,
		endComments,
		trailingComment,
		children
	};
}
//#endregion
export { createDocumentHead };

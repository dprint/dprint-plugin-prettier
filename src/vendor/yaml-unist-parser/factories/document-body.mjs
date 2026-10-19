// @nts-check
//#region src/factories/document-body.ts
function createDocumentBody(position, content, /** @type {any[]} */ endComments) {
	return {
		type: "documentBody",
		position,
		endComments,
		children: !content ? [] : [content]
	};
}
//#endregion
export { createDocumentBody };

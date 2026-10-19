// @nts-check
//#region src/factories/document.ts
function createDocument(position, /** @type {boolean} */ directivesEndMarker, /** @type {boolean} */ documentEndMarker, head, body, trailingComment) {
	return {
		type: "document",
		position,
		trailingComment,
		directivesEndMarker,
		documentEndMarker,
		children: [head, body]
	};
}
//#endregion
export { createDocument };

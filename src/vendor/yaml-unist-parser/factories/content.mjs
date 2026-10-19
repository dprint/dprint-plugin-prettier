// @nts-check
//#region src/factories/content.ts
function createContent(tag, anchor, /** @type {any[]} */ middleComments) {
	return {
		anchor,
		tag,
		middleComments
	};
}
//#endregion
export { createContent };

// @nts-check
//#region src/utils/get-last.ts
/** @returns {object | import("../../yaml/browser/dist/nodes/Pair.js").Pair | undefined} */ function getLast(/** @type {any[]} */ array) {
	return array[array.length - 1];
}
//#endregion
export { getLast };

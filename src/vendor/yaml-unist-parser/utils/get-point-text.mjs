//#region src/utils/get-point-text.ts
// istanbul ignore next -- @preserve
/** @returns {string} */ function getPointText(/** @type {import("yaml-unist-types").Point} */ point) {
	return `${point.line}:${point.column}`;
}
//#endregion
export { getPointText };

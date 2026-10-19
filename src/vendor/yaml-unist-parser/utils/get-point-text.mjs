//#region src/utils/get-point-text.ts
// istanbul ignore next -- @preserve
function getPointText(point) {
	return `${point.line}:${point.column}`;
}
//#endregion
export { getPointText };

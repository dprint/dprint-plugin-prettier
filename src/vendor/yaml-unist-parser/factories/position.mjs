//#region src/factories/position.ts
function createPosition(start, end) {
	return {
		start,
		end
	};
}
function createEmptyPosition(point) {
	return {
		start: point,
		end: point
	};
}
//#endregion
export { createEmptyPosition, createPosition };

// @nts-check
/** @import { Point, Position } from "yaml-unist-types" */
//#region src/factories/position.ts
/** @returns {Position} */ function createPosition(/** @type {Point} */ start, /** @type {Point} */ end) {
	return {
		start,
		end
	};
}
/** @returns {Position} */ function createEmptyPosition(/** @type {Point} */ point) {
	return {
		start: point,
		end: point
	};
}
//#endregion
export { createEmptyPosition, createPosition };

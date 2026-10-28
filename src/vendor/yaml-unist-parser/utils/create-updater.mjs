// @nts-check
/** @import { Position, Point } from "../transforms/context.mjs" */
//#region src/utils/create-updater.ts
/** @returns {(value: Point) => void} */ function createUpdater(/** @type {Position} */ host, /** @type {(host: Position) => Point} */ getter, /** @type {(host: Position, value: Point) => void} */ setter, /** @type {(reduced: Point, value: Point) => boolean} */ shouldUpdate) {
	let reduced = getter(host);
	return (value) => {
		if (shouldUpdate(reduced, value)) setter(host, reduced = value);
	};
}
//#endregion
export { createUpdater };

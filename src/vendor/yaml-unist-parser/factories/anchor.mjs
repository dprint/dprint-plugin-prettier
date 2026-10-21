// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/anchor.ts
/** @returns {YamlNode} */ function createAnchor(/** @type {Position} */ position, /** @type {string} */ value) {
	return {
		type: "anchor",
		position,
		value
	};
}
//#endregion
export { createAnchor };

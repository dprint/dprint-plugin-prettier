// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/tag.ts
/** @returns {YamlNode} */ function createTag(/** @type {Position} */ position, /** @type {string} */ value) {
	return {
		type: "tag",
		position,
		value
	};
}
//#endregion
export { createTag };

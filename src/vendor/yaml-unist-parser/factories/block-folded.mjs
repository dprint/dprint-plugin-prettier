// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/block-folded.ts
/** @returns {YamlNode} */ function createBlockFolded(/** @type {YamlNode} */ blockValue) {
	return {
		...blockValue,
		type: "blockFolded"
	};
}
//#endregion
export { createBlockFolded };

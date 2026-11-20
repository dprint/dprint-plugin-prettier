// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/mapping.ts
/** @returns {YamlNode} */ function createMapping(/** @type {Position} */ position, /** @type {Content} */ content, /** @type {YamlNode[]} */ children) {
	return {
		type: "mapping",
		position,
		leadingComments: [],
		...content,
		children
	};
}
//#endregion
export { createMapping };

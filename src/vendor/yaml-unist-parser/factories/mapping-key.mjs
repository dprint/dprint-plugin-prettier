// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/mapping-key.ts
/** @returns {YamlNode} */ function createMappingKey(/** @type {Position} */ position, /** @type {YamlNode | null} */ content) {
	return {
		type: "mappingKey",
		position,
		trailingComment: null,
		endComments: [],
		children: !content ? [] : [content]
	};
}
//#endregion
export { createMappingKey };

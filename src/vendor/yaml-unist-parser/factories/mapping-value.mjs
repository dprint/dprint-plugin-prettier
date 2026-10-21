// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/mapping-value.ts
/** @returns {YamlNode} */ function createMappingValue(/** @type {Position} */ position, /** @type {YamlNode | null} */ content) {
	return {
		type: "mappingValue",
		position,
		leadingComments: [],
		trailingComment: null,
		endComments: [],
		children: !content ? [] : [content]
	};
}
//#endregion
export { createMappingValue };

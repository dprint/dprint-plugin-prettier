// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/mapping-item.ts
/** @returns {YamlNode} */ function createMappingItem(/** @type {Position} */ position, /** @type {YamlNode} */ key, /** @type {YamlNode} */ value) {
	return {
		type: "mappingItem",
		position,
		leadingComments: [],
		children: [key, value]
	};
}
//#endregion
export { createMappingItem };

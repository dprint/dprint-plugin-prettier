// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/flow-mapping-item.ts
/** @returns {YamlNode} */ function createFlowMappingItem(/** @type {Position} */ position, /** @type {YamlNode} */ key, /** @type {YamlNode} */ value) {
	return {
		type: "flowMappingItem",
		position,
		leadingComments: [],
		children: [key, value]
	};
}
//#endregion
export { createFlowMappingItem };

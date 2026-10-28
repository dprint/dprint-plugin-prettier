// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/flow-collection.ts
/** @returns {YamlNode} */ function createFlowCollection(/** @type {Position} */ position, /** @type {Content} */ content, /** @type {YamlNode[]} */ children) {
	return {
		type: "flowCollection",
		position,
		leadingComments: [],
		trailingComment: null,
		endComments: [],
		...content,
		children
	};
}
//#endregion
export { createFlowCollection };

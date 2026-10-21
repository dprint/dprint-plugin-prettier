// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/flow-sequence-item.ts
/** @returns {YamlNode} */ function createFlowSequenceItem(/** @type {Position} */ position, /** @type {YamlNode | null} */ content) {
	return {
		type: "flowSequenceItem",
		position,
		children: [content]
	};
}
//#endregion
export { createFlowSequenceItem };

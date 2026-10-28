// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/sequence-item.ts
/** @returns {YamlNode} */ function createSequenceItem(/** @type {Position} */ position, /** @type {YamlNode | null} */ content) {
	return {
		type: "sequenceItem",
		position,
		leadingComments: [],
		trailingComment: null,
		endComments: [],
		children: !content ? [] : [content]
	};
}
//#endregion
export { createSequenceItem };

// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/sequence.ts
/** @returns {YamlNode} */ function createSequence(/** @type {Position} */ position, /** @type {Content} */ content, /** @type {YamlNode[]} */ children) {
	return {
		type: "sequence",
		position,
		leadingComments: [],
		endComments: [],
		...content,
		children
	};
}
//#endregion
export { createSequence };

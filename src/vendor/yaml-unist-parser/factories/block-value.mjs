// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/block-value.ts
/** @returns {YamlNode} */ function createBlockValue(/** @type {Position} */ position, /** @type {Content} */ content, /** @type {string} */ chomping, /** @type {number | null} */ indent, /** @type {string} */ value, /** @type {YamlNode | null} */ indicatorComment) {
	return {
		type: "blockValue",
		position,
		leadingComments: [],
		...content,
		chomping,
		indent,
		value,
		indicatorComment
	};
}
//#endregion
export { createBlockValue };

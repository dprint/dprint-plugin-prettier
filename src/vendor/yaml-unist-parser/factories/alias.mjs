// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/alias.ts
/** @returns {YamlNode} */ function createAlias(/** @type {Position} */ position, /** @type {Content} */ content, /** @type {string} */ value) {
	return {
		type: "alias",
		position,
		leadingComments: [],
		trailingComment: null,
		...content,
		value
	};
}
//#endregion
export { createAlias };

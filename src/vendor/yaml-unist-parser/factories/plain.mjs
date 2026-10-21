// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/plain.ts
/** @returns {YamlNode} */ function createPlain(/** @type {Position} */ position, /** @type {Content} */ content, /** @type {string} */ value) {
	return {
		type: "plain",
		position,
		leadingComments: [],
		trailingComment: null,
		...content,
		value
	};
}
//#endregion
export { createPlain };

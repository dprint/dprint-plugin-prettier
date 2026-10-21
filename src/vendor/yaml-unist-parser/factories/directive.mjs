// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/directive.ts
/** @returns {YamlNode} */ function createDirective(/** @type {Position} */ position, /** @type {string} */ name, /** @type {any[]} */ parameters) {
	return {
		type: "directive",
		position,
		leadingComments: [],
		trailingComment: null,
		name,
		parameters
	};
}
//#endregion
export { createDirective };

// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/document.ts
/** @returns {YamlNode} */ function createDocument(/** @type {Position} */ position, /** @type {boolean} */ directivesEndMarker, /** @type {boolean} */ documentEndMarker, /** @type {YamlNode} */ head, /** @type {YamlNode} */ body, /** @type {YamlNode | null} */ trailingComment) {
	return {
		type: "document",
		position,
		trailingComment,
		directivesEndMarker,
		documentEndMarker,
		children: [head, body]
	};
}
//#endregion
export { createDocument };

// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/document-head.ts
/** @returns {YamlNode} */ function createDocumentHead(/** @type {Position} */ position, /** @type {YamlNode[]} */ children, /** @type {YamlNode[]} */ endComments, /** @type {YamlNode | null} */ trailingComment) {
	return {
		type: "documentHead",
		position,
		endComments,
		trailingComment,
		children
	};
}
//#endregion
export { createDocumentHead };

// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/document-body.ts
/** @returns {YamlNode} */ function createDocumentBody(/** @type {Position} */ position, /** @type {YamlNode | null} */ content, /** @type {YamlNode[]} */ endComments) {
	return {
		type: "documentBody",
		position,
		endComments,
		children: !content ? [] : [content]
	};
}
//#endregion
export { createDocumentBody };

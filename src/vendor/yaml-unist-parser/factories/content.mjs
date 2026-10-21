// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/content.ts
/** @returns {Content} */ function createContent(/** @type {YamlNode | null} */ tag, /** @type {YamlNode | null} */ anchor, /** @type {YamlNode[]} */ middleComments) {
	return {
		anchor,
		tag,
		middleComments
	};
}
//#endregion
export { createContent };

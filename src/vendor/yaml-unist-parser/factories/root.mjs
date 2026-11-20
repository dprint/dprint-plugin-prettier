// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/root.ts
/** @returns {YamlNode} */ function createRoot(/** @type {Position} */ position, /** @type {YamlNode[] | undefined} */ children, /** @type {YamlNode[] | undefined} */ comments) {
	return {
		type: "root",
		position,
		children,
		comments
	};
}
//#endregion
export { createRoot };

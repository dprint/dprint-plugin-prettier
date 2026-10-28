// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
//#region src/factories/block-literal.ts
/** @returns {YamlNode} */ function createBlockLiteral(/** @type {YamlNode} */ blockValue) {
	return {
		...blockValue,
		type: "blockLiteral"
	};
}
//#endregion
export { createBlockLiteral };

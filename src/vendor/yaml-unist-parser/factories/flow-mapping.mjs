// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
import { createFlowCollection } from "./flow-collection.mjs";
//#region src/factories/flow-mapping.ts
/** @returns {YamlNode} */ function createFlowMapping(/** @type {Position} */ position, /** @type {Content} */ content, /** @type {YamlNode[]} */ children) {
	return {
		...createFlowCollection(position, content, children),
		type: "flowMapping"
	};
}
//#endregion
export { createFlowMapping };

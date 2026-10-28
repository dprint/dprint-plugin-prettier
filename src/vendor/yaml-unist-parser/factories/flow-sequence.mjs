// @nts-check
/** @import { Position, YamlNode, Content } from "yaml-unist-types" */
import { createFlowCollection } from "./flow-collection.mjs";
//#region src/factories/flow-sequence.ts
/** @returns {YamlNode} */ function createFlowSequence(/** @type {Position} */ position, /** @type {Content} */ content, /** @type {YamlNode[]} */ children) {
	return {
		...createFlowCollection(position, content, children),
		type: "flowSequence"
	};
}
//#endregion
export { createFlowSequence };

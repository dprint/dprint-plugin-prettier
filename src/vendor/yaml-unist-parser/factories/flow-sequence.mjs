// @nts-check
import { createFlowCollection } from "./flow-collection.mjs";
//#region src/factories/flow-sequence.ts
function createFlowSequence(position, content, /** @type {any[]} */ children) {
	return {
		...createFlowCollection(position, content, children),
		type: "flowSequence"
	};
}
//#endregion
export { createFlowSequence };

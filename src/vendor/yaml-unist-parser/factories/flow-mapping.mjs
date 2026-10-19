// @nts-check
import { createFlowCollection } from "./flow-collection.mjs";
//#region src/factories/flow-mapping.ts
function createFlowMapping(position, content, /** @type {any[]} */ children) {
	return {
		...createFlowCollection(position, content, children),
		type: "flowMapping"
	};
}
//#endregion
export { createFlowMapping };

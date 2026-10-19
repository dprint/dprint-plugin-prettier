//#region src/factories/flow-mapping-item.ts
function createFlowMappingItem(position, key, value) {
	return {
		type: "flowMappingItem",
		position,
		leadingComments: [],
		children: [key, value]
	};
}
//#endregion
export { createFlowMappingItem };

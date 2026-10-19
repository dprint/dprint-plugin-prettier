//#region src/factories/mapping-item.ts
function createMappingItem(position, key, value) {
	return {
		type: "mappingItem",
		position,
		leadingComments: [],
		children: [key, value]
	};
}
//#endregion
export { createMappingItem };

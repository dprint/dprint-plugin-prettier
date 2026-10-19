//#region src/factories/mapping-key.ts
function createMappingKey(position, content) {
	return {
		type: "mappingKey",
		position,
		trailingComment: null,
		endComments: [],
		children: !content ? [] : [content]
	};
}
//#endregion
export { createMappingKey };

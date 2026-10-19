//#region src/factories/mapping-value.ts
function createMappingValue(position, content) {
	return {
		type: "mappingValue",
		position,
		leadingComments: [],
		trailingComment: null,
		endComments: [],
		children: !content ? [] : [content]
	};
}
//#endregion
export { createMappingValue };

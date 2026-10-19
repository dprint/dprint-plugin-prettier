//#region src/factories/sequence-item.ts
function createSequenceItem(position, content) {
	return {
		type: "sequenceItem",
		position,
		leadingComments: [],
		trailingComment: null,
		endComments: [],
		children: !content ? [] : [content]
	};
}
//#endregion
export { createSequenceItem };

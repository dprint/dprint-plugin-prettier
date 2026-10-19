//#region src/factories/flow-sequence-item.ts
function createFlowSequenceItem(position, content) {
	return {
		type: "flowSequenceItem",
		position,
		children: [content]
	};
}
//#endregion
export { createFlowSequenceItem };

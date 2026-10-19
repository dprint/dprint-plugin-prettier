//#region src/factories/block-folded.ts
function createBlockFolded(blockValue) {
	return {
		...blockValue,
		type: "blockFolded"
	};
}
//#endregion
export { createBlockFolded };

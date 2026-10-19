//#region src/factories/block-literal.ts
function createBlockLiteral(blockValue) {
	return {
		...blockValue,
		type: "blockLiteral"
	};
}
//#endregion
export { createBlockLiteral };

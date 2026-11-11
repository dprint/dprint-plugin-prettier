//#region src/ast-transform/visitor-keys.ts
const visitorKeys = {
	NGChainedExpression: ["expressions"],
	NGEmptyExpression: [],
	NGPipeExpression: [
		"left",
		"right",
		"arguments"
	]
};
//#endregion
export { visitorKeys };

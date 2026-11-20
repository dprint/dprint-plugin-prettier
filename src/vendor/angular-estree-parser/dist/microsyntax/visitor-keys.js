//#region src/microsyntax/visitor-keys.ts
const visitorKeys = {
	NGMicrosyntax: ["body"],
	NGMicrosyntaxAs: ["key", "alias"],
	NGMicrosyntaxExpression: ["expression", "alias"],
	NGMicrosyntaxKey: [],
	NGMicrosyntaxKeyedExpression: ["key", "expression"],
	NGMicrosyntaxLet: ["key", "value"]
};
//#endregion
export { visitorKeys };

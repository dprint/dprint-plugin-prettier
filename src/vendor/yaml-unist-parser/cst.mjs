// @nts-check
//#region src/cst.ts
/**
* Generator to iterate over tokens, skipping space and newline tokens.
*/
function* tokens(...tokensArgs) {
	for (const tokens of tokensArgs) {
		if (!tokens) continue;
		for (const token of tokens) {
			if (isSpace(token)) continue;
			yield token;
		}
	}
}
/**
* Type guard to check if a token is a space or newline token.
* @returns {boolean}
*/
function isSpace(token) {
	return token.type === "space" || token.type === "newline";
}
/**
* Type guard to check if a token is a content property token (comment, tag, or anchor).
* @returns {boolean}
*/
function maybeContentPropertyToken(token) {
	return token.type === "comment" || token.type === "tag" || token.type === "anchor";
}
//#endregion
export { maybeContentPropertyToken, tokens };

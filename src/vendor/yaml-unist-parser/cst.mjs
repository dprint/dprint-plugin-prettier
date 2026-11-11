// @nts-check
//#region src/cst.ts
/**
* Generator to iterate over tokens, skipping space and newline tokens.
* @param {...(import("yaml-cst-types").Token[] | null | undefined)} tokensArgs
* @returns {Generator<import("yaml-cst-types").Token>}
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
function isSpace(/** @type {import("yaml-cst-types").Token} */ token) {
	return token.type === "space" || token.type === "newline";
}
/**
* Type guard to check if a token is a content property token (comment, tag, or anchor).
* @returns {boolean}
*/
function maybeContentPropertyToken(/** @type {import("yaml-cst-types").Token} */ token) {
	return token.type === "comment" || token.type === "tag" || token.type === "anchor";
}
//#endregion
export { maybeContentPropertyToken, tokens };

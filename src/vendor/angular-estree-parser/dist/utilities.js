// @nts-check
//#region src/utilities.ts
function getCharacterSearchTestFunction(pattern) {
	/* c8 ignore next 3 @preserve */
	if (typeof pattern === "string") return (character) => character === pattern;
	return (character) => pattern.test(character);
}
function getCharacterIndex(text, pattern, fromIndex) {
	const test = getCharacterSearchTestFunction(pattern);
	for (let index = fromIndex; index < text.length; index++) {
		const character = text[index];
		if (test(character)) return index;
	}
	/* c8 ignore next 4 @preserve */
	throw new Error(`Cannot find character ${pattern} from index ${fromIndex} in ${JSON.stringify(text)}`);
}
/** @returns {string} */ function lowercaseFirst(/** @type {string} */ str) {
	return str.slice(0, 1).toLowerCase() + str.slice(1);
}
function sourceSpanToLocationInformation(span) {
	const { start, end } = span;
	return {
		start,
		end,
		range: [start, end]
	};
}
/** @returns {boolean} */ function isParenthesized(node) {
	return Boolean(node.extra?.parenthesized);
}
/** @returns {boolean} */ function isOptionalObjectOrCallee(node) {
	if (node.type === "TSNonNullExpression" && !isParenthesized(node)) return isOptionalObjectOrCallee(node.expression);
	return (node.type === "OptionalCallExpression" || node.type === "OptionalMemberExpression") && !isParenthesized(node);
}
//#endregion
export { getCharacterIndex, isOptionalObjectOrCallee, lowercaseFirst, sourceSpanToLocationInformation };

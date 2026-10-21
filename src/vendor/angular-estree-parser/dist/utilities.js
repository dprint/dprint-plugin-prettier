// @nts-check
//#region src/utilities.ts
/** @returns {(character: string) => boolean} */ function getCharacterSearchTestFunction(/** @type {string | RegExp} */ pattern) {
	/* c8 ignore next 3 @preserve */
	if (typeof pattern === "string") return (/** @type {string} */ character) => character === pattern;
	return (/** @type {string} */ character) => pattern.test(character);
}
/** @returns {number} */ function getCharacterIndex(/** @type {string} */ text, /** @type {string | RegExp} */ pattern, /** @type {number} */ fromIndex) {
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
/** @returns {{ start: number, end: number, range: number[] }} */ function sourceSpanToLocationInformation(/** @type {{ start: number, end: number }} */ span) {
	const { start, end } = span;
	return {
		start,
		end,
		range: [start, end]
	};
}
/** @returns {boolean} */ function isParenthesized(/** @type {import("./source.js").NGNode} */ node) {
	return Boolean(node.extra?.parenthesized);
}
/** @returns {boolean} */ function isOptionalObjectOrCallee(/** @type {import("./source.js").NGNode} */ node) {
	if (node.type === "TSNonNullExpression" && !isParenthesized(node)) return isOptionalObjectOrCallee(node.expression);
	return (node.type === "OptionalCallExpression" || node.type === "OptionalMemberExpression") && !isParenthesized(node);
}
//#endregion
export { getCharacterIndex, isOptionalObjectOrCallee, lowercaseFirst, sourceSpanToLocationInformation };

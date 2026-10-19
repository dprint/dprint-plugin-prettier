// @nts-check
//#region src/factories/block-value.ts
function createBlockValue(position, content, /** @type {string} */ chomping, /** @type {number | null} */ indent, /** @type {string} */ value, indicatorComment) {
	return {
		type: "blockValue",
		position,
		leadingComments: [],
		...content,
		chomping,
		indent,
		value,
		indicatorComment
	};
}
//#endregion
export { createBlockValue };

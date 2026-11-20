// @nts-check
//#region src/transforms/comment.ts
/** @returns {import("yaml-unist-types").YamlNode} */ function transformComment(/** @type {import("yaml-cst-types").Token} */ comment, /** @type {import("./context.mjs").default | undefined} */ context) {
	return {
		type: "comment",
		position: context.transformRange([comment.offset, comment.offset + comment.source.length]),
		value: comment.source.slice(1)
	};
}
//#endregion
export { transformComment };

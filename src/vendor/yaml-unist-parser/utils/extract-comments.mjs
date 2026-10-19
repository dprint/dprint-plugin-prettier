// @nts-check
import { tokens } from "../cst.mjs";
//#region src/utils/extract-comments.ts
/** @returns {any[]} */ function extractComments(/** @type {any[] | undefined} */ tokens$1, /** @type {import("../transforms/context.mjs").default | undefined} */ context) {
	const restNodes = [];
	for (const token of tokens(tokens$1)) if (token.type === "comment") context.transformComment(token);
	else restNodes.push(token);
	return restNodes;
}
//#endregion
export { extractComments };

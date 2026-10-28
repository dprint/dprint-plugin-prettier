// @nts-check
import { createAlias } from "../factories/alias.mjs";
import { extractComments } from "../utils/extract-comments.mjs";
//#region src/transforms/alias.ts
/** @returns {import("yaml-unist-types").YamlNode} */ function transformAlias(/** @type {import("../../yaml/browser/dist/nodes/Alias.js").Alias} */ alias, /** @type {import("./context.mjs").default} */ context, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	const srcToken = alias.srcToken;
	for (const token of extractComments(srcToken.end, context))
 // istanbul ignore next -- @preserve
	throw new Error(`Unexpected token type in alias end: ${token.type}`);
	return createAlias(context.transformRange(alias.range), context.transformContentProperties(alias, props.tokens), alias.source);
}
//#endregion
export { transformAlias };

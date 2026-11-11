// @nts-check
import { transformAstBlockValue } from "./block-value.mjs";
import { createBlockLiteral } from "../factories/block-literal.mjs";
//#region src/transforms/block-literal.ts
/** @returns {import("yaml-unist-types").YamlNode} */ function transformBlockLiteral(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar} */ blockLiteral, /** @type {import("./context.mjs").default} */ context, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	const srcToken = blockLiteral.srcToken;
	// istanbul ignore if -- @preserve
	if (!srcToken || srcToken.type !== "block-scalar") throw new Error("Expected block scalar srcToken");
	return createBlockLiteral(transformAstBlockValue(blockLiteral, srcToken, context, props));
}
//#endregion
export { transformBlockLiteral };

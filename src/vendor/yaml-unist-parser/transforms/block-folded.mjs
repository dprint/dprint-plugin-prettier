// @nts-check
import { createBlockFolded } from "../factories/block-folded.mjs";
import { transformAstBlockValue } from "./block-value.mjs";
//#region src/transforms/block-folded.ts
/** @returns {import("yaml-unist-types").YamlNode} */ function transformBlockFolded(/** @type {import("../../yaml/browser/dist/nodes/Scalar.js").Scalar} */ blockFolded, /** @type {import("./context.mjs").default} */ context, /** @type {import("yaml-unist-types").TransformProps} */ props) {
	const srcToken = blockFolded.srcToken;
	// istanbul ignore if -- @preserve
	if (!srcToken || srcToken.type !== "block-scalar") throw new Error("Expected block scalar srcToken");
	return createBlockFolded(transformAstBlockValue(blockFolded, srcToken, context, props));
}
//#endregion
export { transformBlockFolded };

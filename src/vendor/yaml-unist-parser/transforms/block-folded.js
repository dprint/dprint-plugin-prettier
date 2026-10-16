// @nts-check
import { createBlockFolded } from "../factories/block-folded.js";
import { transformAstBlockValue } from "./block-value.js";
export function transformBlockFolded(/** @type {import("../../yaml/resolveSeq-67caf78a.js").S} */ blockFolded, context) {
    return createBlockFolded(transformAstBlockValue(blockFolded, context));
}

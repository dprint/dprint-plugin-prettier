// @nts-check
import { createBlockLiteral } from "../factories/block-literal.js";
import { transformAstBlockValue } from "./block-value.js";
export function transformBlockLiteral(/** @type {import("../../yaml/resolveSeq-67caf78a.js").S} */ blockLiteral, context) {
    return createBlockLiteral(transformAstBlockValue(blockLiteral, context));
}

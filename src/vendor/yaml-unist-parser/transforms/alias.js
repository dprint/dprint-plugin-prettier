// @nts-check
import { createAlias } from "../factories/alias.js";
export function transformAlias(/** @type {import("../../yaml/resolveSeq-67caf78a.js").A} */ alias, context) {
    const cstNode = alias.cstNode;
    return createAlias(context.transformRange({
        origStart: cstNode.valueRange.origStart - 1,
        origEnd: cstNode.valueRange.origEnd,
    }), context.transformContent(alias), cstNode.rawValue);
}

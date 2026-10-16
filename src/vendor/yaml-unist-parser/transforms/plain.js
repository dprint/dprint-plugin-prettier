// @nts-check
import { createPlain } from "../factories/plain.js";
import { findLastCharIndex } from "../utils/find-last-char-index.js";
export function transformPlain(/** @type {import("../../yaml/resolveSeq-67caf78a.js").S} */ plain, context) {
    const cstNode = plain.cstNode;
    return createPlain(context.transformRange({
        origStart: cstNode.valueRange.origStart,
        origEnd: findLastCharIndex(context.text, cstNode.valueRange.origEnd - 1, /\S/) +
            1,
    }), context.transformContent(plain), cstNode.strValue);
}

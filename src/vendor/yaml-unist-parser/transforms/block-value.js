// @nts-check
import { createBlockValue } from "../factories/block-value.js";
import { getPointText } from "../utils/get-point-text.js";
import { transformContent } from "./content.js";
var Chomping;
(function (Chomping) {
    Chomping["CLIP"] = "clip";
    Chomping["STRIP"] = "strip";
    Chomping["KEEP"] = "keep";
})(Chomping || (Chomping = {}));
export function transformAstBlockValue(/** @type {import("../../yaml/resolveSeq-67caf78a.js").S} */ blockValue, context) {
    const cstNode = blockValue.cstNode;
    /** @type {number} */ const indicatorLength = 1;
    /** @type {number} */ const chompingLength = cstNode.chomping === "CLIP" ? 0 : 1;
    /** @type {number} */ const headerLength = cstNode.header.origEnd - cstNode.header.origStart;
    /** @type {boolean} */ const hasExplicitBlockIndent = headerLength - indicatorLength - chompingLength !== 0;
    const position = context.transformRange({
        origStart: cstNode.header.origStart,
        origEnd: cstNode.valueRange.origEnd,
    });
    let indicatorComment = null;
    const content = transformContent(blockValue, context, /** @returns {boolean} */ comment => {
        /** @type {boolean} */ const isIndicatorComment = position.start.offset < comment.position.start.offset &&
            comment.position.end.offset < position.end.offset;
        if (!isIndicatorComment) {
            return false;
        }
        // istanbul ignore next
        if (indicatorComment) {
            throw new Error(`Unexpected multiple indicator comments at ${getPointText(comment.position.start)}`);
        }
        indicatorComment = comment;
        return true;
    });
    return createBlockValue(position, content, Chomping[cstNode.chomping], hasExplicitBlockIndent ? cstNode.blockIndent : null, cstNode.strValue, indicatorComment);
}

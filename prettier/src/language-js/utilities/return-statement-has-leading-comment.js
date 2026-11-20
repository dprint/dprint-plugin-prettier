// @nts-check
import { getOrInsertComputed } from "../../utilities/get-or-insert.js";
import hasNewlineInRange from "../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../location/index.js";
import { hasLeadingOwnLineComment } from "../utilities/has-leading-own-line-comment.js";
import { CommentCheckFlags, hasComment } from "./comments.js";
import { getLeftSide, hasNakedLeftSide } from "./left-side.js";
import { isJsxElement } from "./node-types.js";

// This recurses the return argument, looking for the first token
// (the leftmost leaf node) and, if it (or its parents) has any
// leadingComments, returns true (so it can be wrapped in parens).
/** @returns {boolean} */ function returnArgumentHasLeadingCommentWithoutCache(/** @type {import("../types/estree.js").Node} */ node, /** @type {import("../../../../prettier/src/language-js/print-options.js").JsPrintOptions} */ options) {
  if (
    hasLeadingOwnLineComment(options.originalText, node) ||
    (hasComment(node, CommentCheckFlags.Leading, /** @returns {boolean} */ (comment) =>
      hasNewlineInRange(
        options.originalText,
        locStart(comment),
        locEnd(comment),
      ),
    ) &&
      !isJsxElement(node))
  ) {
    return true;
  }

  if (hasNakedLeftSide(node)) {
    let leftMost = node;
    /** @type {import("../types/estree.js").Node} */
    let newLeftMost;
    while ((newLeftMost = getLeftSide(leftMost))) {
      leftMost = newLeftMost;

      if (hasLeadingOwnLineComment(options.originalText, leftMost)) {
        return true;
      }
    }
  }

  return false;
}

const cache = new WeakMap();
/** @returns {boolean} */ function returnArgumentHasLeadingComment(/** @type {import("../types/estree.js").Node} */ node, options) {
  return getOrInsertComputed(cache, node, /** @returns {boolean} */ (/** @type {import("../types/estree.js").Node} */ node) =>
    returnArgumentHasLeadingCommentWithoutCache(node, options),
  );
}

export { returnArgumentHasLeadingComment };

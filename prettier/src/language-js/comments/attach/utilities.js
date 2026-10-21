// @nts-check
import {
  addDanglingComment,
  addLeadingComment,
} from "../../../main/comments/utilities.js";
import hasNewlineInRange from "../../../utilities/has-newline-in-range.js";
import { locEnd, locStart } from "../../location/index.js";
import {
  isBlockComment,
  isLineComment,
} from "../../utilities/comment-types.js";

/**
@import {Node, Comment, NodeMap} from "../../types/estree.js";
*/

/**
@param {import("../../types/estree.js").Comment} comment
@param {string} text
@returns {boolean}
*/
const isSingleLineBlockComment = (comment, text) =>
  isBlockComment(comment) &&
  !hasNewlineInRange(text, locStart(comment), locEnd(comment));

/**
@param {import("../../types/estree.js").Comment} comment
@param {string} text
@returns {boolean}
*/
const isSingleLineComment = (comment, text) =>
  isLineComment(comment) || isSingleLineBlockComment(comment, text);

/**
 * @param {Node} node
 * @returns {void}
 */
function addBlockOrNotComment(node, /** @type {import("../../types/estree.js").Comment} */ comment) {
  if (node.type === "BlockStatement") {
    addBlockStatementFirstComment(node, comment);
  } else {
    addLeadingComment(node, comment);
  }
}

/**
 * @param {Node} node
 * @returns {void}
 */
function addBlockStatementFirstComment(node, /** @type {import("../../types/estree.js").Comment} */ comment) {
  // @ts-expect-error
  const firstNonEmptyNode = (node.body || node.properties).find(
    /** @returns {boolean} */ ({ type }) => type !== "EmptyStatement",
  );
  if (firstNonEmptyNode) {
    addLeadingComment(firstNonEmptyNode, comment);
  } else {
    addDanglingComment(node, comment);
  }
}

export {
  addBlockOrNotComment,
  addBlockStatementFirstComment,
  isSingleLineBlockComment,
  isSingleLineComment,
};

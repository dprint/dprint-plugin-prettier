// @nts-check
import { addLeadingComment } from "../../../main/comments/utilities.js";
import { locStart } from "../../location/index.js";
import { stripComments } from "../../utilities/strip-comments.js";

/** @returns {boolean} */ function handleForXStatementComments({
  comment,
  enclosingNode,
  followingNode,
  options,
}) {
  if (
    (enclosingNode?.type === "ForInStatement" ||
      enclosingNode?.type === "ForOfStatement" ||
      enclosingNode?.type === "ForStatement") &&
    followingNode &&
    followingNode === enclosingNode.body
  ) {
    const closingParenthesisIndex = stripComments(options).lastIndexOf(
      ")",
      locStart(followingNode),
    );

    if (locStart(comment) > closingParenthesisIndex) {
      addLeadingComment(followingNode, comment);
      return true;
    }
  }

  return false;
}

export { handleForXStatementComments };

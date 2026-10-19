import { CommentCheckFlags, hasComment } from "./comments.js";

/** @returns {boolean} */ function hasNodeIgnoreComment(node) {
  return (
    node?.prettierIgnore || hasComment(node, CommentCheckFlags.PrettierIgnore)
  );
}

export { hasNodeIgnoreComment };

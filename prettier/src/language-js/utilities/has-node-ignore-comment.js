import { CommentCheckFlags, hasComment } from "./comments.js";

/** @returns {boolean} */ function hasNodeIgnoreComment(/** @type {import("../types/estree.js").Node} */ node) {
  return (
    node?.prettierIgnore || hasComment(node, CommentCheckFlags.PrettierIgnore)
  );
}

export { hasNodeIgnoreComment };

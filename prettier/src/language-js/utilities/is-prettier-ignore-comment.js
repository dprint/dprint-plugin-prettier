/** @returns {boolean} */ function isPrettierIgnoreComment(/** @type {import("../types/estree.js").Comment} */ comment) {
  return comment.value.trim() === "prettier-ignore" && !comment.unignore;
}

export { isPrettierIgnoreComment };

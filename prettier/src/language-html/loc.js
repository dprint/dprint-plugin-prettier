// @nts-check
/** @returns {number} */ function locStart(/** @type {import("./ast.js").Node} */ node) {
  return node.sourceSpan.start.offset;
}

/** @returns {number} */ function locEnd(/** @type {import("./ast.js").Node} */ node) {
  return node.sourceSpan.end.offset;
}

export { locEnd, locStart };

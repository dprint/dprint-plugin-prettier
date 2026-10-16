// @nts-check
/** @returns {number} */ function locStart(node) {
  return node.loc.start.offset;
}

/** @returns {number} */ function locEnd(node) {
  return node.loc.end.offset;
}

export { locEnd, locStart };

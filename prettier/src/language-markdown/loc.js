// @nts-check
/** @returns {number} */ function locStart(node) {
  return node.position.start.offset;
}

/** @returns {number} */ function locEnd(node) {
  return node.position.end.offset;
}

export { locEnd, locStart };

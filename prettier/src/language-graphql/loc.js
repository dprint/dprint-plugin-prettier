// @nts-check
/** @returns {number} */ function locStart(nodeOrToken) {
  return nodeOrToken.loc.start;
}

/** @returns {number} */ function locEnd(nodeOrToken) {
  return nodeOrToken.loc.end;
}

export { locEnd, locStart };

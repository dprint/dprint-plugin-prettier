// @nts-check
/** @returns {string} */ function getRaw(/** @type {import("../types/estree.js").Node} */ node) {
  return node.extra?.raw ?? node.raw;
}

export { getRaw };

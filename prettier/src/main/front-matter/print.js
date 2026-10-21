// @nts-check
/** @returns {string} */ function printFrontMatter(/** @type {import("../../common/ast-path.js").default} */ { node }) {
  return node.raw;
}

export default printFrontMatter;

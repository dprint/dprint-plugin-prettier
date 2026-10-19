// @nts-check
/** @returns {string} */ function printFrontMatter({ node }) {
  return node.raw;
}

export default printFrontMatter;

// @nts-check
const getValueRoot = /** @returns {import("../types.js").CssNode} */ (/** @type {import("../types.js").CssNode} */ node) => {
  while (node.parent) {
    node = node.parent;
  }

  return node;
};

export default getValueRoot;

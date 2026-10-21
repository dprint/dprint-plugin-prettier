const getValueRoot = (/** @type {import("../types.js").CssNode} */ node) => {
  while (node.parent) {
    node = node.parent;
  }

  return node;
};

export default getValueRoot;

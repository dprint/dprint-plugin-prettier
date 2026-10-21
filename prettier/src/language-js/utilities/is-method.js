/** @returns {boolean} */ function isMethod(/** @type {import("../types/estree.js").Node} */ node) {
  return (
    (node.method && node.kind === "init") ||
    node.kind === "get" ||
    node.kind === "set"
  );
}

export { isMethod };

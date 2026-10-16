// @nts-check
const nonTraversableKeys = new Set([
  "tokens",
  "comments",
  "parent",
  "enclosingNode",
  "precedingNode",
  "followingNode",
]);

const defaultGetVisitorKeys = (node) =>
  Object.keys(node).filter((key) => !nonTraversableKeys.has(key));

function createGetVisitorKeysFunction(/** @type {(a0?: any, a1?: any) => any} */ printerGetVisitorKeys) {
  return printerGetVisitorKeys
    ? /** @returns {any[]} */ (node) => printerGetVisitorKeys(node, nonTraversableKeys)
    : defaultGetVisitorKeys;
}

export default createGetVisitorKeysFunction;

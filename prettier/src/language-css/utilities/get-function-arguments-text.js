// @nts-check
import getValueRoot from "./get-value-root.js";

/**
 * @param {import("../types.js").CssNode} node
 * @returns {string}
 */
function getFunctionArgumentsText(node) {
  return getValueRoot(node)
    .text.slice(/** @type {number} */ (node.group.open.sourceIndex) + 1, node.group.close.sourceIndex)
    .trim();
}

export default getFunctionArgumentsText;

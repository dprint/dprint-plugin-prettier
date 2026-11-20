// @nts-check
/** @import { CssOptions } from "./index.js" */
/** @returns {boolean} */ function isSCSSVariable(/** @type {import("../types.js").CssNode} */ node, /** @type {CssOptions} */ options) {
  return Boolean(
    options.parser === "scss" &&
    node?.type === "word" &&
    node.value.startsWith("$"),
  );
}

export default isSCSSVariable;
